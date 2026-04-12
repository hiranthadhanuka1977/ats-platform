import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";

export default function JobNotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="container" style={{ padding: "var(--space-16) 0" }}>
        <h1 className="detail-title" style={{ marginBottom: "var(--space-4)" }}>
          Job not found
        </h1>
        <p className="detail-preline" style={{ marginBottom: "var(--space-6)" }}>
          This posting may have been removed or is no longer open.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to all jobs
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
