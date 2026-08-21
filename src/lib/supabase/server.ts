import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        try { entries.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server Components cannot write cookies. proxy.ts refreshes sessions. */ }
      },
    },
  });
}

/**
 * Server-only database client. Never import this from a Client Component and
 * never expose SUPABASE_SERVICE_ROLE_KEY as a NEXT_PUBLIC_ variable.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server database access is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
