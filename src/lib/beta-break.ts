import { z } from "zod";

export const betaBreakApps = [
  "door-in-four",
  "doorin5",
  "driver",
  "operations",
  "checkout",
  "login",
  "other",
] as const;
export type BetaBreakApp = (typeof betaBreakApps)[number];

export const betaBreakSeverities = ["blocker", "annoying", "typo"] as const;
export type BetaBreakSeverity = (typeof betaBreakSeverities)[number];

export const betaBreakSources = ["website", "app", "chat", "manual"] as const;
export type BetaBreakSource = (typeof betaBreakSources)[number];

const optionalText = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

export const betaBreakSchema = z.object({
  app: z.enum(betaBreakApps),
  severity: z.enum(betaBreakSeverities),
  what_broke: z.string().trim().min(3).max(4000),
  expected: optionalText,
  url: optionalText,
  device: optionalText,
  screenshot_url: optionalText,
  reporter: optionalText,
  source: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.enum(betaBreakSources).optional(),
  ),
});

export type BetaBreakReport = z.infer<typeof betaBreakSchema>;

export function formatBetaBreakTitle(report: BetaBreakReport) {
  const snippet = report.what_broke.replace(/\s+/g, " ").slice(0, 72);
  return `[beta-break][${report.severity}] ${report.app}: ${snippet}`;
}

export function formatBetaBreakBody(report: BetaBreakReport) {
  const line = (label: string, value: string | undefined) =>
    value ? `- **${label}:** ${value}` : null;
  return [
    "## What broke",
    report.what_broke,
    "",
    "## Details",
    line("app", report.app),
    line("severity", report.severity),
    line("expected", report.expected),
    line("url", report.url),
    line("device", report.device),
    line("screenshot", report.screenshot_url),
    line("reporter", report.reporter),
    line("source", report.source ?? "website"),
    "",
    "_Created by beta-break intake. This does not auto-patch code._",
  ]
    .filter((row) => row !== null)
    .join("\n");
}

export function inferBetaBreakApp(pathname: string, host = ""): BetaBreakApp {
  const path = pathname.toLowerCase();
  const hostname = host.toLowerCase();
  if (path.startsWith("/driver")) return "driver";
  if (path.startsWith("/operations")) return "operations";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/login")) return "login";
  if (path.startsWith("/doorin5") || hostname.startsWith("doorin5.")) return "doorin5";
  if (path.startsWith("/door-in-four") || hostname.startsWith("doorinfour.")) return "door-in-four";
  return "other";
}
