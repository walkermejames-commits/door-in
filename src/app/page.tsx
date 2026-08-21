import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  if (host.startsWith("doorinfour.")) redirect("/door-in-four");
  if (host.startsWith("doorin5.")) redirect("/doorin5");
  return <section className="service-chooser"><div className="chooser-intro"><p className="eyebrow">Hello, Tunbridge Wells</p><h1>What can we <em>take off your hands?</em></h1><p className="lead">Two friendly local services. Choose the one that fits today&apos;s to-do list.</p></div><div className="chooser-grid"><Link href="/door-in-four" className="chooser-card four"><span className="chooser-number">4</span><p className="eyebrow">Door in Four</p><h2>Bring a local purchase home.</h2><p>Collection and delivery for Marketplace finds, furniture and bulky buys.</p><span className="card-link">Get a delivery quote →</span></Link><Link href="/doorin5" className="chooser-card five"><span className="chooser-number">5</span><p className="eyebrow">Doorin5</p><h2>Send us on a local errand.</h2><p>Shopping and essentials collected locally and delivered to your door.</p><span className="card-link">Start a shopping request →</span></Link></div></section>;
}
