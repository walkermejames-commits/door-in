import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const actorId = claims?.claims?.sub;
    if (typeof actorId !== "string") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const admin = createAdminClient();
    const { data: actor } = await admin.from("users").select("role").eq("id", actorId).maybeSingle();
    if (!actor || actor.role !== "admin") return NextResponse.json({ error: "Administrator access required to approve drivers." }, { status: 403 });
    const { id } = await params;
    const { data: application, error: findError } = await admin.from("driver_profiles").select("user_id").eq("user_id", id).single();
    if (findError) throw findError;
    const { error: profileError } = await admin.from("users").update({ role: "driver" }).eq("id", application.user_id);
    if (profileError) throw profileError;
    const { error: driverError } = await admin.from("driver_profiles").update({ status: "approved", onboarding_status: "approved", onboarding_completed_at: new Date().toISOString(), current_availability: false }).eq("user_id", application.user_id);
    if (driverError) throw driverError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not approve driver." }, { status: 400 });
  }
}
