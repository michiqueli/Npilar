// En: supabase/functions/verify-and-book/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import dayjs from 'https://esm.sh/dayjs'
import utc from 'https://esm.sh/dayjs/plugin/utc.js'
import timezone from 'https://esm.sh/dayjs/plugin/timezone.js'

// --- CORRECCIÓN: Extendemos dayjs con los plugins ---
dayjs.extend(utc)
dayjs.extend(timezone)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, code, serviceId, appointmentAt, hourIndex } = await req.json()
    if (!phone || !code || !serviceId || !appointmentAt || hourIndex === undefined) {
      throw new Error("Faltan datos para agendar la cita.")
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // La lógica de verificación de código y de cliente se mantiene igual...
    const fiveMinutesAgo = dayjs().subtract(5, 'minutes').toISOString()
    const { data: verification, error: verificationError } = await supabaseAdmin.from('phone_verifications').select('id').eq('phone', phone).eq('code', code).gte('created_at', fiveMinutesAgo).single()
    if (verificationError || !verification) { throw new Error("El código de verificación es incorrecto o ha expirado.") }
    await supabaseAdmin.from('phone_verifications').delete().eq('id', verification.id)

    let { data: client, error: clientError } = await supabaseAdmin.from('clients').select('id, name').eq('phone', phone).single()
    if (clientError && clientError.code !== 'PGRST116') { throw clientError }
    if (!client) {
      const { data: newClient, error: newClientError } = await supabaseAdmin.from('clients').insert({ name: `Cliente ${phone.slice(-4)}`, phone: phone }).select('id, name').single()
      if (newClientError) throw newClientError
      client = newClient
    }
    
    const { data: service, error: serviceError } = await supabaseAdmin.from('services').select('duration_min, sale_price').eq('id', serviceId).single()
    if (serviceError || !service) throw new Error("Servicio no encontrado.")

    // --- CORRECCIÓN: Reconstruimos la fecha y hora usando la zona horaria de Argentina ---
    const argentinaTimezone = 'America/Argentina/Buenos_Aires';
    
    // 1. Tomamos la fecha enviada por el cliente y la interpretamos en la zona horaria correcta
    const appointmentDate = dayjs(appointmentAt).tz(argentinaTimezone);
    
    // 2. Calculamos los minutos desde el inicio del día laboral (8:00 AM)
    const totalMinutes = 8 * 60 + hourIndex * 15;

    // 3. Creamos la fecha y hora de la cita, asegurándonos de que sea en la hora local correcta
    const appointmentStart = appointmentDate.startOf('day').add(totalMinutes, 'minute');
    const appointmentEnd = appointmentStart.add(service.duration_min, 'minute');


    // La lógica para verificar solapamientos se mantiene...
    const { data: overlappingAppointments, error: overlapError } = await supabaseAdmin.from('appointments').select('id').lt('appointment_at', appointmentEnd.toISOString()).gt('appointment_at', appointmentStart.subtract(14, 'minutes').toISOString())
    if(overlapError) throw overlapError
    if(overlappingAppointments && overlappingAppointments.length > 0) { throw new Error("El horario acaba de ser ocupado. Por favor, elige otro.") }

    // 4. Creamos la cita. El .toISOString() la convertirá a UTC para guardarla, que es lo correcto.
    const newAppointmentForDB = {
      client_id: client.id,
      service_id: serviceId,
      appointment_at: appointmentStart.toISOString(),
      status: 'SCHEDULED',
      price_at_time: service.sale_price,
      duration_at_time_minutes: service.duration_min,
      notes: 'Cita reservada online',
    };

    const { data: finalAppointment, error: insertAppointmentError } = await supabaseAdmin.from('appointments').insert(newAppointmentForDB).select('*').single()
    if(insertAppointmentError) throw insertAppointmentError

    return new Response(JSON.stringify(finalAppointment), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Error en la Edge Function (verify-and-book):", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})