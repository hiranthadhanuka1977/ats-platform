import { prisma } from "@/lib/prisma";
import Link from "next/link";

type CandidateTableRow = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Shortlisted" | "New" | "Rejected" | "Hired" | "Locked" | "Disabled";
  latestApplication: string;
  location: string;
  phone: string;
};

function deriveStatus(params: {
  accountStatus: "pending_verification" | "active" | "locked" | "disabled";
  latestApplicationStatus?: string;
}): CandidateTableRow["status"] {
  if (params.accountStatus === "disabled") return "Disabled";
  if (params.accountStatus === "locked") return "Locked";
  if (params.accountStatus === "pending_verification") return "New";
  if (params.latestApplicationStatus === "shortlisted") return "Shortlisted";
  if (params.latestApplicationStatus === "rejected") return "Rejected";
  if (params.latestApplicationStatus === "offered") return "Hired";
  return "Active";
}

export async function fetchCandidateTableRows(): Promise<CandidateTableRow[]> {
  const rows = await prisma.candidateAccount.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      profile: true,
      applications: {
        orderBy: { appliedAt: "desc" },
        take: 1,
        include: {
          jobPosting: {
            select: {
              title: true,
              location: { select: { city: true } },
              experienceLevel: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const latest = row.applications[0];
    const fullName = `${row.profile?.firstName ?? ""} ${row.profile?.lastName ?? ""}`.trim();
    return {
      id: row.id,
      name: fullName || "Unnamed Candidate",
      email: row.email,
      status: deriveStatus({
        accountStatus: row.status,
        latestApplicationStatus: latest?.status,
      }),
      latestApplication: latest?.jobPosting?.title ?? "No application yet",
      location: latest?.jobPosting?.location?.city ?? "—",
      phone: row.profile?.phone?.trim() || "—",
    };
  });
}

type CandidatesAllContentProps = {
  candidates?: CandidateTableRow[];
};

export async function CandidatesAllContent({ candidates }: CandidatesAllContentProps) {
  const resolvedCandidates = candidates ?? (await fetchCandidateTableRows());
  return (
    <section className="bo-card bo-jobs-table-wrap bo-candidate-all-card" aria-labelledby="all-candidates-title">
      <div className="bo-jobs-table-toolbar">
        <h2 id="all-candidates-title" className="bo-card-title">
          All Candidates
        </h2>
      </div>
      {resolvedCandidates.length === 0 ? (
        <p className="bo-admin-muted">No candidates found in the database yet.</p>
      ) : null}
      <div className="bo-admin-table-scroll">
        <table className="bo-admin-table bo-jobs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Latest Application</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resolvedCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <Link href={`/candidates/${candidate.id}`} className="bo-candidate-name-link">
                    {candidate.name}
                  </Link>
                </td>
                <td>{candidate.location}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phone}</td>
                <td>{candidate.latestApplication}</td>
                <td>
                  <span className={`bo-candidate-status-pill bo-candidate-status-pill--${candidate.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {candidate.status}
                  </span>
                </td>
                <td className="bo-admin-table-actions">
                  <Link href={`/candidates/${candidate.id}/edit`} className="btn btn-secondary btn-sm">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
