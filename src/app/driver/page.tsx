import { DriverJobControls } from "@/components/DriverJobControls";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const { supabase, profile } = await requireRole("/driver", ["driver"]);
  const { data: driver } = await supabase.from("driver_profiles").select("status, current_availability, service_brands").eq("user_id", profile.id).single();
  const { data: bookings, error } = await supabase.from("bookings").select("id, request_reference, service_brand, status, accepted_price").eq("driver_id", profile.id).not("status", "in", "(completed,cancelled,refunded)").order("created_at", { ascending: true });
  return <section className="product"><p className="eyebrow">Driver workspace · {profile.full_name}</p><h1>Your jobs, across both services.</h1><p className="lead">Approval: <strong>{driver?.status ?? "not found"}</strong> · Eligible work: {driver?.service_brands?.join(" + ") ?? "none"}. A job always shows which business owns it.</p>{error ? <p className="error">{error.message}</p> : <div className="orders">{(bookings ?? []).map((booking) => <article className="order-card" key={booking.id}><span className="eyebrow">{booking.service_brand === "doorin5" ? "Doorin5 shopping run" : "Door in Four collection"}</span><h3>{booking.request_reference}</h3><p>Customer total £{Number(booking.accepted_price ?? 0).toFixed(2)}</p><DriverJobControls bookingId={booking.id} status={booking.status} /></article>)}{!bookings?.length ? <p className="empty">No assigned jobs. When operations assigns an approved job, it will appear here.</p> : null}</div>}</section>;
}
