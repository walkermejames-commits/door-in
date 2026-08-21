import { redirect } from "next/navigation";
import { FakePaymentButton } from "@/components/FakePaymentButton";
import { requireProfile } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: Props) {
  const { supabase, profile } = await requireProfile("/checkout");
  if (profile.role !== "buyer") redirect("/access-denied?next=/checkout");
  const { id } = await params;
  const { data: booking } = await supabase.from("bookings").select("id, request_reference, service_brand, status, accepted_price").eq("id", id).eq("buyer_id", profile.id).maybeSingle();
  if (!booking) return <section className="product narrow"><h1>Request not found.</h1><p>This payment page belongs to the buyer who created the request.</p></section>;
  const testMode = process.env.FAKE_PAYMENTS_ENABLED === "true";
  return <section className="product narrow"><p className="eyebrow">{booking.service_brand === "doorin5" ? "Doorin5" : "Door in Four"} · {booking.request_reference}</p><h1>Payment status</h1><p className="lead">Quote status: <strong>{booking.status.replaceAll("_", " ")}</strong> · Total: £{Number(booking.accepted_price ?? 0).toFixed(2)}</p>{booking.status === "quote_requested" ? <p className="panel">Your request is with operations. Return here after an administrator issues your quote.</p> : null}{booking.status === "awaiting_payment" && testMode ? <div className="panel accent"><h2>Human-test payment</h2><p>No card is charged. This records a fake payment so you can test dispatch and the driver workflow.</p><FakePaymentButton bookingId={booking.id} /></div> : null}{booking.status === "awaiting_payment" && !testMode ? <p className="panel">Secure payment will be available here after Stripe is configured.</p> : null}{booking.status === "paid_awaiting_dispatch" ? <p className="success">Payment recorded. Operations can now assign an approved driver.</p> : null}</section>;
}
