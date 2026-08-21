import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ServiceType } from "@/lib/domain";
import { ServiceOrderForm } from "@/components/ServiceOrderForm";

type Highlight = {
  icon: string;
  title: string;
  copy: string;
};

type Step = {
  title: string;
  copy: string;
};

type Props = {
  brand: string;
  theme: "four" | "five";
  serviceType: ServiceType;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  formTitle: string;
  formIntro: string;
  highlights: Highlight[];
  steps: Step[];
};

export function ServiceLanding({ brand, theme, serviceType, eyebrow, title, lead, formTitle, formIntro, highlights, steps }: Props) {
  return (
    <div className={`storefront theme-${theme}`}>
      <section className="sales-hero">
        <div className="hero-copy">
          <p className="eyebrow sales-eyebrow"><span className="live-dot" />{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          <div className="hero-actions">
            <a className="button sales-primary" href="#quote">Get my quote <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#how-it-works">How it works <span aria-hidden="true">↓</span></a>
          </div>
          <ul className="trust-row" aria-label="Service promises">
            <li><span aria-hidden="true">✓</span> Price agreed first</li>
            <li><span aria-hidden="true">✓</span> Local, human help</li>
            <li><span aria-hidden="true">✓</span> Updates along the way</li>
          </ul>
        </div>

        <div className="duck-stage" aria-label={`${brand} courier duck carrying a parcel and shopping bag`}>
          <div className="duck-glow" />
          <Image className="duck-image" src="/images/door-in-duck.png" width={1024} height={1536} sizes="(max-width: 760px) 78vw, 42vw" priority alt="Friendly local courier duck carrying a parcel and shopping bag" />
          <div className="duck-note note-top"><b>Local &amp; careful</b><span>Tunbridge Wells area</span></div>
          <div className="duck-note note-bottom"><span className="note-check">✓</span><div><b>Quote before payment</b><span>No surprise total</span></div></div>
        </div>
      </section>

      <section className="highlight-strip" aria-label="Why choose this service">
        {highlights.map((highlight) => (
          <article key={highlight.title}>
            <span className="highlight-icon" aria-hidden="true">{highlight.icon}</span>
            <div><h2>{highlight.title}</h2><p>{highlight.copy}</p></div>
          </article>
        ))}
      </section>

      <section className="quote-section" id="quote">
        <div className="quote-intro">
          <p className="eyebrow">A quick, clear start</p>
          <h2>{formTitle}</h2>
          <p>{formIntro}</p>
          <div className="quote-promise"><span aria-hidden="true">“</span><p>You stay in control. We confirm the price before anything is paid.</p></div>
        </div>
        <div className="quote-card">
          <div className="quote-card-heading"><div><span>1 minute</span><h2>Tell us the basics</h2></div><span className="secure-pill">Secure</span></div>
          <ServiceOrderForm serviceType={serviceType} />
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading"><p className="eyebrow">Simple from start to finish</p><h2>How {brand} works</h2></div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title}><span className="step-number">{index + 1}</span><h3>{step.title}</h3><p>{step.copy}</p></article>
          ))}
        </div>
        <div className="final-cta"><div><p className="eyebrow">Ready when you are</p><h2>Let&apos;s get it off your list.</h2></div><a className="button sales-primary" href="#quote">Start my request <span aria-hidden="true">→</span></a></div>
      </section>

      <section className="driver-callout">
        <div><span className="small-duck" aria-hidden="true">🦆</span><div><b>Know your local roads?</b><span>One driver application gives you access to suitable work across both services.</span></div></div>
        <Link className="text-link" href="/driver/onboarding">Drive with us <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
