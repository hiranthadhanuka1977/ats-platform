"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PipelineApplicationCard } from "@/components/applications/PipelineApplicationCard";
import { usePipelineRelevanceScores } from "@/hooks/usePipelineRelevanceScores";
import type { ApplicationStatusValue } from "@ats-platform/types";
import { getApplicationStatusMeta } from "@ats-platform/types";

type ApplicationListItem = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  relevance?: { score: number; breakdownText: string | null } | null;
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

/** Monday 00:00:00.000 UTC for the UTC week containing `date`. */
function startOfUtcWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffFromMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Week offset from the current UTC week (0 = this week, -1 = previous, …). */
function pipelineWeekOffsetForDate(date: Date): number {
  const thisWeekStart = startOfUtcWeekMonday(new Date()).getTime();
  const targetWeekStart = startOfUtcWeekMonday(date).getTime();
  return Math.round((targetWeekStart - thisWeekStart) / (7 * 24 * 60 * 60 * 1000));
}

function formatUtcWeekLabel(weekStartMonday: Date): string {
  const weekEndSunday = addUtcDays(weekStartMonday, 6);
  const sameMonthYear =
    weekStartMonday.getUTCFullYear() === weekEndSunday.getUTCFullYear() &&
    weekStartMonday.getUTCMonth() === weekEndSunday.getUTCMonth();
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(weekEndSunday);
  if (sameMonthYear) {
    return `${weekStartMonday.getUTCDate()}–${weekEndSunday.getUTCDate()} ${monthYear}`;
  }
  const left = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(weekStartMonday);
  const right = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(weekEndSunday);
  return `${left} – ${right}`;
}

function groupByPipelineStatus(list: ApplicationListItem[]) {
  const byStatus = new Map<ApplicationStatusValue, ApplicationListItem[]>();
  for (const status of PIPELINE_STATUSES) byStatus.set(status, []);
  for (const item of list) {
    const normalized = normalizeForPipeline(item.status);
    byStatus.get(normalized)?.push(item);
  }
  return byStatus;
}

