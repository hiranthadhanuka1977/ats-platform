import { CandidateDashboardClient } from "@/components/dashboard/CandidateDashboardClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";

export const metadata = {
  title: "Candidate Dashboard | TalentHub My Applications",
  description: "Manage your applications and profile in your TalentHub dashboard.",
};

export default function DashboardPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="dashboard-page">
        <div className="container dashboard-wrapper">
          <CandidateDashboardClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
