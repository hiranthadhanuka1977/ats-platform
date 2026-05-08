import { CvUploadPageClient } from "@/components/dashboard/CvUploadPageClient";

export const metadata = {
  title: "Upload CV | TalentHub My Applications",
  description: "Upload your CV file to TalentHub.",
};

export default function CvUploadPage() {
  return (
    <main id="main-content" className="bo-content">
      <CvUploadPageClient />
    </main>
  );
}
