// En: supabase/functions/send-verification-code/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()
    if (!phone) throw new Error("El número de teléfono es requerido.")

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
  
    
    // --- 1. OBTENEMOS LAS CREDENCIALES DE TWILIO DE FORMA SEGURA ---
    const accountSid = Deno.env.get('twiio_sid')!
    const authToken = Deno.env.get('twiio_auth_token')!
    const fromNumber = Deno.env.get('twiio_number')!

    console.log(accountSid, authToken, fromNumber)

    // 2. GENERAMOS EL CÓDIGO Y LO GUARDAMOS EN LA BASE DE DATOS
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    const { error: insertError } = await supabaseAdmin
      .from('phone_verifications')
      .insert({ phone, code: verificationCode })
      
    if (insertError) throw insertError

    // --- 3. CONSTRUIMOS LA LLAMADA DIRECTA A LA API DE TWILIO ---
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    // El cuerpo de la petición debe ser 'URL encoded'
    const body = new URLSearchParams({
      To: phone,
      From: fromNumber,
      Body: `Tu código de verificación para la peluquería es: ${verificationCode}`
    })

    // Creamos el header de autenticación
    const authHeader = `Basic ${btoa(`${accountSid}:${authToken}`)}` // btoa() encripta en Base64

    // 4. EJECUTAMOS LA LLAMADA CON FETCH
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Error de Twilio: ${errorData.message}`)
    }

    // 5. RESPONDEMOS AL FRONTEND CON ÉXITO
    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Error en la Edge Function:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})