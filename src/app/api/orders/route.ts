import { NextResponse } from "next/server";
import { calculateCollectionPrice, calculateShoppingPrice, createOrderSchema } from "@/lib/domain";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = createOrderSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in before sending a request." }, { status: 401 });
    const admin = createAdminClient();
    const { data: existingUser } = await admin.from("users").select("id").eq("id", userId).maybeSingle();
    if (!existingUser) {
      const { error: userError } = await admin.from("users").insert({ id: userId, full_name: payload.customerName, email: payload.customerEmail, role: "buyer" });
      if (userError) throw userError;
    }
    const price = payload.serviceType === "shop_and_deliver"
      ? calculateShoppingPrice(payload.basketRrpPence ?? 0, payload.distanceMiles, payload.restrictedItems)
      : calculateCollectionPrice(payload.distanceMiles, payload.itemSize);
    const { data: pickup, error: pickupError } = await admin.from("pickup_contacts").insert({ seller_name: payload.customerName, seller_email: payload.customerEmail, postcode: payload.pickupPostcode.toUpperCase() }).select("id").single();
    if (pickupError) throw pickupError;
    const { data: delivery, error: deliveryError } = await admin.from("delivery_addresses").insert({ recipient_name: payload.customerName, recipient_phone: "Pending confirmation", postcode: payload.deliveryPostcode.toUpperCase() }).select("id").single();
    if (deliveryError) throw deliveryError;
    const { data: booking, error: bookingError } = await admin.from("bookings").insert({
      service_brand: payload.serviceType === "shop_and_deliver" ? "doorin5" : "door_in_four",
      buyer_id: userId,
      status: "quote_requested",
      payment_status: "quote_created",
      pickup_contact_id: pickup.id,
      delivery_address_id: delivery.id,
      item_title: payload.serviceType === "shop_and_deliver" ? "Shopping basket" : `${payload.itemSize ?? "small"} collection`,
      item_size: payload.itemSize ?? "basket",
      accepted_price: price.customerTotal.amountPence / 100,
      platform_fee_amount: price.platformFee.amountPence / 100,
      driver_payout_amount: (price.driverPayoutEstimate?.amountPence ?? 0) / 100,
    }).select("id, request_reference, status").single();
    if (bookingError) throw bookingError;
    if (payload.serviceType === "shop_and_deliver") {
      const { error: basketError } = await admin.from("shopping_orders").insert({
        booking_id: booking.id,
        goods_budget_amount: (payload.basketRrpPence ?? 0) / 100,
        goods_markup_amount: (price.goodsMarkup?.amountPence ?? 0) / 100,
        restricted_items: payload.restrictedItems,
      });
      if (basketError) throw basketError;
    }
    return NextResponse.json({ booking: { ...booking, price }, checkoutUrl: `/checkout/${booking.id}`, mode: "live_database" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
