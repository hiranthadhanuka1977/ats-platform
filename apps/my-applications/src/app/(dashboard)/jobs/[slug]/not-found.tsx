import Link from "next/link";

import { JOB_LISTING_PATH } from "@/lib/listing-url";

export default function JobNotFound() {
  return (
    <main id="main-content" className="bo-content">
      <article className="bo-card bo-span-12" style={{ maxWidth: "680px" }}>
        <h1 className="bo-page-title" style={{ marginBottom: "0.5rem" }}>
          Job not found
        </h1>
        <p className="bo-page-sub" style={{ marginBottom: "1rem" }}>
          This posting may have been removed or is no longer open.
        </p>
        <Link href={JOB_LISTING_PATH} className="btn btn-primary">
          Back to job search
        </Link>
      </article>
    </main>
  );
}
