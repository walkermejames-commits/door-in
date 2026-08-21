import { ServiceLanding } from "@/components/ServiceLanding";

export default function DoorInFourPage() {
  return <ServiceLanding
    brand="Door in Four"
    theme="four"
    serviceType="collection_delivery"
    eyebrow="Local collection & delivery"
    title={<>Bought it? <em>We&apos;ll bring it home.</em></>}
    lead="From Marketplace finds to furniture and bulky buys, we collect locally and deliver to your door—without the van-hire headache."
    formTitle="Where is it going?"
    formIntro="Share the collection and delivery postcodes plus the item size. We’ll turn that into a clear quote for you."
    highlights={[
      { icon: "↗", title: "Marketplace wins", copy: "Turn that great local find into an easy delivery." },
      { icon: "⌂", title: "Door to door", copy: "Collection and drop-off, handled as one simple job." },
      { icon: "♡", title: "Handled with care", copy: "A local service with real people keeping an eye on things." },
    ]}
    steps={[
      { title: "Tell us what you bought", copy: "Add the two postcodes, rough distance and item size." },
      { title: "Approve your quote", copy: "See the price clearly before you decide to go ahead." },
      { title: "We bring it home", copy: "A suitable local driver collects it and keeps you updated." },
    ]}
  />;
}
