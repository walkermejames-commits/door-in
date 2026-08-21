"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IssueTestQuoteButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");

  async function issue() {
    setState("pending");
    const response = await fetch(`/api/operations/bookings/${bookingId}/quote`, { method: "POST" });
    if (!response.ok) { setState("error"); return; }
    router.refresh();
  }

  return <button onClick={issue} disabled={state === "pending"}>{state === "pending" ? "Issuing quote…" : state === "error" ? "Retry quote" : "Issue test quote"}</button>;
}
