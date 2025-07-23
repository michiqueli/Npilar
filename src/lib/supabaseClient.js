import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno usando import.meta.env (para Vite).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos el cliente de Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);