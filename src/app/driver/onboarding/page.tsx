import { DriverOnboardingForm } from "@/components/DriverOnboardingForm";

export default function DriverOnboardingPage() {
  return <section className="product"><p className="eyebrow">Shared driver onboarding</p><h1>Apply once. Work one service—or both.</h1><p className="lead">Driver approval is shared across Door in Four and Doorin5, but each job displays its service, handling requirements and eligibility rules before you accept it.</p><div className="split"><div className="panel"><h2>Before approval</h2><ul><li>Identity, insurance and vehicle suitability are reviewed by operations.</li><li>Doorin5 work includes basket, receipt and restricted-goods procedures.</li><li>Approval does not automatically make you available; availability is set in the driver workspace.</li></ul></div><div className="panel accent"><DriverOnboardingForm /></div></div></section>;
}
