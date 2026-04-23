import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CandidateStatusEditForm } from "@/components/candidates/CandidateStatusEditForm";
import { prisma } from "@/lib/prisma";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const candidate = await prisma.candidateAccount.findUnique({
    where: { id },
    include: { profile: true },
  });
  const name = `${candidate?.profile?.firstName ?? ""} ${candidate?.profile?.lastName ?? ""}`.trim() || "Candidate";
  return { title: `Edit status: ${name}` };
}

export default async function CandidateEditPage({ params }: Props) {
  const { id } = await params;
  const candidate = await prisma.candidateAccount.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!candidate) notFound();

  const fullName = `${candidate.profile?.firstName ?? ""} ${candidate.profile?.lastName ?? ""}`.trim() || "Unnamed Candidate";

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/candidates/all">← Back to all candidates</Link>
      </p>
      <div className="bo-page-header-actions">
        <h1 className="bo-page-title">Edit Candidate Status</h1>
      </div>
      <p className="bo-page-sub">Only status is editable from this screen.</p>
      <CandidateStatusEditForm candidateId={candidate.id} candidateName={fullName} currentStatus={candidate.status} />
    </main>
  );
}
