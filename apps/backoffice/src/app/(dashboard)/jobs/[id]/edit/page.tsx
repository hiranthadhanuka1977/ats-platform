import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobEditActionsMenu } from "@/components/jobs/JobEditActionsMenu";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";
import { JOB_POSTING_FULL_INCLUDE } from "@/lib/job-posting-queries";
import { serializeJobPostingFull } from "@/lib/job-posting-serialize";
import { prisma } from "@/lib/prisma";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.jobPosting.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: row ? `Edit: ${row.title}` : "Edit job" };
}

export default async function EditJobPostingPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.jobPosting.findUnique({
    where: { id },
    include: JOB_POSTING_FULL_INCLUDE,
  });
  if (!row) notFound();

  const initialJob = serializeJobPostingFull(row);

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/jobs">← Back to jobs</Link>
      </p>
      <div className="bo-page-header-actions">
        <h1 className="bo-page-title">Edit job posting</h1>
        <JobEditActionsMenu jobId={id} jobTitle={row.title} />
      </div>
      <p className="bo-page-sub">
        Update listing fields and full PDP content. Saving replaces responsibilities, qualifications, and junction
        rows for skills, benefits, and tags with the selections below.
      </p>
      <JobPostingForm mode="edit" jobId={id} initialJob={initialJob} />
    </main>
  );
}
