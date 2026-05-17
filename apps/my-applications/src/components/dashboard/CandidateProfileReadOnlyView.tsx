import Link from "next/link";
import { getApplicationStatusMeta } from "@ats-platform/types";
import type { ParsedCvPayload } from "@/types/cv-parse";

export type ProfileViewApplication = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  job: { slug: string; title: string };
};

type Props = {
  payload: ParsedCvPayload;
  account: {
    status: string;
    createdAt: string | null;
    lastLoginAt: string | null;
    resumeUrl: string | null;
  };
  insights: {
    applicationCount: number;
    bookmarkCount: number;
    authProviderCount: number;
  };
  applications: ProfileViewApplication[];
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

const entryDividerStyle = {
  padding: "0.5rem 0",
  borderBottom: "1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 55%, white)",
} as const;

export function CandidateProfileReadOnlyView({ payload, account, insights, applications }: Props) {
  const fullName = payload.candidate.fullName.trim() || "Unnamed Candidate";

  return (
    <div className="bo-dash-grid">
      <section className="bo-card bo-span-6" aria-labelledby="my-profile-overview">
        <h2 id="my-profile-overview" className="bo-card-title">
          Profile Overview
        </h2>
        <dl className="bo-candidate-detail-list">
          <div>
            <dt>Name</dt>
            <dd>{fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{payload.candidate.email || "—"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{account.status}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{payload.candidate.phone?.trim() || "—"}</dd>
          </div>
          <div>
            <dt>Current title</dt>
            <dd>{payload.candidate.currentTitle?.trim() || "—"}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{payload.candidate.location?.trim() || "—"}</dd>
          </div>
          <div>
            <dt>Registered on</dt>
            <dd>{formatDate(account.createdAt)}</dd>
          </div>
          <div>
            <dt>Last login</dt>
            <dd>{formatDateTime(account.lastLoginAt)}</dd>
          </div>
          <div>
            <dt>Default CV</dt>
            <dd>
              {account.resumeUrl ? (
                <a href={account.resumeUrl} target="_blank" rel="noopener noreferrer">
                  View default CV
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bo-card bo-span-6" aria-labelledby="my-profile-insights">
        <h2 id="my-profile-insights" className="bo-card-title">
          Account insights
        </h2>
        <div className="bo-candidate-insight-strip bo-candidate-insight-strip--stacked">
          <article className="bo-candidate-insight-item">
            <p className="bo-candidate-insight-label">Applications</p>
            <p className="bo-candidate-insight-value">{insights.applicationCount}</p>
          </article>
          <article className="bo-candidate-insight-item">
            <p className="bo-candidate-insight-label">Bookmarked jobs</p>
            <p className="bo-candidate-insight-value">{insights.bookmarkCount}</p>
          </article>
          <article className="bo-candidate-insight-item">
            <p className="bo-candidate-insight-label">Auth providers linked</p>
            <p className="bo-candidate-insight-value">{insights.authProviderCount}</p>
          </article>
        </div>
      </section>

      <section className="bo-card bo-span-6" aria-labelledby="my-profile-experience">
        <h2 id="my-profile-experience" className="bo-card-title">
          Experience
        </h2>
        {payload.experience.length === 0 ? (
          <p className="bo-admin-muted">No experience records found.</p>
        ) : (
          <div>
            {payload.experience.map((item, index) => (
              <div key={`exp-${index}-${item.company}-${item.role}`} style={entryDividerStyle}>
                <p className="bo-candidate-insight-value" style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                  {item.role?.trim() || "—"}
                </p>
                <p className="bo-candidate-insight-label" style={{ marginBottom: "0.25rem" }}>
                  {item.company?.trim() || "—"}
                </p>
                <p className="bo-admin-muted" style={{ marginBottom: 0 }}>
                  {item.startDate?.trim() || "—"} - {item.endDate?.trim() || "Present"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bo-card bo-span-6" aria-labelledby="my-profile-education">
        <h2 id="my-profile-education" className="bo-card-title">
          Education
        </h2>
        {payload.education.length === 0 ? (
          <p className="bo-admin-muted">No education records found.</p>
        ) : (
          <div>
            {payload.education.map((item, index) => (
              <div key={`edu-${index}-${item.institution}-${item.qualification}`} style={entryDividerStyle}>
                <p className="bo-candidate-insight-value" style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                  {item.qualification?.trim() || "—"}
                </p>
                <p className="bo-candidate-insight-label" style={{ marginBottom: "0.25rem" }}>
                  {item.institution?.trim() || "—"}
                </p>
                <p className="bo-admin-muted" style={{ marginBottom: 0 }}>
                  {item.startDate?.trim() || "—"} - {item.endDate?.trim() || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bo-card bo-span-12" aria-labelledby="my-profile-application-history">
        <h2 id="my-profile-application-history" className="bo-card-title">
          Application history
        </h2>
        {applications.length === 0 ? (
          <p className="bo-admin-muted">No applications submitted yet.</p>
        ) : (
          <div className="bo-admin-table-scroll">
            <table className="bo-admin-table bo-jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Applied at</th>
                  <th>Updated at</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const statusMeta = getApplicationStatusMeta(application.status);
                  return (
                    <tr key={application.id}>
                      <td>
                        <Link href={`/jobs/${application.job.slug}`} className="bo-candidate-name-link">
                          {application.job.title}
                        </Link>
                      </td>
                      <td title={statusMeta.description}>{statusMeta.label}</td>
                      <td>{formatDateTime(application.appliedAt)}</td>
                      <td>{formatDateTime(application.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
