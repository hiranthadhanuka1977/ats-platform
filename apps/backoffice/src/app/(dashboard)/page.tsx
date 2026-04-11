import type { Metadata } from "next";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export const metadata: Metadata = {
  title: "Dashboard — TalentHub Back Office",
  description: "Recruitment health overview for your organization.",
};

export default function DashboardPage() {
  return <DashboardGrid />;
}
