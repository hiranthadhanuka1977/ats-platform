import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates",
  description: "Browse and manage candidates.",
};

export default function CandidatesPage() {
  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Candidates</h1>
      <p className="bo-page-sub">Candidate profiles and search will appear here.</p>
    </main>
  );
}
