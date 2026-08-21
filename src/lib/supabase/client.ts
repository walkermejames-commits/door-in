"use client";

import { createBrowserClient } from "@supabase/ssr";

// These values are public browser configuration, not privileged credentials.
// The service-role key remains available only to server-side code.
const publicSupabaseUrl = "https://djmkqmvpmhhozzguhqot.supabase.co";
const publicSupabaseKey = "sb_publishable_ECcxS2VW9JNAmAMZiEnZmw_To_LW51K";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || publicSupabaseUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || publicSupabaseKey;
  return createBrowserClient(url, key);
}
