import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type PlatformRole = "buyer" | "driver" | "admin";
export type Profile = { id: string; role: PlatformRole; full_name: string };

export async function requireProfile(nextPath: string) {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;
  if (claimError || typeof userId !== "string") redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("id, role, full_name").eq("id", userId).maybeSingle();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}&setup=1`);
  return { supabase: admin, profile: profile as Profile };
}

export async function requireRole(nextPath: string, allowed: PlatformRole[]) {
  const context = await requireProfile(nextPath);
  if (!allowed.includes(context.profile.role)) redirect(`/access-denied?next=${encodeURIComponent(nextPath)}`);
  return context;
}
