import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };
const inputSchema = z.object({ driverId: z.string().uuid() });

export async function POST(request: Request, { params }: Context) {
  try {
    const input = inputSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const admin = createAdminClient();
    const { data: actor } = await admin.from("users").select("role").eq("id", userId).maybeSingle();
    if (actor?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const { id } = await params;
    const [{ data: booking, error: bookingError }, { data: driver, error: driverError }] = await Promise.all([
      admin.from("bookings").select("id, status").eq("id", id).single(),
      admin.from("driver_profiles").select("user_id, status").eq("user_id", input.driverId).single(),
    ]);
    if (bookingError || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (driverError || driver?.status !== "approved") return NextResponse.json({ error: "Select an approved driver." }, { status: 409 });
    if (booking.status !== "paid_awaiting_dispatch") return NextResponse.json({ error: "Only paid requests can be assigned." }, { status: 409 });
    const { error: updateError } = await admin.from("bookings").update({ driver_id: input.driverId, status: "driver_assigned" }).eq("id", id);
    if (updateError) throw updateError;
    const { error: eventError } = await admin.from("status_events").insert({ booking_id: id, previous_status: "paid_awaiting_dispatch", new_status: "driver_assigned", actor_user_id: userId, actor_role: "admin", note: "Driver assigned in operations controller" });
    if (eventError) throw eventError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not assign driver." }, { status: 400 });
  }
}
