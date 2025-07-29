import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { generateAuthenticationOptions } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Para el login, el usuario aún no está autenticado, así que no podemos usar getUser().
    // El frontend debería enviar el email del usuario que intenta iniciar sesión.
    const { email } = await req.json();
    if (!email) throw new Error("Email no proporcionado");

    const { data: user, error: userError } = await supabaseClient.from('users').select('id').eq('email', email).single();
    if (userError || !user) throw new Error("Usuario no encontrado");

    const { data: userCredentials, error: credsError } = await supabaseClient.from('user_credentials').select('*').eq('user_id', user.id)
    if(credsError) throw credsError;

    const options = await generateAuthenticationOptions({
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports,
      })),
    })

    // Guardar el desafío para verificarlo después
    // await supabaseClient.from('users').update({ challenge: options.challenge }).eq('id', user.id)

    return new Response(JSON.stringify(options), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch(error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})