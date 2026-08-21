import { ServiceLanding } from "@/components/ServiceLanding";

export default function Doorin5Page() {
  return <ServiceLanding
    brand="Doorin5"
    theme="five"
    serviceType="shop_and_deliver"
    eyebrow="Tunbridge Wells local errands"
    title={<>Your local to-do list, <em>delivered.</em></>}
    lead="Groceries, essentials or that one thing you can’t get out for—we shop locally and bring it straight to your door."
    formTitle="What can we pick up for you?"
    formIntro="Tell us where to shop, where to deliver and roughly what the basket will cost. We’ll confirm everything before payment."
    highlights={[
      { icon: "✦", title: "Everyday errands", copy: "The local shop run, handled when your day is already full." },
      { icon: "◎", title: "You approve first", copy: "A clear total comes to you before checkout opens." },
      { icon: "⌖", title: "Properly local", copy: "Built around Tunbridge Wells and nearby neighbourhoods." },
    ]}
    steps={[
      { title: "Tell us what you need", copy: "Share the shop, basket estimate and delivery postcode." },
      { title: "Check the quote", copy: "Review the expected shopping and delivery total before paying." },
      { title: "Put your feet up", copy: "Your driver shops, collects the receipt and brings it to you." },
    ]}
  />;
}
