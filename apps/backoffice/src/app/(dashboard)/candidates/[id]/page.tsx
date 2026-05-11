import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicationStatusMeta } from "@ats-platform/types";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Candidate Details",
  description: "View candidate profile and application history.",
};

export default async function CandidateDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const myApplicationsBaseUrl = process.env.NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL ?? "http://localhost:3002";

  const candidate = await prisma.candidateAccount.findUnique({
    where: { id },
    include: {
      profile: true,
      cvEducation: {
        orderBy: { createdAt: "desc" },
      },
      cvExperience: {
        orderBy: { createdAt: "desc" },
      },
      applications: {
        orderBy: { appliedAt: "desc" },
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      bookmarks: true,
      authProviders: true,
    },
  });

  if (!candidate) {
    notFound();
  }

  const fullName = `${candidate.profile?.firstName ?? ""} ${candidate.profile?.lastName ?? ""}`.trim() || "Unnamed Candidate";
  const defaultResumeUrl = candidate.profile?.resumeUrl
    ? candidate.profile.resumeUrl.startsWith("http")
      ? candidate.profile.resumeUrl
      : `${myApplicationsBaseUrl.replace(/\/$/, "")}${candidate.profile.resumeUrl}`
    : null;

  return (
    <main id="main-content" className="bo-content">
      <p className="bo-jobs-back">
        <Link href="/candidates/all">← Back to candidates</Link>
      </p>
      <div className="bo-page-header-actions">
        <div>
          <h1 className="bo-page-title">{fullName}</h1>
          <p className="bo-page-sub">Candidate details</p>
        </div>
      </div>

      <div className="bo-dash-grid">
        <section className="bo-card bo-span-6" aria-labelledby="candidate-profile-overview">
          <h2 id="candidate-profile-overview" className="bo-card-title">
            Profile Overview
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
              <dd>{candidate.status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{candidate.profile?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Registered On</dt>
              <dd>{new Date(candidate.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Last Login</dt>
              <dd>{candidate.lastLoginAt ? new Date(candidate.lastLoginAt).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt>Default CV</dt>
              <dd>
                {defaultResumeUrl ? (
                  <a href={defaultResumeUrl} target="_blank" rel="noopener noreferrer">
                    View Default CV
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="candidate-account-insights">
          <h2 id="candidate-account-insights" className="bo-card-title">
            Account Insights
          </h2>
          <div className="bo-candidate-insight-strip bo-candidate-insight-strip--stacked">
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Applications</p>
              <p className="bo-candidate-insight-value">{candidate.applications.length}</p>
            </article>
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Bookmarked Jobs</p>
              <p className="bo-candidate-insight-value">{candidate.bookmarks.length}</p>
            </article>
            <article className="bo-candidate-insight-item">
              <p className="bo-candidate-insight-label">Auth Providers Linked</p>
              <p className="bo-candidate-insight-value">{candidate.authProviders.length}</p>
            </article>
          </div>
        </section>

        <section className="bo-card bo-span-6" aria-labelledby="candidate-experience-history">
          <h2 id="candidate-experience-history" className="bo-card-title">
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

        <section className="bo-card bo-span-6" aria-labelledby="candidate-education-history">
          <h2 id="candidate-education-history" className="bo-card-title">
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

        <section className="bo-card bo-span-12" aria-labelledby="candidate-application-history">
          <h2 id="candidate-application-history" className="bo-card-title">
            Application History
          </h2>
          {candidate.applications.length === 0 ? (
            <p className="bo-admin-muted">No applications submitted yet.</p>
          ) : (
            <div className="bo-admin-table-scroll">
              <table className="bo-admin-table bo-jobs-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied At</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {candidate.applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.jobPosting.title}</td>
                      <td title={getApplicationStatusMeta(application.status).description}>
                        {getApplicationStatusMeta(application.status).label}
                      </td>
                      <td>{new Date(application.appliedAt).toLocaleString()}</td>
                      <td>{new Date(application.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
