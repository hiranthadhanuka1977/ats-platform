import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Candidate Details",
  description: "View candidate profile and application history.",
};

function titleCaseStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CandidateDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const candidate = await prisma.candidateAccount.findUnique({
    where: { id },
    include: {
      profile: true,
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
              <dd>{titleCaseStatus(candidate.status)}</dd>
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
                      <td>{titleCaseStatus(application.status)}</td>
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
