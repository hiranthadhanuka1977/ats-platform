import { MyApplicationsPageClient } from "@/components/dashboard/MyApplicationsPageClient";

export const metadata = {
  title: "My Applications | TalentHub My Applications",
  description: "Track submitted applications and their statuses.",
};

export default function MyApplicationsPage() {
  return (
    <main id="main-content" className="bo-content">
      <MyApplicationsPageClient />
    </main>
  );
}
