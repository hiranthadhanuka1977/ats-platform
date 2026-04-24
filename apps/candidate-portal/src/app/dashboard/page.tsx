import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard moved | TalentHub",
  description: "Candidate dashboard is available in the My Applications portal.",
};

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL ?? "http://localhost:3002";
  redirect(`${base}/dashboard`);
}
