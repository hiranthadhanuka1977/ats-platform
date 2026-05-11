import { CoverLettersPageClient } from "@/components/dashboard/CoverLettersPageClient";

export const metadata = {
  title: "Cover Letters | TalentHub My Applications",
  description: "Upload and manage your cover letters.",
};

export default function CoverLettersPage() {
  return (
    <main id="main-content" className="bo-content">
      <CoverLettersPageClient />
    </main>
  );
}
