import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const admin = createAdminClient();
    const { data: actor } = await admin.from("users").select("role").eq("id", userId).maybeSingle();
    if (actor?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const { id } = await params;
    const { data: booking, error: findError } = await admin.from("bookings").select("id, status, accepted_price").eq("id", id).single();
    if (findError || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (booking.status !== "quote_requested") return NextResponse.json({ error: "Only quote requests can be issued from this controller." }, { status: 409 });
    const { error: updateError } = await admin.from("bookings").update({ status: "awaiting_payment", payment_status: "payment_pending" }).eq("id", id);
    if (updateError) throw updateError;
    const { error: eventError } = await admin.from("status_events").insert({ booking_id: id, previous_status: "quote_requested", new_status: "awaiting_payment", actor_user_id: userId, actor_role: "admin", note: `Test quote issued for £${Number(booking.accepted_price ?? 0).toFixed(2)}` });
    if (eventError) throw eventError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not issue quote." }, { status: 400 });
  }
}
