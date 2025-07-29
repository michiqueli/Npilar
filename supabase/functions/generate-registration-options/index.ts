import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { generateRegistrationOptions } from 'https://deno.land/x/simplewebauthn/deno/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Maneja las solicitudes pre-vuelo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crea un cliente de Supabase autenticado con el token del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Obtiene el usuario a partir del token de autorización
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Usuario no encontrado")

    // Busca las credenciales existentes para no volver a registrar el mismo dispositivo
    const { data: existingCredentials, error } = await supabaseClient
      .from('user_credentials')
      .select('credential_id, transports')
      .eq('user_id', user.id)
    if (error) throw error

    // Genera las opciones de registro
    const options = await generateRegistrationOptions({
      rpName: 'N-Pilar App',
      rpID: new URL(Deno.env.get('SUPABASE_URL')!).hostname,
      userID: user.id,
      userName: user.email!,
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports,
      })),
    })

    // Guarda el desafío en la tabla de usuarios para verificarlo después
    // NOTA: Necesitarás una columna 'challenge' de tipo TEXT en tu tabla `auth.users`
    // Esto se puede hacer desde el SQL Editor de Supabase.
    // await supabaseClient.from('users').update({ challenge: options.challenge }).eq('id', user.id)
    // Por ahora, lo guardaremos en una tabla temporal o lo manejaremos de otra forma si no puedes modificar auth.users

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})