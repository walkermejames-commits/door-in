"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const next: Record<string, { label: string; status: string }> = {
  driver_assigned: { label: "Arrived at pickup", status: "driver_arrived_at_pickup" },
  driver_arrived_at_pickup: { label: "Confirm collection", status: "item_collected" },
  item_collected: { label: "Set off for delivery", status: "driver_en_route_to_delivery" },
  driver_en_route_to_delivery: { label: "Arrived at delivery", status: "driver_arrived_at_delivery" },
  driver_arrived_at_delivery: { label: "Verify delivery", status: "delivery_verified" },
  delivery_verified: { label: "Complete job", status: "completed" },
};

export function DriverJobControls({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const action = next[status];
  if (!action) return <span className="status">{status.replaceAll("_", " ")}</span>;
  async function advance() {
    setPending(true);
    const response = await fetch(`/api/driver/jobs/${bookingId}/advance`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nextStatus: action.status }) });
    setPending(false);
    if (response.ok) router.refresh();
  }
  return <button onClick={advance} disabled={pending}>{pending ? "Saving…" : action.label}</button>;
}
