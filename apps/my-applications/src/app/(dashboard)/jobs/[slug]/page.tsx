import Link from "next/link";
import { notFound } from "next/navigation";

import { formatShortDate } from "@/lib/format";
import type { JobDetail } from "@/lib/jobs";
import { getPublishedJobBySlug } from "@/lib/jobs";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) {
    return { title: "Job not found | TalentHub My Applications" };
  }
  return {
    title: `${job.title} — TalentHub My Applications`,
    description: job.summary.slice(0, 160),
  };
}

export default async function MyAppsJobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) notFound();

  const required = job.qualifications.filter((q) => q.type === "required");
  const preferred = job.qualifications.filter((q) => q.type === "preferred");
  const workplaceTag = job.jobPostingTags.find(
    (tag) => tag.tag.name === "Remote" || tag.tag.name === "Hybrid" || tag.tag.name === "On-site",
  );

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/job-search">← Back to jobs</Link>
      </p>

      <section aria-labelledby="job-title">
        <h1 id="job-title" className="bo-page-title">
          {job.title}
        </h1>
        <p className="bo-page-sub" style={{ marginBottom: "1rem" }}>
          {job.department.name} • {job.location.city}, {job.location.country} • {job.employmentType.name} •{" "}
          {job.experienceLevel.name}
          {workplaceTag ? ` • ${workplaceTag.tag.name}` : ""}
        </p>
      </section>

      <div className="bo-dash-grid">
        <article className="bo-card bo-span-7">
          {job.summary?.trim() ? <SectionText title="Summary" text={job.summary.trim()} /> : null}
          {job.overview?.trim() ? <SectionText title="Job Overview" text={job.overview.trim()} /> : null}
          {job.roleSummary?.trim() ? <SectionText title="Role Summary" text={job.roleSummary.trim()} /> : null}

          {job.responsibilities.length > 0 ? (
            <SectionList
              title="Key Responsibilities"
              items={job.responsibilities.map((r) => r.description)}
            />
          ) : null}

          {required.length > 0 ? (
            <SectionList title="Required Qualifications" items={required.map((q) => q.description)} />
          ) : null}

          {preferred.length > 0 ? (
            <SectionList title="Preferred Qualifications" items={preferred.map((q) => q.description)} />
          ) : null}

          {job.jobPostingSkills.length > 0 ? (
            <SectionList title="Required Skills" items={job.jobPostingSkills.map((jps) => jps.skill.name)} />
          ) : null}

          {job.jobPostingBenefits.length > 0 ? (
            <SectionList
              title="What We Offer"
              items={job.jobPostingBenefits.map((jpb) => jpb.benefit.description)}
            />
          ) : null}

          {job.applicationInfo?.trim() ? <SectionText title="How to Apply" text={job.applicationInfo.trim()} /> : null}
        </article>

        <aside
          className="bo-card bo-span-5"
          aria-label="Job quick info"
          style={{ maxWidth: "340px", justifySelf: "start", width: "100%" }}
        >
          <h2 className="bo-card-title">Quick Info</h2>
          <DetailRow label="Department" value={job.department.name} />
          <DetailRow label="Location" value={`${job.location.city}, ${job.location.country}`} />
          <DetailRow label="Employment Type" value={job.employmentType.name} />
          <DetailRow label="Experience Level" value={job.experienceLevel.name} />
          <DetailRow label="Posted Date" value={formatShortDate(job.postedAt)} />
          <DetailRow label="Applications" value={String(job._count?.applications ?? 0)} />
          <DetailRow label="Saves" value={String(job._count?.bookmarks ?? 0)} />

          <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
            <Link href={`/dashboard?intent=apply&job=${encodeURIComponent(job.slug)}`} className="btn btn-primary">
              Apply
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SectionText({ title, text }: { title: string; text: string }) {
  return (
    <section style={{ marginBottom: "1rem" }}>
      <h2 className="bo-card-title" style={{ marginBottom: "0.4rem" }}>
        {title}
      </h2>
      <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--color-text-secondary)" }}>{text}</p>
    </section>
  );
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={{ marginBottom: "1rem" }}>
      <h2 className="bo-card-title" style={{ marginBottom: "0.4rem" }}>
        {title}
      </h2>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--color-text-secondary)" }}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "0.55rem" }}>
      <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}
