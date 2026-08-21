"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Driver = { user_id: string; legal_name: string | null; service_brands: string[] | null };

export function AssignDriverControl({ bookingId, drivers }: { bookingId: string; drivers: Driver[] }) {
  const router = useRouter();
  const [driverId, setDriverId] = useState(drivers[0]?.user_id ?? "");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  if (!drivers.length) return <p className="fine-print">No approved driver is available yet.</p>;
  async function assign() {
    setState("pending");
    const response = await fetch(`/api/operations/bookings/${bookingId}/assign`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ driverId }) });
    if (!response.ok) { setState("error"); return; }
    router.refresh();
  }
  return <p className="actions"><select aria-label="Driver" value={driverId} onChange={(event) => setDriverId(event.target.value)}>{drivers.map((driver) => <option key={driver.user_id} value={driver.user_id}>{driver.legal_name ?? "Approved driver"} · {driver.service_brands?.join(" + ") ?? "both services"}</option>)}</select><button onClick={assign} disabled={state === "pending"}>{state === "pending" ? "Assigning…" : state === "error" ? "Retry assignment" : "Assign driver"}</button></p>;
}
