import { ApproveDriverButton } from "@/components/ApproveDriverButton";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const { supabase, profile } = await requireRole("/operations", ["admin"]);
  const [{ data: bookings, error: bookingsError }, { data: applications, error: applicationsError }] = await Promise.all([
    supabase.from("bookings").select("id, request_reference, service_brand, status, payment_status, accepted_price, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("driver_profiles").select("user_id, legal_name, onboarding_notes, service_brands, status, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const active = (bookings ?? []).filter((booking) => !["completed", "cancelled", "refunded"].includes(booking.status)).length;
  return <section className="product"><p className="eyebrow">Operations controller · {profile.full_name}</p><h1>Control both businesses without mixing them.</h1><div className="metrics"><div><b>{active}</b><span>active jobs</span></div><div><b>{(applications ?? []).filter((application) => application.status === "pending").length}</b><span>driver applications</span></div><div><b>{(bookings ?? []).filter((booking) => booking.service_brand === "doorin5").length}</b><span>Doorin5 requests</span></div></div><div className="split"><div className="panel"><h2>Job queue</h2>{bookingsError ? <p className="error">{bookingsError.message}</p> : <div className="orders">{(bookings ?? []).map((booking) => <article className="order-card" key={booking.id}><span className="eyebrow">{booking.service_brand === "doorin5" ? "Doorin5" : "Door in Four"}</span><h3>{booking.request_reference}</h3><span className="status">{booking.status.replaceAll("_", " ")}</span><p>Payment: {booking.payment_status} · £{Number(booking.accepted_price ?? 0).toFixed(2)}</p></article>)}{!bookings?.length ? <p className="empty">No live requests yet.</p> : null}</div>}</div><div className="panel accent"><h2>Driver approval queue</h2>{applicationsError ? <p className="error">{applicationsError.message}</p> : (applications ?? []).map((application) => <article className="order-card" key={application.user_id}><h3>{application.legal_name ?? "Unnamed applicant"}</h3><p>{application.onboarding_notes ?? "No onboarding notes supplied."}</p><p>{application.service_brands?.join(" + ") ?? "No service selection"}</p><span className="status">{application.status}</span>{application.status === "pending" ? <ApproveDriverButton applicationId={application.user_id} /> : null}</article>)}{!applications?.length ? <p className="empty">No driver applications awaiting review.</p> : null}</div></div></section>;
}
