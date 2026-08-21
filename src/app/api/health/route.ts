import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    services: ["collection_delivery", "shop_and_deliver"],
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    readiness: ["Supabase Auth and RLS", "Stripe checkout and webhook", "approved driver access", "private proof storage", "notifications and monitoring"],
  });
}
