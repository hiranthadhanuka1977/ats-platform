import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interviews",
  description: "Schedule and track interviews.",
};

export default function InterviewsPage() {
  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Interviews</h1>
      <p className="bo-page-sub">Interview scheduling and notes will appear here.</p>
    </main>
  );
}
