import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://acsqneuzkukmvtfmbphb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3FuZXV6a3VrbXZ0Zm1icGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTc3MzQsImV4cCI6MjA2ODIzMzczNH0.YPi7bwjLsvEzqa8tBH05DU3yN0yPSH-qHNnEqKI2BR8';

console.log('[KolayFit] Supabase URL:', SUPABASE_URL);
console.log('[KolayFit] Supabase Key:', SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('[KolayFit] Missing Supabase credentials!');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(90000)
      });
    }
  }
});

console.log('[KolayFit] Supabase client initialized');