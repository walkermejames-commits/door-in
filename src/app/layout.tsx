import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = { title: "Door In | Local logistics platform", description: "Two local-service businesses operating on one secure logistics platform." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  const brand = host.startsWith("doorinfour.") ? "Door in Four" : host.startsWith("doorin5.") ? "Doorin5" : "Door In Platform";
  const home = brand === "Door in Four" ? "/door-in-four" : brand === "Doorin5" ? "/doorin5" : "/";
  return <html lang="en"><body><header><Link href={home} className="brand">{brand === "Door In Platform" ? <>DOOR IN<span>Platform</span></> : brand}</Link><nav>{brand !== "Doorin5" ? <Link href="/door-in-four">Door in Four</Link> : null}{brand !== "Door in Four" ? <Link href="/doorin5">Doorin5</Link> : null}<Link href="/driver">Driver</Link><Link href="/operations">Operations</Link><Link href="/login">Sign in</Link></nav></header><main>{children}</main><footer>{brand === "Door In Platform" ? "One operating platform. Two distinct local services." : `${brand} uses the shared, role-controlled Door In operations platform.`}</footer></body></html>;
}
