import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Door In | Local logistics platform", description: "Two local-service businesses operating on one secure logistics platform." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header><Link href="/" className="brand">DOOR IN<span>Platform</span></Link><nav><Link href="/door-in-four">Door in Four</Link><Link href="/doorin5">Doorin5</Link><Link href="/driver">Driver</Link><Link href="/operations">Operations</Link><Link href="/login">Sign in</Link></nav></header><main>{children}</main><footer>One operating platform. Two distinct local services. Live access is role-controlled.</footer></body></html>;
}
