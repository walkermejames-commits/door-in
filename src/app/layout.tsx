import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import "./globals.css";
import { ReportBreakControl } from "@/components/ReportBreakControl";

export const metadata: Metadata = { title: "Door In | Local help, delivered", description: "Friendly local collection, delivery and errand services around Tunbridge Wells." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  const brand = host.startsWith("doorinfour.") ? "Door in Four" : host.startsWith("doorin5.") ? "Doorin5" : "Door In Platform";
  const home = brand === "Door in Four" ? "/door-in-four" : brand === "Doorin5" ? "/doorin5" : "/";
  const quoteHome = brand === "Doorin5" ? "/doorin5#quote" : "/door-in-four#quote";
  const howItWorks = brand === "Doorin5" ? "/doorin5#how-it-works" : "/door-in-four#how-it-works";

  return <html lang="en"><body>
    <header className={`site-header ${brand === "Doorin5" ? "header-five" : "header-four"}`}>
      <Link href={home} className="brand"><span className="brand-mark" aria-hidden="true">{brand === "Doorin5" ? "5" : brand === "Door in Four" ? "4" : "D"}</span><span className="brand-words">{brand === "Door In Platform" ? <>Door In<small>Local services</small></> : <>{brand}<small>{brand === "Doorin5" ? "Local errands, delivered" : "Local collection & delivery"}</small></>}</span></Link>
      <nav aria-label="Main navigation">
        {brand === "Door In Platform" ? <><Link href="/door-in-four">Door in Four</Link><Link href="/doorin5">Doorin5</Link><Link href="/driver/onboarding">Drive with us</Link></> : <><a href={howItWorks}>How it works</a><Link href="/login">Sign in</Link><a className="nav-cta" href={quoteHome}>{brand === "Doorin5" ? "Start a request" : "Get a quote"}</a></>}
      </nav>
    </header>
    <main>{children}</main>
    <ReportBreakControl />
    <footer className="site-footer"><div><Link href={home} className="footer-brand">{brand === "Door In Platform" ? "Door In" : brand}</Link><p>{brand === "Doorin5" ? "Local errands, properly handled." : brand === "Door in Four" ? "The easy way to bring local purchases home." : "Two useful local services, one friendly team."}</p></div><div className="footer-links"><Link href="/driver/onboarding">Drive with us</Link><Link href="/login">Customer sign in</Link><Link href="/operations">Staff access</Link></div></footer>
  </body></html>;
}
