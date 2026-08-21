"use client";

import { useState } from "react";

export function DriverOnboardingForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/driver/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        legalName: formData.get("legalName"), phone: formData.get("phone"), vehicleSummary: formData.get("vehicleSummary"), insuranceExpiresOn: formData.get("insuranceExpiresOn") || undefined,
        serviceTypes: formData.getAll("serviceTypes"),
      }) });
      const body = await response.json() as { error?: string; application?: { status: string } };
      if (!response.ok) throw new Error(body.error ?? "Could not submit application.");
      setMessage(`Application submitted: ${body.application?.status}. Operations will verify your eligibility before jobs become available.`);
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Could not submit application."); } finally { setPending(false); }
  }
  return <form action={submit} className="request-form"><div className="form-grid"><label>Legal name<input name="legalName" required /></label><label>Phone<input name="phone" required /></label><label>Vehicle and capacity<input name="vehicleSummary" required placeholder="Estate car, insured for local deliveries" /></label><label>Insurance expiry<input name="insuranceExpiresOn" type="date" /></label></div><fieldset><legend>Which services can you work?</legend><label className="check"><input name="serviceTypes" type="checkbox" value="collection_delivery" defaultChecked /> Door in Four — collection & delivery</label><label className="check"><input name="serviceTypes" type="checkbox" value="shop_and_deliver" defaultChecked /> Doorin5 — shop & delivery</label></fieldset><button disabled={pending}>{pending ? "Submitting…" : "Submit driver application"}</button>{message ? <p className="success">{message}</p> : null}{error ? <p className="error">{error}</p> : null}</form>;
}
