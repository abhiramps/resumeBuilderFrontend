
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', { url: supabaseUrl, hasKey: !!supabaseAnonKey });

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Auth will fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
