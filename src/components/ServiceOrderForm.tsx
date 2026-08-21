"use client";

import { useState } from "react";
import type { ServiceType } from "@/lib/domain";

type Props = { serviceType: ServiceType };

export function ServiceOrderForm({ serviceType }: Props) {
  const shopping = serviceType === "shop_and_deliver";
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    setResult(null);
    const payload = {
      serviceType,
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      pickupPostcode: formData.get("pickupPostcode"),
      deliveryPostcode: formData.get("deliveryPostcode"),
      distanceMiles: formData.get("distanceMiles"),
      itemSize: formData.get("itemSize"),
      basketRrpPence: shopping ? Math.round(Number(formData.get("basketGbp")) * 100) : undefined,
      restrictedItems: formData.get("restrictedItems") === "on",
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json()) as { error?: string; booking?: { request_reference: string; price: { customerTotal: { amountPence: number } } } };
      if (!response.ok || !body.booking) throw new Error(body.error ?? "Could not send your request.");
      setResult(`Request ${body.booking.request_reference} received. Estimated customer total: £${(body.booking.price.customerTotal.amountPence / 100).toFixed(2)}. Operations will prepare the next step.`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not prepare your request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="request-form">
      <div className="form-grid">
        <label>Name<input name="customerName" required minLength={2} placeholder="Your name" /></label>
        <label>Email<input name="customerEmail" type="email" required placeholder="you@example.com" /></label>
        <label>Collection / shop postcode<input name="pickupPostcode" required placeholder="TN1 1AA" /></label>
        <label>Delivery postcode<input name="deliveryPostcode" required placeholder="TN4 8AB" /></label>
        <label>Approximate journey miles<input name="distanceMiles" type="number" min="0" max="100" defaultValue="3" required /></label>
        {shopping ? (
          <label>Estimated basket at RRP (£)<input name="basketGbp" type="number" min="0" max="1000" step="0.01" defaultValue="15" required /></label>
        ) : (
          <label>Item size<select name="itemSize" defaultValue="small"><option value="small">Small parcel</option><option value="medium">Medium item</option><option value="large">Large item</option><option value="furniture">Furniture</option><option value="van_load">Van load</option></select></label>
        )}
      </div>
      {shopping ? <label className="check"><input name="restrictedItems" type="checkbox" /> Includes age-restricted goods (ID check required)</label> : null}
      <button type="submit" disabled={pending}>{pending ? "Preparing…" : shopping ? "Estimate my shop & delivery" : "Get a collection quote"}</button>
      {result ? <p className="success">{result}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <p className="fine-print">You must be signed in to send a request. Payment is not collected on this screen; checkout is enabled only after operations issues a valid quote.</p>
    </form>
  );
}
