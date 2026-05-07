import { DashboardPrototypeToolsClient } from "@/components/dashboard/DashboardPrototypeToolsClient";

export const metadata = {
  title: "My Profile | TalentHub My Applications",
  description: "Manage profile details, LinkedIn text parsing, and CV upload.",
};

export default function MyProfilePage() {
  return (
    <main id="main-content" className="bo-content">
      <DashboardPrototypeToolsClient />
    </main>
  );
}
