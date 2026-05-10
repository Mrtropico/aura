// supabase/functions/delete-account/index.ts
//
// Edge Function de suppression complète d'un compte AURA.
// Sécurité : nécessite un Bearer token valide (utilisateur authentifié).
// Effet : supprime le profil + cascade RLS sur toutes les tables liées,
// puis supprime l'entrée auth.users via la service_role_key.
//
// Déploiement :
//   npx supabase functions deploy delete-account --project-ref rsxgvutnpfkebjnutjyl
//
// Variables d'env requises (auto-injectées par Supabase) :
//   - SUPABASE_URL
//   - SUPABASE_ANON_KEY
//   - SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS — à restreindre au domaine de production une fois en ligne.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Préflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client "user" : valide le token et identifie l'utilisateur appelant
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client "admin" : pour supprimer dans auth.users (privilège service_role)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Supprimer le profil — déclenche les cascades RLS sur les tables liées
    //    (artworks, sales, finances, members, follows, map_activities, feed_events)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      return new Response(JSON.stringify({ error: `Profile deletion failed: ${profileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Supprimer l'entrée auth.users — libère l'email pour réinscription
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authError) {
      return new Response(JSON.stringify({ error: `Auth deletion failed: ${authError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Account fully deleted' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
