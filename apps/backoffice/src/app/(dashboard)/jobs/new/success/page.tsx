import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JobPostingSuccessClient } from "@/components/jobs/JobPostingSuccessClient";

export const metadata: Metadata = {
  title: "Job posting created",
  description: "Your new job posting was created successfully.",
};

export default function JobPostingSuccessPage() {
  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/jobs">← Back to jobs</Link>
      </p>
      <Suspense fallback={<p className="bo-admin-muted">Loading…</p>}>
        <JobPostingSuccessClient />
      </Suspense>
    </main>
  );
}
