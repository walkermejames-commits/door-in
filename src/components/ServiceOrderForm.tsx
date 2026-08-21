"use client";

import { useState } from "react";
import type { ServiceType } from "@/lib/domain";

type Props = { serviceType: ServiceType };

export function ServiceOrderForm({ serviceType }: Props) {
  const shopping = serviceType === "shop_and_deliver";
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    setResult(null);
    setCheckoutUrl(null);
    const payload = {
      serviceType,
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      pickupPostcode: formData.get("pickupPostcode"),
      deliveryPostcode: formData.get("deliveryPostcode"),
      distanceMiles: formData.get("distanceMiles"),
      itemSize: shopping ? undefined : formData.get("itemSize"),
      basketRrpPence: shopping ? Math.round(Number(formData.get("basketGbp")) * 100) : undefined,
      restrictedItems: formData.get("restrictedItems") === "on",
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json()) as { error?: string; checkoutUrl?: string; booking?: { request_reference: string; price: { customerTotal: { amountPence: number } } } };
      if (!response.ok || !body.booking) throw new Error(body.error ?? "Could not send your request.");
      setResult(`Lovely — request ${body.booking.request_reference} is in. Your estimated total is £${(body.booking.price.customerTotal.amountPence / 100).toFixed(2)}. We’ll confirm the quote before payment.`);
      setCheckoutUrl(body.checkoutUrl ?? null);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not prepare your request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="request-form">
      <div className="form-grid">
        <label>Your name<input name="customerName" autoComplete="name" required minLength={2} placeholder="James" /></label>
        <label>Email address<input name="customerEmail" autoComplete="email" type="email" required placeholder="you@example.com" /></label>
        <label>{shopping ? "Shop postcode" : "Collection postcode"}<input name="pickupPostcode" autoComplete="postal-code" required placeholder="TN1 1AA" /></label>
        <label>Delivery postcode<input name="deliveryPostcode" autoComplete="postal-code" required placeholder="TN4 8AB" /></label>
        <label>Rough distance <span className="label-hint">(miles)</span><input name="distanceMiles" type="number" min="0" max="100" defaultValue="3" required /></label>
        {shopping ? (
          <label>Rough basket value <span className="label-hint">(£)</span><input name="basketGbp" type="number" min="0" max="1000" step="0.01" defaultValue="15" required /></label>
        ) : (
          <label>Item size<select name="itemSize" defaultValue="small"><option value="small">Small parcel</option><option value="medium">Medium item</option><option value="large">Large item</option><option value="furniture">Furniture</option><option value="van_load">Van load</option></select></label>
        )}
      </div>
      {shopping ? <label className="check"><input name="restrictedItems" type="checkbox" /> My list includes something that needs an ID check</label> : null}
      <button className="form-submit" type="submit" disabled={pending}>{pending ? "Sending…" : shopping ? "Send my request" : "Get my delivery quote"}<span aria-hidden="true">→</span></button>
      {result ? <p className="success">{result}</p> : null}
      {checkoutUrl ? <p><a className="button secondary" href={checkoutUrl}>View my request</a></p> : null}
      {error ? <p className="error">{error}</p> : null}
      <p className="fine-print"><span aria-hidden="true">🔒</span> You’ll need to sign in before sending your first request. Nothing is charged until you approve your quote.</p>
    </form>
  );
}
