import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Recruitment analytics and reports.",
};

export default function ReportsPage() {
  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Reports</h1>
      <p className="bo-page-sub">Analytics and downloadable reports will appear here.</p>
    </main>
  );
}
