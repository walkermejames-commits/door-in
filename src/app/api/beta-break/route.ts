import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  betaBreakSchema,
  formatBetaBreakBody,
  formatBetaBreakTitle,
} from "@/lib/beta-break";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || current.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function requestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { return new URL(origin).origin; } catch { /* ignore */ }
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function isSameOrigin(request: Request) {
  const incoming = requestOrigin(request);
  if (!incoming) return false;
  try {
    return incoming === new URL(request.url).origin;
  } catch {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return Boolean(host && incoming.includes(host));
  }
}

function githubMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "GitHub could not create the issue.";
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "beta-break-intake" });
}

export async function POST(request: Request) {
  try {
    const providedKey = request.headers.get("x-beta-break-key");
    const expectedKey = process.env.BETA_BREAK_INTAKE_KEY;
    const serverToServer = Boolean(providedKey);

    if (serverToServer) {
      if (!expectedKey || providedKey !== expectedKey) {
        return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
      }
    } else {
      if (!isSameOrigin(request)) {
        return NextResponse.json({ error: "Same-origin reports only." }, { status: 403 });
      }
      if (!rateLimit(clientIp(request))) {
        return NextResponse.json({ error: "Too many reports. Try again in a minute." }, { status: 429 });
      }
    }

    const report = betaBreakSchema.parse(await request.json());
    const owner = process.env.GITHUB_BETA_OWNER || "walkermejames-commits";
    const repo = process.env.GITHUB_BETA_REPO || "door-in";
    const token = process.env.GITHUB_BETA_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Intake is not configured." }, { status: 503 });
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "door-in-beta-break-intake",
      },
      body: JSON.stringify({
        title: formatBetaBreakTitle(report),
        body: formatBetaBreakBody(report),
        labels: ["beta-break", report.severity, report.app],
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: githubMessage(payload) }, { status: 502 });
    }

    const issue = payload as { number?: number; html_url?: string };
    if (typeof issue.number !== "number" || typeof issue.html_url !== "string") {
      return NextResponse.json({ error: "GitHub returned an unexpected issue payload." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, issue_number: issue.number, issue_url: issue.html_url }, { status: 201 });
  } catch (error) {
    const message = error instanceof ZodError
      ? "Please check the report and try again."
      : error instanceof Error ? error.message : "Could not file the report.";
    const status = error instanceof ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
