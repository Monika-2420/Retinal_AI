import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-supabase-url')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DatabaseStatus {
  isConfigured: boolean;
  provider: 'supabase' | 'local_persistent';
  url?: string;
  storageReady: boolean;
}

export function getDatabaseStatus(): DatabaseStatus {
  return {
    isConfigured: isSupabaseConfigured,
    provider: isSupabaseConfigured ? 'supabase' : 'local_persistent',
    url: isSupabaseConfigured ? supabaseUrl : undefined,
    storageReady: true,
  };
}
