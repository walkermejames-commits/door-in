import Link from "next/link";

export default function AccessDeniedPage() { return <section className="product narrow"><p className="eyebrow">Access restricted</p><h1>This workspace is not available to your account.</h1><p className="lead">Operations and driver access is assigned by the platform after approval.</p><Link className="button" href="/driver/onboarding">Apply as a driver</Link></section>; }
