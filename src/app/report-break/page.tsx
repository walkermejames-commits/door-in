import Image from "next/image";
import { ReportBreakControl } from "@/components/ReportBreakControl";

export const metadata = { title: "Report a break | Door in Four" };

export default function ReportBreakPage() {
  return (
    <section className="auth-page report-break-page">
      <div className="auth-welcome">
        <Image
          src="/images/door-in-duck.png"
          alt=""
          width={160}
          height={160}
          className="report-break-duck"
        />
        <p className="eyebrow">Door in Four · beta</p>
        <h1>Something doesn’t work.</h1>
        <p>Tell us what broke. We open a GitHub issue labelled beta-break. This does not auto-patch the site.</p>
      </div>
      <div className="auth-card">
        <ReportBreakControl variant="page" />
      </div>
    </section>
  );
}
