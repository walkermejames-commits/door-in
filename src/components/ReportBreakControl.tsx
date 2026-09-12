"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { inferBetaBreakApp, type BetaBreakSeverity } from "@/lib/beta-break";

type FormState = {
  what_broke: string;
  severity: BetaBreakSeverity;
  url: string;
};

type SubmitResult = { ok: true; issue_url: string } | { ok: false; error: string };

export function ReportBreakControl({ variant = "corner" }: { variant?: "corner" | "page" }) {
  const [open, setOpen] = useState(variant === "page");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [form, setForm] = useState<FormState>({ what_broke: "", severity: "annoying", url: "" });

  useEffect(() => {
    setForm((current) => current.url ? current : { ...current, url: window.location.href });
  }, []);

  const app = useMemo(() => {
    if (typeof window === "undefined") return "door-in-four" as const;
    return inferBetaBreakApp(window.location.pathname, window.location.host);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/beta-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app,
          severity: form.severity,
          what_broke: form.what_broke,
          url: form.url,
          source: "website",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not file the report.");
      }
      setResult({ ok: true, issue_url: payload.issue_url });
      setForm((current) => ({ ...current, what_broke: "" }));
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "Could not file the report." });
    } finally {
      setPending(false);
    }
  }

  const formBody = (
    <form className="report-break-form" onSubmit={submit}>
      <p className="eyebrow">Beta break</p>
      <h2>This doesn’t work</h2>
      <p>Tell us what broke. We file a GitHub issue. No auto-fix.</p>
      <label>
        What broke
        <textarea
          required
          minLength={3}
          rows={4}
          value={form.what_broke}
          onChange={(event) => setForm((current) => ({ ...current, what_broke: event.target.value }))}
        />
      </label>
      <div className="form-grid">
        <label>
          Severity
          <select
            value={form.severity}
            onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as BetaBreakSeverity }))}
          >
            <option value="blocker">Blocker</option>
            <option value="annoying">Annoying</option>
            <option value="typo">Typo</option>
          </select>
        </label>
        <label>
          Page
          <input
            value={form.url}
            onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
          />
        </label>
      </div>
      <button type="submit" disabled={pending}>{pending ? "Filing…" : "File the break"}</button>
      {result?.ok === true ? (
        <p className="success">Logged. <a href={result.issue_url} target="_blank" rel="noreferrer">{result.issue_url}</a></p>
      ) : null}
      {result?.ok === false ? <p className="error">{result.error}</p> : null}
    </form>
  );

  if (variant === "page") return formBody;

  return (
    <div className="report-break-control">
      {open ? (
        <div className="report-break-panel">
          <button type="button" className="report-break-close" onClick={() => setOpen(false)} aria-label="Close report">×</button>
          {formBody}
        </div>
      ) : (
        <button type="button" className="report-break-fab" onClick={() => setOpen(true)}>
          This doesn’t work
        </button>
      )}
    </div>
  );
}
