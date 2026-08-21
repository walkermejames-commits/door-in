import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Context) {
  try {
    if (process.env.FAKE_PAYMENTS_ENABLED !== "true") return NextResponse.json({ error: "Fake payments are disabled." }, { status: 403 });
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { id } = await params;
    const admin = createAdminClient();
    const { data: booking, error: findError } = await admin.from("bookings").select("id, buyer_id, status, accepted_price, service_brand").eq("id", id).single();
    if (findError || !booking || booking.buyer_id !== userId) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (booking.status !== "awaiting_payment") return NextResponse.json({ error: "This booking is not ready for payment." }, { status: 409 });
    const { data: existingPayment } = await admin.from("payments").select("id").eq("booking_id", id).maybeSingle();
    if (existingPayment) {
      const { error } = await admin.from("payments").update({ amount: Number(booking.accepted_price ?? 0), status: "paid" }).eq("id", existingPayment.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("payments").insert({ booking_id: id, amount: Number(booking.accepted_price ?? 0), status: "paid", currency: "gbp" });
      if (error) throw error;
    }
    const { error: bookingError } = await admin.from("bookings").update({ status: "paid_awaiting_dispatch", payment_status: "paid" }).eq("id", id);
    if (bookingError) throw bookingError;
    if (booking.service_brand === "doorin5") {
      const { error } = await admin.from("shopping_orders").update({ fulfilment_status: "funds_authorised" }).eq("booking_id", id);
      if (error) throw error;
    }
    const { error: eventError } = await admin.from("status_events").insert({ booking_id: id, previous_status: "awaiting_payment", new_status: "paid_awaiting_dispatch", actor_user_id: userId, actor_role: "buyer", note: "Fake payment completed in human-test mode" });
    if (eventError) throw eventError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not complete test payment." }, { status: 400 });
  }
}
