import { DriverOnboardingForm } from "@/components/DriverOnboardingForm";

export default function DriverOnboardingPage() {
  return <section className="product"><p className="eyebrow">Drive locally with Door In</p><h1>One application. Two ways to earn.</h1><p className="lead">Choose collections, shopping runs or both. We’ll match approved drivers with work that suits their vehicle and preferences.</p><div className="split"><div className="panel"><h2>What you’ll need</h2><ul><li>Your contact details and a quick description of your vehicle.</li><li>Suitable insurance for the work you choose.</li><li>A careful, friendly approach to local customers and their items.</li></ul><p className="fine-print">We review every application before making jobs available.</p></div><div className="panel accent"><h2>Apply to drive</h2><DriverOnboardingForm /></div></div></section>;
}
