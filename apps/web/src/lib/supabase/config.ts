/**
 * Supabase is OPTIONAL at runtime. When these env vars are absent the app runs
 * in local mode (localStorage) — the $0/offline/demo path. When present, the
 * cloud data layer activates. This keeps Sprint 1's no-keys experience alive.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
