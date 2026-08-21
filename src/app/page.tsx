import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  if (host.startsWith("doorinfour.")) redirect("/door-in-four");
  if (host.startsWith("doorin5.")) redirect("/doorin5");
  return <section className="hero"><p className="eyebrow">Tunbridge Wells pilot platform</p><h1>Two local businesses.<br /><em>One dependable operational core.</em></h1><p className="lead">Door in Four collects and delivers items people already own. Doorin5 shops locally on a customer’s behalf. They share dispatch, drivers, payment safety and proof—never their customer promise or pricing.</p><div className="actions"><Link className="button" href="/door-in-four">Explore Door in Four</Link><Link className="button secondary" href="/doorin5">Explore Doorin5</Link><Link className="button secondary" href="/driver/onboarding">Apply as a driver</Link></div><div className="principles"><div><b>Shared once</b><span>Identity, payments, dispatch, proof and audit events.</span></div><div><b>Kept distinct</b><span>Brands, terms, pricing and shopping float.</span></div><div><b>Controlled launch</b><span>Only approved drivers and authorised operations staff can access operational data.</span></div></div></section>;
}
