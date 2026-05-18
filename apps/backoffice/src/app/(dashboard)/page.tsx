import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | ATS Back Office",
  description: "Recruitment health overview for hiring teams.",
};

export default async function DashboardPage() {
  const dashboard = await getDashboardStats(prisma);

  return <DashboardGrid {...dashboard} />;
}
