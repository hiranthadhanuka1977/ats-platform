import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobPostingSavedPreview } from "@/components/jobs/JobPostingSavedPreview";
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
  return { title: row ? `Preview: ${row.title}` : "Job preview" };
}

export default async function JobPreviewPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.jobPosting.findUnique({
    where: { id },
    include: JOB_POSTING_FULL_INCLUDE,
  });
  if (!row) notFound();

  return <JobPostingSavedPreview job={serializeJobPostingFull(row)} />;
}
