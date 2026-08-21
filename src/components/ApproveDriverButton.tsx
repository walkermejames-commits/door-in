"use client";

import { useState } from "react";

export function ApproveDriverButton({ applicationId }: { applicationId: string }) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  async function approve() {
    setState("pending");
    const response = await fetch(`/api/operations/driver-applications/${applicationId}/approve`, { method: "POST" });
    setState(response.ok ? "done" : "error");
  }
  if (state === "done") return <span className="success">Approved</span>;
  return <button onClick={approve} disabled={state === "pending"}>{state === "pending" ? "Approving…" : state === "error" ? "Retry approval" : "Approve driver"}</button>;
}
