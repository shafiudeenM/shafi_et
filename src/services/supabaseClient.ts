import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization and safe environment variable + localStorage extraction
const getStoredUrl = (): string => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  return (env.VITE_SUPABASE_URL || localStorage.getItem('tntet_supabase_url') || '').trim();
};

const getStoredAnonKey = (): string => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  return (env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('tntet_supabase_anon_key') || '').trim();
};

let clientInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const url = getStoredUrl();
  const key = getStoredAnonKey();
  return Boolean(
    url && 
    key && 
    url.startsWith('http') && 
    !url.includes('placeholder')
  );
};

export const getSupabaseConfig = () => {
  return {
    url: getStoredUrl(),
    key: getStoredAnonKey(),
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('tntet_supabase_url', url.trim());
  localStorage.setItem('tntet_supabase_anon_key', anonKey.trim());
  clientInstance = null; // reset client to reinitialize
};

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    const url = getStoredUrl();
    const key = getStoredAnonKey();
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};
