import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review and manage candidate applications.",
};

export default function ApplicationsPage() {
  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Applications</h1>
      <p className="bo-page-sub">Application pipeline and review tools will appear here.</p>
    </main>
  );
}
