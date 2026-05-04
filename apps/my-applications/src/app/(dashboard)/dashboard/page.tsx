import { CandidateDashboardClient } from "@/components/dashboard/CandidateDashboardClient";

export const metadata = {
  title: "Candidate Dashboard | TalentHub My Applications",
  description: "Manage your applications and profile in your TalentHub dashboard.",
};

export default function DashboardPage() {
  return (
    <main id="main-content" className="bo-content">
      <CandidateDashboardClient />
    </main>
  );
}
