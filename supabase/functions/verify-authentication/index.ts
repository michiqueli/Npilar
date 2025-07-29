import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAuthenticationResponse } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    // Usamos la SERVICE_ROLE_KEY para poder crear una sesión en nombre del usuario
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    
    // Necesitamos recuperar el 'challenge' y la credencial guardada
    // const { data: userWithChallenge } = await supabaseAdmin.from('users').select('challenge').eq('id', body.userId).single()
    const { data: cred, error: credError } = await supabaseAdmin.from('user_credentials').select('*').eq('credential_id', body.id).single()
    if (credError || !cred) throw new Error("Credencial no encontrada");

    const verification = await verifyAuthenticationResponse({
      response: body.assertionResponse,
      expectedChallenge: body.challenge, // Asumimos que el frontend nos devuelve el desafío
      expectedOrigin: new URL(req.headers.get('origin')!).origin,
      expectedRPID: new URL(Deno.env.get('SUPABASE_URL')!).hostname,
      authenticator: {
        ...cred,
        credentialPublicKey: JSON.parse(cred.credential_public_key), // Convertimos de JSON string a objeto
      },
    })

    if (verification.verified) {
      await supabaseAdmin.from('user_credentials').update({ counter: verification.authenticationInfo.newCounter }).eq('id', cred.id)
      
      // Si la verificación es exitosa, creamos una sesión de Supabase para el usuario
      const { data: sessionData, error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: (await supabaseAdmin.from('users').select('email').eq('id', cred.user_id).single()).data.email,
      })
      if(error) throw error

      return new Response(JSON.stringify(sessionData.properties), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
      throw new Error("La verificación de la autenticación falló.")
    }
  } catch(error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})