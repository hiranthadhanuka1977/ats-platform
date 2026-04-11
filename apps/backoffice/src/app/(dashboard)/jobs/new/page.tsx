import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";

export const metadata: Metadata = {
  title: "Create job posting",
  description: "Create a new job posting with full detail-page content.",
};

export default function NewJobPostingPage() {
  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/jobs">← Back to jobs</Link>
      </p>
      <h1 className="bo-page-title">Create job posting</h1>
      <p className="bo-page-sub">
        Enter listing basics and optional detail-page content (overview, responsibilities, qualifications, skills,
        benefits, tags, salary, banner, expiry). Use Review posting to open a preview step and confirm before the
        posting is saved.
      </p>
      <Suspense fallback={<p className="bo-admin-muted">Loading form…</p>}>
        <JobPostingForm mode="create" />
      </Suspense>
    </main>
  );
}
