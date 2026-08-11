import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-migration-secret",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Vérification du Secret de Migration (x-migration-secret)
    const migrationSecret = Deno.env.get("MIGRATION_SECRET");
    const providedSecret = req.headers.get("x-migration-secret");

    if (!migrationSecret || !providedSecret || providedSecret !== migrationSecret) {
      return new Response(
        JSON.stringify({ error: "Non autorisé. Clé 'x-migration-secret' invalide ou manquante." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Extraction du paramètre optionnel "test_restaurant_id" (URL query params ou Body JSON)
    const url = new URL(req.url);
    let testRestaurantId = url.searchParams.get("test_restaurant_id");

    if (!testRestaurantId && req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.test_restaurant_id) {
          testRestaurantId = body.test_restaurant_id;
        }
      } catch (_) {
        // Pas de body JSON valide, poursuit sans filtre
      }
    }

    // 3. Récupération des établissements à migrer depuis registered_restaurants
    let query = adminSupabase.from("registered_restaurants").select("*");
    if (testRestaurantId) {
      query = query.eq("id", testRestaurantId);
    }

    const { data: restaurantsToMigrate, error: fetchErr } = await query;

    if (fetchErr) {
      throw new Error("Erreur de lecture des restaurants : " + fetchErr.message);
    }

    if (!restaurantsToMigrate || restaurantsToMigrate.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Aucun restaurant trouvé pour la migration.", 
          filter: testRestaurantId || "tous" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Exécution séquentielle de la migration pour chaque restaurant
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const results: Array<{ id: string; name: string; status: string; userId?: string }> = [];

    for (const resto of restaurantsToMigrate) {
      const restoId = resto.id;
      const restoName = resto.name || "Restaurant Sans Nom";
      const pinCode = (resto.pin_code || "1234").toString().trim();
      const internalEmail = `staff_${restoId}@restoflow.internal`;

      // A. Assurer l'existence dans la table `restaurants`
      await adminSupabase.from("restaurants").upsert({
        id: restoId,
        name: restoName,
        is_active: true,
      });

      // B. Vérifier si l'utilisateur Supabase Auth existe déjà
      let authUser = userList.users.find((u) => u.email === internalEmail);

      // C. Si inexistant, créer le compte via l'API Admin de Supabase
      if (!authUser) {
        const randomPassword = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "") + "!Aa9";

        const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
          email: internalEmail,
          password: randomPassword,
          email_confirm: true,
          user_metadata: {
            restaurant_id: restoId,
            role: "owner",
          },
        });

        if (createErr || !newUser.user) {
          results.push({ id: restoId, name: restoName, status: `Échec création Auth: ${createErr?.message}` });
          continue;
        }

        authUser = newUser.user;
      }

      // D. Créer l'association dans `organization_members`
      await adminSupabase.from("organization_members").upsert({
        organization_id: restoId,
        user_id: authUser.id,
        role: "owner",
        is_active: true,
      });

      // E. Stocker le PIN haché dans `staff_pin_credentials` via RPC
      const { error: rpcErr } = await adminSupabase.rpc("set_staff_pin_hash", {
        p_organization_id: restoId,
        p_user_id: authUser.id,
        p_pin_code: pinCode,
        p_role: "owner",
      });

      if (rpcErr) {
        results.push({ id: restoId, name: restoName, status: `Échec hachage PIN: ${rpcErr.message}` });
      } else {
        results.push({ id: restoId, name: restoName, status: "Migré avec succès", userId: authUser.id });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        migrated_count: results.filter(r => r.status === "Migré avec succès").length,
        total_processed: results.length,
        details: results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur lors de l'exécution de la migration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
