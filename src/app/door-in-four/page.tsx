import { ServiceOrderForm } from "@/components/ServiceOrderForm";

export default function DoorInFourPage() {
  return <section className="product"><p className="eyebrow">Door in Four</p><h1>Collection and delivery, quoted clearly.</h1><p className="lead">For items already owned: get a transport quote, pay securely, follow the driver, and receive verified collection and delivery proof.</p><div className="split"><div className="panel"><h2>What this service does</h2><ul><li>Buyer-led collection from a seller or home.</li><li>Quote based on route, size, handling and access.</li><li>Driver assignment, handover code and proof photo.</li><li>Customer tracking, support and dispute path.</li></ul></div><div className="panel accent"><h2>Pilot request</h2><ServiceOrderForm serviceType="collection_delivery" /></div></div></section>;
}
