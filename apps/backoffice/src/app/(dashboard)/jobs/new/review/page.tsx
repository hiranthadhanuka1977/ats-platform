import type { Metadata } from "next";
import Link from "next/link";
import { JobPostingReviewClient } from "@/components/jobs/JobPostingReviewClient";

export const metadata: Metadata = {
  title: "Review job posting",
  description: "Confirm or edit your new job posting before it is created.",
};

export default function ReviewJobPostingPage() {
  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/jobs/new?fromReview=1">← Back to edit</Link>
      </p>
      <JobPostingReviewClient />
    </main>
  );
}
