"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FakePaymentButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");

  async function pay() {
    setState("pending");
    const response = await fetch(`/api/test/checkout/${bookingId}`, { method: "POST" });
    if (!response.ok) { setState("error"); return; }
    router.refresh();
  }

  return <button onClick={pay} disabled={state === "pending"}>{state === "pending" ? "Recording test payment…" : state === "error" ? "Retry test payment" : "Complete fake payment"}</button>;
}
