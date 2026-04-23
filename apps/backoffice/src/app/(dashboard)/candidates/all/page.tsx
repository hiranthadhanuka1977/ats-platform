import type { Metadata } from "next";
import { CandidatesAllContent, fetchCandidateTableRows } from "@/components/candidates/CandidatesAllContent";
import { CandidatesHeader } from "@/components/candidates/CandidatesHeader";

export const metadata: Metadata = {
  title: "All Candidates",
  description: "Browse all candidate records in the backoffice portal.",
};

export default async function AllCandidatesPage() {
  const candidates = await fetchCandidateTableRows();

  return (
    <main id="main-content" className="bo-content">
      <CandidatesHeader
        activeTab="all"
        searchCandidates={candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
        }))}
      />
      <CandidatesAllContent candidates={candidates} />
    </main>
  );
}
