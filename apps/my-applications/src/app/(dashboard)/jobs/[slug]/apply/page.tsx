import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyJobPageClient } from "@/components/dashboard/ApplyJobPageClient";
import { getPublishedJobBySlug } from "@/lib/jobs";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) {
    return { title: "Job not found | TalentHub My Applications" };
  }
  return { title: `Apply: ${job.title} | TalentHub My Applications` };
}

export default async function ApplyJobPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) notFound();

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/job-search">← Back to jobs</Link>
      </p>
      <ApplyJobPageClient jobSlug={slug} jobTitle={job.title} />
    </main>
  );
}
