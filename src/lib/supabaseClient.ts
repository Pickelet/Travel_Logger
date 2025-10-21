import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const stripQuotes = (value: string | undefined): string | undefined => {
  if (!value) return value;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const normalizeUrl = (value: string | undefined): string | undefined => {
  const trimmed = stripQuotes(value);
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, '')}`;
  }
  return trimmed.replace(/\/+$/, '');
};

const supabaseUrl = normalizeUrl(rawSupabaseUrl);
const supabaseAnonKey = stripQuotes(rawSupabaseAnonKey);

let client: SupabaseClient | null = null;
let initializationError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  initializationError = 'Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
  console.error(initializationError);
} else {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    initializationError =
      error instanceof Error
        ? error.message
        : 'Unknown error while creating the Supabase client.';
    console.error(initializationError);
  }
}

export const supabase = client;
export const supabaseInitError = initializationError;
