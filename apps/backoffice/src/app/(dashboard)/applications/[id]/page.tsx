import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicationStatusMeta } from "@ats-platform/types";
import { ApplicationDetailsHeader } from "@/components/applications/ApplicationDetailsHeader";
import { ApplicationRelevanceSection } from "@/components/applications/ApplicationRelevanceSection";
import { ApplicationScheduledInterviews } from "@/components/applications/ApplicationScheduledInterviews";
import { toApplicationStatusActivityItems } from "@/lib/application-status-activity";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; candidateId?: string }>;
};

function parseCoverLetterId(coverLetter: string | null): string | null {
  if (!coverLetter) return null;
  const m = /^cover_letter_id:([0-9a-f-]{36})$/i.exec(coverLetter.trim());
  return m?.[1] ?? null;
}

function parseCvIdFromResumeUrl(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;
  const m = /(?:\?|&)id=([^&]+)/.exec(resumeUrl);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

function formatDateTimeUtc(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function toAbsoluteMyAppsUrl(myApplicationsBaseUrl: string, pathOrUrl: string): string {
  const base = myApplicationsBaseUrl.replace(/\/$/, "");
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { title: "Application" };
  }
  const row = await prisma.application.findUnique({
    where: { id },
    select: { jobPosting: { select: { title: true } } },
  });
  if (!row) return { title: "Application" };
  return { title: `Application — ${row.jobPosting.title}` };
}

export default async function ApplicationDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from, candidateId } = await searchParams;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const myApplicationsBaseUrl = process.env.NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL ?? "http://localhost:3002";

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      candidateAccount: {
        include: {
          profile: true,
          cvEducation: { orderBy: { createdAt: "desc" } },
          cvExperience: { orderBy: { createdAt: "desc" } },
          bookmarks: true,
          authProviders: true,
        },
      },
      jobPosting: {
        select: {
          id: true,
          title: true,
          company: { select: { id: true, name: true } },
        },
      },
      statusEvents: {
        orderBy: { changedAt: "desc" },
        include: {
          changedByStaff: { select: { name: true } },
        },
      },
      interviews: {
        orderBy: { startsAt: "desc" },
        include: {
          scheduledByStaff: { select: { name: true } },
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const candidateApplicationCount = await prisma.application.count({
    where: { candidateAccountId: application.candidateAccountId },
  });

  const candidate = application.candidateAccount;
  const fullName =
    `${candidate.profile?.firstName ?? ""} ${candidate.profile?.lastName ?? ""}`.trim() || "Unnamed Candidate";

  const coverLetterId = parseCoverLetterId(application.coverLetter);
  const coverLetterRow = coverLetterId
    ? await prisma.candidateCoverLetter.findFirst({
        where: { id: coverLetterId, candidateAccountId: application.candidateAccountId },
      })
    : null;

  const legacyCoverLetterText =
    !coverLetterRow && application.coverLetter?.trim() && !/^cover_letter_id:/i.test(application.coverLetter.trim())
      ? application.coverLetter.trim()
      : null;

  const defaultResumeUrl = candidate.profile?.resumeUrl
    ? toAbsoluteMyAppsUrl(myApplicationsBaseUrl, candidate.profile.resumeUrl)
    : null;

  const cvId = parseCvIdFromResumeUrl(application.resumeUrl);
  const hasApplicationCv = Boolean(cvId);

  let noticeLines: string[] = [];
  if (application.noticePeriods) {
    try {
      const parsed = JSON.parse(application.noticePeriods) as unknown;
      if (Array.isArray(parsed)) {
        noticeLines = parsed.filter((x): x is string => typeof x === "string");
      } else {
        noticeLines = [String(application.noticePeriods)];
      }
    } catch {
      noticeLines = [application.noticePeriods];
    }
  }

  const statusMeta = getApplicationStatusMeta(application.status);
  const statusActivityItems = toApplicationStatusActivityItems(application.statusEvents);
  const salaryFormatted =
    application.salaryExpectationAnnual != null
      ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
          Number(application.salaryExpectationAnnual),
        )
      : "—";

  const attachmentCvHref = `/api/backoffice/applications/${application.id}/attachments/cv`;
  const attachmentCoverHref = `/api/backoffice/applications/${application.id}/attachments/cover-letter`;

  const showCoverLetterTextSection =
    (coverLetterRow?.mode === "text" && Boolean(coverLetterRow.body?.trim())) || Boolean(legacyCoverLetterText);

  const backFromCandidate =
    from === "candidates" && candidateId === application.candidateAccountId;
  const backHref = backFromCandidate ? `/candidates/${application.candidateAccountId}` : "/applications";
  const backLabel = backFromCandidate ? "Back to candidate" : "Back to applications";

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href={backHref}>{`← ${backLabel}`}</Link>
      </p>
      <ApplicationDetailsHeader
        applicationId={application.id}
        status={application.status}
        hasScheduledInterview={application.interviews.length > 0}
        candidateName={fullName}
        candidateEmail={candidate.email}
        candidateTimeZone={candidate.profile?.timeZone ?? null}
        jobTitle={application.jobPosting.title}
        title={application.jobPosting.title}
        subtitle={
          <>
            Application for {fullName} ·{" "}
            <span title={statusMeta.description}>{statusMeta.label}</span>
          </>
        }
        activityItems={statusActivityItems}
      />

      <ApplicationScheduledInterviews
        interviews={application.interviews.map((interview) => ({
          id: interview.id,
          startsAt: interview.startsAt,
          endsAt: interview.endsAt,
          schedulingTimeZone: interview.schedulingTimeZone ?? "UTC",
          candidateTimeZone: candidate.profile?.timeZone ?? null,
          notifyCandidateEmail: interview.notifyCandidateEmail,
          notificationSentAt: interview.notificationSentAt,
          scheduledByName: interview.scheduledByStaff?.name ?? null,
        }))}
      />

      <div className="bo-dash-grid">
        <ApplicationRelevanceSection
          applicationId={application.id}
          initialScore={application.relevanceScore}
          initialBreakdownText={application.relevanceBreakdown}
          initialScoredAt={application.relevanceScoredAt?.toISOString() ?? null}
        />

        <section className="bo-card bo-span-6" aria-labelledby="application-job-title">
          <h2 id="application-job-title" className="bo-card-title">
            Job and timeline
          </h2>
          <dl className="bo-candidate-detail-list">
            <div>
              <dt>Company</dt>
              <dd>{application.jobPosting.company.name}</dd>
            </div>
            <div>
              <dt>Job</dt>
              <dd>
                <Link href={`/jobs/${application.jobPosting.id}/edit`}>{application.jobPosting.title}</Link>
              </dd>
            </div>
            <div>
              <dt>Applied at</dt>
              <dd>{formatDateTimeUtc(application.appliedAt)}</dd>
            </div>
            <div>
              <dt>Updated at</dt>
              <dd>{formatDateTimeUtc(application.updatedAt)}</dd>
            </div>
          </dl>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-submission-title">
          <h2 id="application-submission-title" className="bo-card-title">
            Submission details
          </h2>
          <dl className="bo-candidate-detail-list">
            <div>
              <dt>Experience</dt>
              <dd>
                {application.experienceYears != null || application.experienceMonths != null
                  ? `${application.experienceYears ?? 0} yr, ${application.experienceMonths ?? 0} mo`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Domain experience</dt>
              <dd>
                {application.hasDomainExperience === null
                  ? "—"
                  : application.hasDomainExperience
                    ? "Yes"
                    : "No"}
              </dd>
            </div>
            <div>
              <dt>Notice period</dt>
              <dd>{noticeLines.length > 0 ? noticeLines.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>Salary expectation (annual)</dt>
              <dd>{salaryFormatted}</dd>
            </div>
            <div>
              <dt>Willing to relocate</dt>
              <dd>
                {application.willingToRelocate === null ? "—" : application.willingToRelocate ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt>Work mode preference</dt>
              <dd>{application.workModePreference?.trim() || "—"}</dd>
            </div>
            <div>
              <dt>Legally authorized to work</dt>
              <dd>
                {application.isLegallyAuthorizedToWork === null
                  ? "—"
                  : application.isLegallyAuthorizedToWork
                    ? "Yes"
                    : "No"}
              </dd>
            </div>
          </dl>
          {application.shortMotivation?.trim() ? (
            <div style={{ marginTop: "0.75rem" }}>
              <p className="bo-candidate-insight-label" style={{ marginBottom: "0.35rem" }}>
                Motivation
              </p>
              <p className="bo-admin-muted" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {application.shortMotivation}
              </p>
            </div>
          ) : null}
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-documents-title">
          <h2 id="application-documents-title" className="bo-card-title">
            Documents
          </h2>
          <dl className="bo-candidate-detail-list">
            <div>
              <dt>CV for this application</dt>
              <dd>
                {hasApplicationCv ? (
                  <a href={attachmentCvHref} target="_blank" rel="noopener noreferrer">
                    Download submitted CV
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt>Default CV (profile)</dt>
              <dd>
                {defaultResumeUrl ? (
                  <a href={defaultResumeUrl} target="_blank" rel="noopener noreferrer">
                    Open default CV
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt>Cover letter</dt>
              <dd>
                {coverLetterRow?.mode === "file" ? (
                  <a href={attachmentCoverHref} target="_blank" rel="noopener noreferrer">
                    Download cover letter{coverLetterRow.fileName ? ` (${coverLetterRow.fileName})` : ""}
                  </a>
                ) : coverLetterRow?.mode === "text" && coverLetterRow.body?.trim() ? (
                  <span>See below</span>
                ) : legacyCoverLetterText ? (
                  <span>See below</span>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-candidate-link-title">
          <h2 id="application-candidate-link-title" className="bo-card-title">
            Applicant
          </h2>
          <p className="bo-admin-muted" style={{ marginTop: 0 }}>
            <Link href={`/candidates/${candidate.id}?from=applications`} className="bo-candidate-name-link">
              {fullName}
            </Link>
            <span style={{ display: "block", marginTop: "0.35rem" }}>{candidate.email}</span>
          </p>
        </section>

        {showCoverLetterTextSection ? (
          <section className="bo-card bo-span-12" aria-labelledby="application-cover-body-title">
            <h2 id="application-cover-body-title" className="bo-card-title">
              Cover letter text
            </h2>
            {coverLetterRow?.mode === "text" && coverLetterRow.body?.trim() ? (
              <p className="bo-admin-muted" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {coverLetterRow.body}
              </p>
            ) : legacyCoverLetterText ? (
              <p className="bo-admin-muted" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {legacyCoverLetterText}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="bo-card bo-span-6" aria-labelledby="application-profile-overview">
          <h2 id="application-profile-overview" className="bo-card-title">
            Profile overview
          </h2>
          <dl className="bo-candidate-detail-list">
            <div>
              <dt>Name</dt>
              <dd>{fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{candidate.email}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {candidate.status
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{candidate.profile?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Registered on</dt>
              <dd>{new Date(candidate.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Last login</dt>
              <dd>{candidate.lastLoginAt ? new Date(candidate.lastLoginAt).toLocaleString() : "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-account-insights">
          <h2 id="application-account-insights" className="bo-card-title">
            Account insights
          </h2>
          <div className="bo-candidate-insight-strip bo-candidate-insight-strip--stacked">
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Applications</p>
              <p className="bo-candidate-insight-value">{candidateApplicationCount}</p>
            </article>
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Bookmarked jobs</p>
              <p className="bo-candidate-insight-value">{candidate.bookmarks.length}</p>
            </article>
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Auth providers linked</p>
              <p className="bo-candidate-insight-value">{candidate.authProviders.length}</p>
            </article>
          </div>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-experience">
          <h2 id="application-experience" className="bo-card-title">
            Experience
          </h2>
          {candidate.cvExperience.length === 0 ? (
            <p className="bo-admin-muted">No experience records found.</p>
          ) : (
            <div>
              {candidate.cvExperience.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 55%, white)",
                  }}
                >
                  <p className="bo-candidate-insight-value" style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {item.role || "—"}
                  </p>
                  <p className="bo-candidate-insight-label" style={{ marginBottom: "0.25rem" }}>
                    {item.company || "—"}
                  </p>
                  <p className="bo-admin-muted" style={{ marginBottom: 0 }}>
                    {item.startDate || "—"} - {item.endDate || "Present"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="application-education">
          <h2 id="application-education" className="bo-card-title">
            Education
          </h2>
          {candidate.cvEducation.length === 0 ? (
            <p className="bo-admin-muted">No education records found.</p>
          ) : (
            <div>
              {candidate.cvEducation.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 55%, white)",
                  }}
                >
                  <p className="bo-candidate-insight-value" style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {item.qualification || "—"}
                  </p>
                  <p className="bo-candidate-insight-label" style={{ marginBottom: "0.25rem" }}>
                    {item.institution || "—"}
                  </p>
                  <p className="bo-admin-muted" style={{ marginBottom: 0 }}>
                    {item.startDate || "—"} - {item.endDate || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
