import { createClient } from '@supabase/supabase-js';

// Variables de entorno - se configuran en .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
