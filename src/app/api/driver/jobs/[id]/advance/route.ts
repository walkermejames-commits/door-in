import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };
const nextStatusSchema = z.object({ nextStatus: z.enum(["driver_arrived_at_pickup", "item_collected", "driver_en_route_to_delivery", "driver_arrived_at_delivery", "delivery_verified", "completed"]) });
const allowed: Record<string, string[]> = {
  driver_assigned: ["driver_arrived_at_pickup"],
  driver_arrived_at_pickup: ["item_collected"],
  item_collected: ["driver_en_route_to_delivery"],
  driver_en_route_to_delivery: ["driver_arrived_at_delivery"],
  driver_arrived_at_delivery: ["delivery_verified"],
  delivery_verified: ["completed"],
};

export async function POST(request: Request, { params }: Context) {
  try {
    const input = nextStatusSchema.parse(await request.json());
    const { id } = await params;
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const admin = createAdminClient();
    const { data: booking, error: bookingError } = await admin.from("bookings").select("id, status").eq("id", id).eq("driver_id", userId).single();
    if (bookingError || !booking) return NextResponse.json({ error: "This job is not assigned to you." }, { status: 403 });
    if (!allowed[booking.status]?.includes(input.nextStatus)) return NextResponse.json({ error: "That job transition is not allowed." }, { status: 409 });
    const { error } = await admin.from("bookings").update({ status: input.nextStatus }).eq("id", id);
    if (error) throw error;
    const { error: eventError } = await admin.from("status_events").insert({ booking_id: id, previous_status: booking.status, new_status: input.nextStatus, actor_user_id: userId, actor_role: "driver" });
    if (eventError) throw eventError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update job." }, { status: 400 });
  }
}
