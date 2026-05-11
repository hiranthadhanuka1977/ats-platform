"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ApplicationStatusValue } from "@ats-platform/types";
import { getApplicationStatusMeta } from "@ats-platform/types";

type ApplicationListItem = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
};

type Props = {
  initialApplications: ApplicationListItem[];
};

const PIPELINE_STATUSES: ApplicationStatusValue[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "interview_completed",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
];

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

function normalizeForPipeline(status: string): ApplicationStatusValue {
  if (status === "interview") return "interview_scheduled";
  const known = PIPELINE_STATUSES.find((item) => item === status);
  return known ?? "submitted";
}

export function ApplicationsPageClient({ initialApplications }: Props) {
  const [activeTab, setActiveTab] = useState<"table" | "pipeline">("table");
  const [items, setItems] = useState<ApplicationListItem[]>(initialApplications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byStatus = new Map<ApplicationStatusValue, ApplicationListItem[]>();
    for (const status of PIPELINE_STATUSES) byStatus.set(status, []);
    for (const item of items) {
      const normalized = normalizeForPipeline(item.status);
      byStatus.get(normalized)?.push(item);
    }
    return byStatus;
  }, [items]);

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

  async function patchStatus(applicationId: string, nextStatus: ApplicationStatusValue) {
    const previous = items;
    setError(null);
    setUpdatingId(applicationId);
    setItems((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
    try {
      const response = await fetch(`/api/backoffice/applications/${applicationId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        data?: { id: string; status: string; updatedAt: string };
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message || "Could not update application status.");
      }
      setItems((current) =>
        current.map((item) =>
          item.id === applicationId
            ? { ...item, status: payload.data?.status ?? nextStatus, updatedAt: payload.data?.updatedAt ?? item.updatedAt }
            : item,
        ),
      );
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Could not update application status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <div className="bo-candidate-tabs" role="tablist" aria-label="Applications views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "table"}
          className={`bo-candidate-tab ${activeTab === "table" ? "is-active" : ""}`}
          onClick={() => setActiveTab("table")}
        >
          Table view
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pipeline"}
          className={`bo-candidate-tab ${activeTab === "pipeline" ? "is-active" : ""}`}
          onClick={() => setActiveTab("pipeline")}
        >
          Pipeline
        </button>
      </div>

      {error ? (
        <div className="bo-admin-alert" role="alert" style={{ marginBottom: "0.75rem" }}>
          {error}
        </div>
      ) : null}

      {activeTab === "table" ? (
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
                                <Link href={`/candidates/${group.candidate.id}`} className="bo-candidate-name-link">
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
                          <td>{application.job.title}</td>
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
        <section className="bo-card bo-span-12" aria-labelledby="applications-pipeline-title">
          <h2 id="applications-pipeline-title" className="bo-card-title">
            Applications Pipeline
          </h2>
          <p className="bo-page-sub">Drag a card to another status column to update it.</p>

          <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
            {PIPELINE_STATUSES.map((status) => {
              const columnItems = grouped.get(status) ?? [];
              const meta = getApplicationStatusMeta(status);
              return (
                <div
                  key={status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    if (!id || id === updatingId) return;
                    void patchStatus(id, status);
                    setDraggingId(null);
                  }}
                  style={{
                    minWidth: "270px",
                    width: "270px",
                    background: "var(--color-surface-alt)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "0.6rem",
                  }}
                >
                  <div style={{ marginBottom: "0.55rem" }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{meta.label}</p>
                    <p className="bo-page-sub" style={{ margin: "0.2rem 0 0" }}>
                      {columnItems.length} item{columnItems.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {columnItems.map((item) => (
                      <article
                        key={item.id}
                        draggable={updatingId !== item.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", item.id);
                          setDraggingId(item.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        style={{
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          padding: "0.55rem 0.6rem",
                          background: "#fff",
                          opacity: draggingId === item.id ? 0.55 : 1,
                          cursor: updatingId === item.id ? "progress" : "grab",
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 600 }}>{item.job.title}</p>
                        <p className="bo-page-sub" style={{ margin: "0.25rem 0 0" }}>
                          {item.candidate.name}
                        </p>
                        <p className="bo-page-sub" style={{ margin: "0.15rem 0 0" }}>
                          Applied {formatDateTime(item.appliedAt)}
                        </p>
                      </article>
                    ))}
                    {columnItems.length === 0 ? (
                      <p className="bo-admin-muted" style={{ margin: "0.2rem 0" }}>
                        Drop cards here
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
