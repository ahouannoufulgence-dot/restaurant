import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Liste blanche stricte des origines autorisées
const ALLOWED_ORIGINS = [
  "https://ais-dev-swlzniocfr3yrn6acel4hb-3872189289.europe-west2.run.app",
  "https://ais-pre-swlzniocfr3yrn6acel4hb-3872189289.europe-west2.run.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const { restaurant_id, pin_code } = await req.json();

    if (!restaurant_id || !pin_code) {
      return new Response(
        JSON.stringify({ error: "restaurant_id et pin_code requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Contrôle Anti-Brute-Force (Rate Limiting : Max 5 échecs en 15 min)
    const { data: rateCheck } = await adminSupabase.rpc("check_pin_rate_limit", {
      p_organization_id: restaurant_id,
    });

    if (rateCheck === false) {
      return new Response(
        JSON.stringify({
          error: "Trop de tentatives infructueuses. Accès temporairement bloqué (15 min)."
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Vérification du PIN soumis contre TOUS les membres du restaurant via RPC
    const { data: pinVerification, error: pinErr } = await adminSupabase.rpc("verify_staff_pin", {
      p_organization_id: restaurant_id,
      p_pin_code: pin_code,
    });

    const isPinValid = pinVerification && pinVerification.length > 0 && pinVerification[0].is_valid;

    // SI LE PIN EST INCORRECT : Enregistrer l'échec et renvoyer 401
    if (pinErr || !isPinValid) {
      await adminSupabase.from("pin_auth_attempts").insert({
        organization_id: restaurant_id,
        success: false,
      });

      return new Response(
        JSON.stringify({ error: "Code PIN invalide pour cet établissement." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifiedUserId = pinVerification[0].user_id;
    const verifiedRole = pinVerification[0].role || "employee";

    // 3. Récupération du compte Supabase Auth associé
    const { data: userData, error: userFetchErr } = await adminSupabase.auth.admin.getUserById(verifiedUserId);

    if (userFetchErr || !userData.user) {
      await adminSupabase.from("pin_auth_attempts").insert({
        organization_id: restaurant_id,
        success: false,
      });
      return new Response(
        JSON.stringify({ error: "Compte utilisateur introuvable pour ce PIN." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUser = userData.user;

    // 4. Génération du lien de connexion à usage unique
    const { data: linkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: authUser.email!,
    });

    if (linkErr || !linkData.properties) {
      await adminSupabase.from("pin_auth_attempts").insert({
        organization_id: restaurant_id,
        success: false,
      });
      throw new Error("Échec de génération de session sécurisée : " + linkErr?.message);
    }

    // Succès
    await adminSupabase.from("pin_auth_attempts").insert({
      organization_id: restaurant_id,
      success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        action_link: linkData.properties.action_link,
        hashed_token: linkData.properties.hashed_token,
        email: authUser.email,
        user_id: authUser.id,
        role: verifiedRole,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur interne Edge Function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
