"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { inferBetaBreakApp } from "@/lib/beta-break";

type SubmitResult = { ok: true } | { ok: false; error: string };

export function ReportBreakControl() {
  const [open, setOpen] = useState(false);
  const [fault, setFault] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    setPageUrl(window.location.href);
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
          severity: "annoying",
          what_broke: fault,
          url: pageUrl || undefined,
          source: "website",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not send the report.");
      }
      setResult({ ok: true });
      setFault("");
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "Could not send the report." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="report-break-control">
      {open ? (
        <div className="report-break-panel">
          <button type="button" className="report-break-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          <form className="report-break-form" onSubmit={submit}>
            <p className="page-fault-title">Report a fault on this page</p>
            <label>
              What’s wrong?
              <textarea
                required
                minLength={3}
                rows={3}
                placeholder="Tell us what’s not working"
                value={fault}
                onChange={(event) => setFault(event.target.value)}
              />
            </label>
            <button type="submit" disabled={pending}>{pending ? "Sending…" : "Submit"}</button>
            {result?.ok === true ? <p className="success">Thanks. We’ve got this page.</p> : null}
            {result?.ok === false ? <p className="error">{result.error}</p> : null}
          </form>
        </div>
      ) : (
        <button type="button" className="report-break-fab" onClick={() => setOpen(true)}>
          Report a fault
        </button>
      )}
    </div>
  );
}
