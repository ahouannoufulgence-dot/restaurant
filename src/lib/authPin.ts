import { getSupabase } from './supabase';

/**
 * Clean Zéro-Trust PIN Authentication Handler:
 * - Calls Edge Function 'authenticate-pin' (Server-side handling with Service Role Key)
 * - Has ZERO password math on the client.
 * - Supports automatic rate limiting and session token exchanges.
 */
export async function authenticateWithPin(restaurantId: string, pinCode: string) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase client indisponible' };
  }

  const cleanRestoId = (restaurantId || 'rest_pirogue').trim();
  const cleanPin = (pinCode || '1234').trim();

  try {
    // 1. Invocation de l'Edge Function serveur sécurisée avec service_role
    const { data, error } = await supabase.functions.invoke('authenticate-pin', {
      body: {
        restaurant_id: cleanRestoId,
        pin_code: cleanPin,
      },
    });

    if (error || !data || !data.success) {
      const errorMsg = error?.message || data?.error || 'Code PIN incorrect ou accès restreint';
      console.warn('❌ Échec Authentification PIN Serveur:', errorMsg);
      return { success: false, error: errorMsg };
    }

    // 2. Si l'Edge Function renvoie le lien magique, on extrait ou valide la session
    if (data.action_link) {
      // Conversion directe du lien magique ou échange de token
      const url = new URL(data.action_link);
      const token = url.searchParams.get('token') || data.hashed_token;
      
      if (token) {
        const { data: sessionData, error: verifyErr } = await supabase.auth.verifyOtp({
          email: data.email,
          token,
          type: 'magiclink',
        });

        if (!verifyErr && sessionData.session) {
          console.log('✅ Session Supabase Auth activée avec succès ! auth.uid() =', sessionData.session.user.id);
          return {
            success: true,
            user: sessionData.session.user,
            session: sessionData.session,
            userId: sessionData.session.user.id,
          };
        }
      }
    }

    // 3. Fallback direct : Vérification de l'état Auth courant
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      return {
        success: true,
        user: userData.user,
        userId: userData.user.id,
      };
    }

    return { success: false, error: 'Échec de finalisation de la session authentifiée.' };
  } catch (err: any) {
    console.error('Erreur réseau ou Edge Function PIN:', err);
    return { success: false, error: err.message || 'Erreur d\'authentification serveur' };
  }
}

/**
 * Obtenir l'utilisateur actuellement connecté via Supabase Auth
 */
export async function getCurrentAuthUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}
