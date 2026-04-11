import type { Metadata } from "next";
import { JobsPageClient } from "@/components/jobs/JobsPageClient";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Create and manage job postings, filters, and listing.",
};

export default function JobsPage() {
  return (
    <main id="main-content" className="bo-content">
      <JobsPageClient />
    </main>
  );
}
