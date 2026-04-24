import { redirect } from "next/navigation";

export const metadata = {
  title: "Log In moved | TalentHub",
  description: "Candidate auth is available in the My Applications portal.",
};

export default function LoginPage() {
  const base = process.env.NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL ?? "http://localhost:3002";
  redirect(`${base}/login`);
}