export function ApplicationsPageClient({ initialApplications }: Props) {
  const [activeTab, setActiveTab] = useState<"table" | "pipeline">("table");
  const [items, setItems] = useState<ApplicationListItem[]>(initialApplications);
  const [pipelineWeekOffset, setPipelineWeekOffset] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pipelineFullscreen, setPipelineFullscreen] = useState(false);
  const [relevanceRefreshIds, setRelevanceRefreshIds] = useState<string[]>([]);
  const pipelineBoardRef = useRef<HTMLElement>(null);
  const pipelineFlyoverLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      setPipelineFullscreen(document.fullscreenElement === pipelineBoardRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (activeTab !== "pipeline" && document.fullscreenElement === pipelineBoardRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [activeTab]);

  const togglePipelineFullscreen = useCallback(async () => {
    const el = pipelineBoardRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* browser blocked or unsupported */
    }
  }, []);

  const { pipelineWeekStart, pipelineWeekEndExclusive, pipelineWeekLabel } = useMemo(() => {
    const anchor = addUtcDays(startOfUtcWeekMonday(new Date()), pipelineWeekOffset * 7);
    const endExclusive = addUtcDays(anchor, 7);
    return {
      pipelineWeekStart: anchor,
      pipelineWeekEndExclusive: endExclusive,
      pipelineWeekLabel: formatUtcWeekLabel(anchor),
    };
  }, [pipelineWeekOffset]);

  const pipelineWeekItems = useMemo(() => {
    const startMs = pipelineWeekStart.getTime();
    const endMs = pipelineWeekEndExclusive.getTime();
    return items.filter((item) => {
      const t = new Date(item.updatedAt).getTime();
      if (Number.isNaN(t)) return false;
      return t >= startMs && t < endMs;
    });
  }, [items, pipelineWeekStart, pipelineWeekEndExclusive]);

  const pipelineGrouped = useMemo(() => groupByPipelineStatus(pipelineWeekItems), [pipelineWeekItems]);

  const { scores: relevanceById, scoringUnavailableMessage } = usePipelineRelevanceScores(
    activeTab === "pipeline",
    pipelineWeekItems,
    relevanceRefreshIds,
  );

  const requestRelevanceRefresh = useCallback((applicationId: string) => {
    setRelevanceRefreshIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    );
  }, []);

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
    const optimisticUpdatedAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status: nextStatus, updatedAt: optimisticUpdatedAt }
          : item,
      ),
    );
    setPipelineWeekOffset(pipelineWeekOffsetForDate(new Date(optimisticUpdatedAt)));
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
      const serverUpdatedAt = payload.data?.updatedAt;
      setItems((current) =>
        current.map((item) =>
          item.id === applicationId
            ? { ...item, status: payload.data?.status ?? nextStatus, updatedAt: serverUpdatedAt ?? item.updatedAt }
            : item,
        ),
      );
      if (serverUpdatedAt) {
        const targetWeekOffset = pipelineWeekOffsetForDate(new Date(serverUpdatedAt));
        setPipelineWeekOffset((current) => (current === targetWeekOffset ? current : targetWeekOffset));
      }
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
        <section
          ref={pipelineBoardRef}
          className="bo-card bo-span-12 bo-pipeline-board"
          aria-labelledby="applications-pipeline-title"
        >
          <div className="bo-pipeline-board-header">
            <h2 id="applications-pipeline-title" className="bo-card-title">
              Applications Pipeline
            </h2>
            <button
              type="button"
              className="bo-candidate-tab"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={() => void togglePipelineFullscreen()}
              aria-pressed={pipelineFullscreen}
              aria-label={pipelineFullscreen ? "Exit full screen pipeline" : "Full screen pipeline"}
            >
              {pipelineFullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
          <div className="bo-pipeline-board-body">
          <p className="bo-page-sub">
            Showing applications by the week they were last updated (UTC, Monday–Sunday). Each card shows an AI
            relevance score (0–100%) for the submitted CV vs the job (saved until job, CV, or answers change).
            Hover the ring for criteria; use Recalculate to score again on demand. Click a card for full application
            details.
            Drag a card to another status column to update it.
          </p>

          {scoringUnavailableMessage ? (
            <div className="bo-admin-alert" role="status" style={{ marginBottom: "0.75rem" }}>
              {scoringUnavailableMessage}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.85rem",
            }}
          >
            <button
              type="button"
              className="bo-candidate-tab"
              style={{ cursor: "pointer" }}
              onClick={() => setPipelineWeekOffset((o) => o - 1)}
              aria-label="Previous week"
            >
              ← Previous week
            </button>
            <button
              type="button"
              className="bo-candidate-tab"
              disabled={pipelineWeekOffset >= 0}
              title={
                pipelineWeekOffset >= 0 ? "Future weeks are not available" : "Go to the following week"
              }
              style={{
                cursor: pipelineWeekOffset >= 0 ? "not-allowed" : "pointer",
                opacity: pipelineWeekOffset >= 0 ? 0.45 : 1,
              }}
              onClick={() => setPipelineWeekOffset((o) => Math.min(0, o + 1))}
              aria-label="Next week"
            >
              Next week →
            </button>
            {pipelineWeekOffset !== 0 ? (
              <button
                type="button"
                className="bo-candidate-tab is-active"
                style={{ cursor: "pointer" }}
                onClick={() => setPipelineWeekOffset(0)}
              >
                This week
              </button>
            ) : null}
            <p
              className="bo-page-sub"
              style={{ margin: 0, marginLeft: "auto", fontWeight: 600 }}
              aria-live="polite"
            >
              Week: {pipelineWeekLabel}
            </p>
          </div>

          {pipelineWeekItems.length === 0 ? (
            <p className="bo-admin-muted" style={{ marginBottom: "0.75rem" }}>
              No applications updated in this week.
            </p>
          ) : null}

          <div
            className="bo-pipeline-columns"
            style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}
          >
            {PIPELINE_STATUSES.map((status) => {
              const columnItems = pipelineGrouped.get(status) ?? [];
              const meta = getApplicationStatusMeta(status);
              return (
                <div
                  key={status}
                  className="bo-pipeline-column"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    if (!id || id === updatingId) return;
                    const dragged = items.find((item) => item.id === id);
                    if (dragged && normalizeForPipeline(dragged.status) === status) {
                      setDraggingId(null);
                      return;
                    }
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

                  <div className="bo-pipeline-column-cards" style={{ display: "grid", gap: "0.5rem" }}>
                    {columnItems.map((item) => (
                      <PipelineApplicationCard
                        key={item.id}
                        item={item}
                        disabled={updatingId === item.id}
                        draggingId={draggingId}
                        relevance={relevanceById[item.id]}
                        flyoverLayerRef={pipelineFlyoverLayerRef}
                        onRefreshRelevance={requestRelevanceRefresh}
                        onDragStart={(applicationId, event) => {
                          event.dataTransfer.setData("text/plain", applicationId);
                          setDraggingId(applicationId);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                      />
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
          </div>
          <div ref={pipelineFlyoverLayerRef} className="bo-pipeline-flyover-layer" aria-hidden />
        </section>
      )}
    </>
  );
}
