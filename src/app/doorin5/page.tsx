import { ServiceOrderForm } from "@/components/ServiceOrderForm";

export default function Doorin5Page() {
  return <section className="product"><p className="eyebrow">Doorin5</p><h1>Local shopping, responsibly delivered.</h1><p className="lead">For goods a customer wants bought locally: approve a basket cap and substitutions, then receive a receipt-backed delivery with clear item, service and delivery charges.</p><div className="split"><div className="panel"><h2>What makes this different</h2><ul><li>Basket RRP, 20% service markup and delivery are itemised.</li><li>Operations reserve fulfilment float before any purchase.</li><li>Restricted goods require an auditable recipient ID check.</li><li>Substitutions and price variation need customer approval.</li></ul></div><div className="panel accent"><h2>Pilot request</h2><ServiceOrderForm serviceType="shop_and_deliver" /></div></div></section>;
}
