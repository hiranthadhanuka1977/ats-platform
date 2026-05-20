"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ApplicationsPipelineBoard,
  type PipelineApplicationItem,
} from "@/components/applications/pipeline/ApplicationsPipelineBoard";
import { IconLayoutKanban, IconLayoutList } from "@/components/backoffice/nav-icons";
import { getApplicationStatusMeta } from "@ats-platform/types";

type ApplicationListItem = PipelineApplicationItem;

type Props = {
  initialApplications: ApplicationListItem[];
};

function formatDateTime(value: string): string {
  const date = new Date(value);
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

export function ApplicationsPageClient({ initialApplications }: Props) {
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("pipeline");
  const [items, setItems] = useState<ApplicationListItem[]>(initialApplications);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.classList.toggle("bo-content--pipeline", viewMode === "pipeline");
    return () => main.classList.remove("bo-content--pipeline");
  }, [viewMode]);

  const groupedByCandidate = useMemo(() => {
    const map = new Map<
      string,
      { candidate: ApplicationListItem["candidate"]; applications: ApplicationListItem[] }
    >();
    for (const item of items) {
      const existing = map.get(item.candidate.id);
      if (existing) {
        existing.applications.push(item);
      } else {
        map.set(item.candidate.id, {
          candidate: item.candidate,
          applications: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <>
      <div className="bo-page-header-actions bo-applications-page-header">
        <h1 className="bo-page-title">Applications</h1>
        <div className="bo-jobs-view-toggle" role="group" aria-label="Applications view">
          <button
            type="button"
            aria-pressed={viewMode === "pipeline"}
            aria-label="Pipeline view"
            title="Pipeline view"
            onClick={() => setViewMode("pipeline")}
          >
            <IconLayoutKanban />
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            title="List view"
            onClick={() => setViewMode("list")}
          >
            <IconLayoutList />
          </button>
        </div>
      </div>

      {error ? (
        <div className="bo-admin-alert" role="alert" style={{ marginBottom: "0.75rem" }}>
          {error}
        </div>
      ) : null}

      {viewMode === "list" ? (
        <section className="bo-card bo-span-12" aria-labelledby="applications-list-title">
          <h2 id="applications-list-title" className="bo-card-title">
            Application Listing
          </h2>

          {items.length === 0 ? (
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
                  {groupedByCandidate.map((group) =>
                    group.applications.map((application, index) => {
                      const statusMeta = getApplicationStatusMeta(application.status);
                      return (
                        <tr key={application.id}>
                          {index === 0 ? (
                            <>
                              <td rowSpan={group.applications.length} style={{ verticalAlign: "top" }}>
                                <Link
                                  href={`/candidates/${group.candidate.id}?from=applications`}
                                  className="bo-candidate-name-link"
                                >
                                  {group.candidate.name}
                                </Link>
                                {group.applications.length > 1 ? (
                                  <p className="bo-page-sub" style={{ margin: "0.25rem 0 0" }}>
                                    {group.applications.length} applications
                                  </p>
                                ) : null}
                              </td>
                              <td rowSpan={group.applications.length} style={{ verticalAlign: "top" }}>
                                {group.candidate.email}
                              </td>
                            </>
                          ) : null}
                          <td>
                            <Link href={`/applications/${application.id}`} className="bo-candidate-name-link">
                              {application.job.title}
                            </Link>
                          </td>
                          <td title={statusMeta.description}>{statusMeta.label}</td>
                          <td>{formatDateTime(application.appliedAt)}</td>
                          <td>{formatDateTime(application.updatedAt)}</td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <div className="bo-applications-pipeline-slot">
          <ApplicationsPipelineBoard
            items={items}
            onItemsChange={(updater) => setItems(updater)}
            onError={setError}
          />
        </div>
      )}
    </>
  );
}
