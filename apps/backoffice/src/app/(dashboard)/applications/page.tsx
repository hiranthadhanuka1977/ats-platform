import type { Metadata } from "next";
import Link from "next/link";
import { getApplicationStatusMeta } from "@ats-platform/types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review and manage candidate applications.",
};

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: {
      candidateAccount: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      jobPosting: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    take: 500,
  });

  return (
    <main id="main-content" className="bo-content">
      <h1 className="bo-page-title">Applications</h1>
      <p className="bo-page-sub">All submitted applications are listed below.</p>

      <section className="bo-card bo-span-12" aria-labelledby="applications-list-title">
        <h2 id="applications-list-title" className="bo-card-title">
          Application Listing
        </h2>

        {applications.length === 0 ? (
          <p className="bo-admin-muted">No applications submitted yet.</p>
        ) : (
          <div className="bo-admin-table-scroll">
            <table className="bo-admin-table bo-jobs-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Applied At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const fullName =
                    `${application.candidateAccount.profile?.firstName ?? ""} ${application.candidateAccount.profile?.lastName ?? ""}`.trim() ||
                    "Unnamed Candidate";
                  return (
                    <tr key={application.id}>
                      <td>
                        <Link href={`/candidates/${application.candidateAccount.id}`} className="bo-candidate-name-link">
                          {fullName}
                        </Link>
                      </td>
                      <td>{application.candidateAccount.email}</td>
                      <td>{application.jobPosting.title}</td>
                      <td title={getApplicationStatusMeta(application.status).description}>
                        {getApplicationStatusMeta(application.status).label}
                      </td>
                      <td>{new Date(application.appliedAt).toLocaleString()}</td>
                      <td>{new Date(application.updatedAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
