import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export async function signInAdmin() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    console.log("Ya existe una sesión activa.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (error) {
    console.error("Error al iniciar sesión como administrador:", error.message);
    return;
  }

  console.log("Inicio de sesión de administrador exitoso!");
}