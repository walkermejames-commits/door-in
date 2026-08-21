import { ApproveDriverButton } from "@/components/ApproveDriverButton";
import { AssignDriverControl } from "@/components/AssignDriverControl";
import { IssueTestQuoteButton } from "@/components/IssueTestQuoteButton";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const { supabase, profile } = await requireRole("/operations", ["admin"]);
  const [{ data: bookings, error: bookingsError }, { data: applications, error: applicationsError }] = await Promise.all([
    supabase.from("bookings").select("id, request_reference, service_brand, status, payment_status, accepted_price, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("driver_profiles").select("user_id, legal_name, onboarding_notes, service_brands, status, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const active = (bookings ?? []).filter((booking) => !["completed", "cancelled", "refunded"].includes(booking.status)).length;
  const approvedDrivers = (applications ?? []).filter((application) => application.status === "approved").map((application) => ({ user_id: application.user_id, legal_name: application.legal_name, service_brands: application.service_brands }));
  return <section className="product"><p className="eyebrow">Fat Controller · {profile.full_name}</p><h1>Today at a glance.</h1><div className="metrics"><div><b>{active}</b><span>active jobs</span></div><div><b>{(applications ?? []).filter((application) => application.status === "pending").length}</b><span>drivers to review</span></div><div><b>{(bookings ?? []).filter((booking) => booking.service_brand === "doorin5").length}</b><span>Doorin5 requests</span></div></div><div className="split"><div className="panel"><h2>Jobs</h2>{bookingsError ? <p className="error">{bookingsError.message}</p> : <div className="orders">{(bookings ?? []).map((booking) => <article className="order-card" key={booking.id}><span className="eyebrow">{booking.service_brand === "doorin5" ? "Doorin5" : "Door in Four"}</span><h3>{booking.request_reference}</h3><span className="status">{booking.status.replaceAll("_", " ")}</span><p>Payment: {booking.payment_status.replaceAll("_", " ")} · £{Number(booking.accepted_price ?? 0).toFixed(2)}</p>{booking.status === "quote_requested" ? <IssueTestQuoteButton bookingId={booking.id} /> : null}{booking.status === "paid_awaiting_dispatch" ? <AssignDriverControl bookingId={booking.id} drivers={approvedDrivers} /> : null}</article>)}{!bookings?.length ? <p className="empty">No live requests yet.</p> : null}</div>}</div><div className="panel accent"><h2>Driver applications</h2>{applicationsError ? <p className="error">{applicationsError.message}</p> : (applications ?? []).map((application) => <article className="order-card" key={application.user_id}><h3>{application.legal_name ?? "Unnamed applicant"}</h3><p>{application.onboarding_notes ?? "No notes supplied."}</p><p>{application.service_brands?.join(" + ") ?? "No service selected"}</p><span className="status">{application.status}</span>{application.status === "pending" ? <ApproveDriverButton applicationId={application.user_id} /> : null}</article>)}{!applications?.length ? <p className="empty">No applications waiting.</p> : null}</div></div></section>;
}
