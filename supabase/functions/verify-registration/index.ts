import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyRegistrationResponse } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
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

    const body = await req.json()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Usuario no encontrado")

    // Aquí necesitaríamos recuperar el 'challenge' guardado en el paso anterior.
    // Asumiremos que lo pasas en el cuerpo de la petición por ahora.
    const expectedChallenge = body.challenge; 

    const verification = await verifyRegistrationResponse({
      response: body.attestationResponse,
      expectedChallenge: expectedChallenge,
      expectedOrigin: new URL(req.headers.get('origin')!).origin,
      expectedRPID: new URL(Deno.env.get('SUPABASE_URL')!).hostname,
    })

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter, transports } = verification.registrationInfo
      
      const { error } = await supabaseClient.from('user_credentials').insert({
        user_id: user.id,
        credential_id: credentialID,
        credential_public_key: JSON.stringify(credentialPublicKey), // Guardamos como JSON string
        counter,
        transports,
      })
      if (error) throw error

      return new Response(JSON.stringify({ verified: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
      throw new Error('La verificación de la credencial falló.')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})