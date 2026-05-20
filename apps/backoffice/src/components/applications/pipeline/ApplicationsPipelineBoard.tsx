"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVE_PIPELINE_STATUSES,
  canTransition,
  getAllowedTargetStatuses,
  isTerminalForDragDrop,
  normalizePipelineStatus,
  type PipelineStatus,
} from "@ats-platform/types";
import { getApplicationStatusMeta } from "@ats-platform/types";
import { PipelineApplicationCard, type PipelineCardItem } from "@/components/applications/PipelineApplicationCard";
import { IconFullscreen, IconFullscreenExit } from "@/components/backoffice/nav-icons";
import { ScheduleInterviewModal } from "@/components/applications/ScheduleInterviewModal";
import {
  PipelineHiredModal,
  PipelineMissingInterviewModal,
  PipelineRejectModal,
  PipelineReopenModal,
  PipelineWithdrawModal,
} from "@/components/applications/pipeline/PipelineStatusModals";
import { usePipelineRelevanceScores } from "@/hooks/usePipelineRelevanceScores";

export type PipelineApplicationItem = PipelineCardItem & {
  status: string;
  hasScheduledInterview: boolean;
};

type PipelineBoardTab = "active" | "rejected" | "withdrawn" | "all";

type Props = {
  items: PipelineApplicationItem[];
  onItemsChange: (updater: (current: PipelineApplicationItem[]) => PipelineApplicationItem[]) => void;
  onError: (message: string | null) => void;
};

function normalizeStatus(status: string): PipelineStatus {
  return normalizePipelineStatus(status) ?? "submitted";
}

function startOfUtcWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffFromMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

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

function groupByStatus(list: PipelineApplicationItem[], statuses: PipelineStatus[]) {
  const map = new Map<PipelineStatus, PipelineApplicationItem[]>();
  for (const status of statuses) map.set(status, []);
  for (const item of list) {
    const key = normalizeStatus(item.status);
    if (map.has(key)) map.get(key)?.push(item);
  }
  return map;
}

const ALL_BOARD_STATUSES: PipelineStatus[] = [...ACTIVE_PIPELINE_STATUSES, "rejected", "withdrawn"];

type PendingMove = {
  applicationId: string;
  targetStatus: PipelineStatus;
  expectedUpdatedAt: string;
};

type UndoablePipelineMove = {
  applicationId: string;
  previousStatus: string;
  currentStatus: string;
  expectedUpdatedAt: string;
  candidateName: string;
  jobTitle: string;
};

export function ApplicationsPipelineBoard({ items, onItemsChange, onError }: Props) {
  const [boardTab, setBoardTab] = useState<PipelineBoardTab>("active");
  const [pipelineWeekOffset, setPipelineWeekOffset] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<{
    status: PipelineStatus;
    valid: boolean;
  } | null>(null);
  const [pipelineFullscreen, setPipelineFullscreen] = useState(false);
  const [relevanceRefreshIds, setRelevanceRefreshIds] = useState<string[]>([]);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [modalApp, setModalApp] = useState<PipelineApplicationItem | null>(null);
  const [modalKind, setModalKind] = useState<
    "reject" | "withdraw" | "hired" | "reopen" | "missing_interview" | null
  >(null);
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false);
  const [lastUndo, setLastUndo] = useState<UndoablePipelineMove | null>(null);
  const [undoing, setUndoing] = useState(false);

  const pipelineBoardRef = useRef<HTMLElement>(null);
  const pipelineFlyoverLayerRef = useRef<HTMLDivElement>(null);

  const columnStatuses = useMemo((): PipelineStatus[] => {
    if (boardTab === "active") return ACTIVE_PIPELINE_STATUSES;
    if (boardTab === "rejected") return ["rejected"];
    if (boardTab === "withdrawn") return ["withdrawn"];
    return ALL_BOARD_STATUSES;
  }, [boardTab]);

  const { pipelineWeekStart, pipelineWeekEndExclusive, pipelineWeekLabel } = useMemo(() => {
    const anchor = addUtcDays(startOfUtcWeekMonday(new Date()), pipelineWeekOffset * 7);
    return {
      pipelineWeekStart: anchor,
      pipelineWeekEndExclusive: addUtcDays(anchor, 7),
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

  const tabFilteredItems = useMemo(() => {
    if (boardTab === "active") {
      return pipelineWeekItems.filter((item) => {
        const s = normalizeStatus(item.status);
        return ACTIVE_PIPELINE_STATUSES.includes(s);
      });
    }
    if (boardTab === "rejected") {
      return pipelineWeekItems.filter((item) => normalizeStatus(item.status) === "rejected");
    }
    if (boardTab === "withdrawn") {
      return pipelineWeekItems.filter((item) => normalizeStatus(item.status) === "withdrawn");
    }
    return pipelineWeekItems;
  }, [boardTab, pipelineWeekItems]);

  const grouped = useMemo(
    () => groupByStatus(tabFilteredItems, columnStatuses),
    [tabFilteredItems, columnStatuses],
  );

  const { scores: relevanceById, scoringUnavailableMessage } = usePipelineRelevanceScores(
    true,
    tabFilteredItems,
    relevanceRefreshIds,
  );

  const draggingItem = draggingId ? items.find((i) => i.id === draggingId) : null;

  useEffect(() => {
    const onFullscreenChange = () => {
      setPipelineFullscreen(document.fullscreenElement === pipelineBoardRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePipelineFullscreen = useCallback(async () => {
    const el = pipelineBoardRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* unsupported */
    }
  }, []);

  const requestRelevanceRefresh = useCallback((applicationId: string) => {
    setRelevanceRefreshIds((current) =>
      current.includes(applicationId) ? current : [...current, applicationId],
    );
  }, []);

  const applyServerUpdate = useCallback(
    (applicationId: string, status: string, updatedAt: string) => {
      onItemsChange((current) =>
        current.map((item) =>
          item.id === applicationId ? { ...item, status, updatedAt } : item,
        ),
      );
      setPipelineWeekOffset(pipelineWeekOffsetForDate(new Date(updatedAt)));
    },
    [onItemsChange],
  );

  const registerUndoableMove = useCallback(
    (
      applicationId: string,
      previousStatus: string,
      currentStatus: string,
      updatedAt: string,
    ) => {
      const item = items.find((row) => row.id === applicationId);
      if (!item) return;
      setLastUndo({
        applicationId,
        previousStatus,
        currentStatus,
        expectedUpdatedAt: updatedAt,
        candidateName: item.candidate.name,
        jobTitle: item.job.title,
      });
    },
    [items],
  );

  async function patchStatus(
    applicationId: string,
    nextStatus: PipelineStatus,
    extra: Record<string, unknown> = {},
    expectedUpdatedAt?: string,
  ): Promise<boolean> {
    const previous = items;
    onError(null);
    setUpdatingId(applicationId);
    const optimisticUpdatedAt = new Date().toISOString();
    onItemsChange((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status: nextStatus, updatedAt: optimisticUpdatedAt }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/backoffice/applications/${applicationId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          expectedUpdatedAt,
          ...extra,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
        data?: { id: string; status: string; previousStatus: string; updatedAt: string };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not update application status.");
      }

      applyServerUpdate(applicationId, payload.data.status, payload.data.updatedAt);
      registerUndoableMove(
        applicationId,
        payload.data.previousStatus,
        payload.data.status,
        payload.data.updatedAt,
      );
      return true;
    } catch (err) {
      onItemsChange(() => previous);
      onError(err instanceof Error ? err.message : "Could not update application status.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  async function reopenStatus(
    applicationId: string,
    targetStatus: PipelineStatus,
    reason: string,
    note: string,
    expectedUpdatedAt: string,
  ): Promise<boolean> {
    const previous = items;
    onError(null);
    setUpdatingId(applicationId);

    try {
      const response = await fetch(`/api/backoffice/applications/${applicationId}/reopen`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus, reason, note, expectedUpdatedAt }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        data?: { status: string; previousStatus: string; updatedAt: string };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not reopen application.");
      }

      applyServerUpdate(applicationId, payload.data.status, payload.data.updatedAt);
      registerUndoableMove(
        applicationId,
        payload.data.previousStatus,
        payload.data.status,
        payload.data.updatedAt,
      );
      return true;
    } catch (err) {
      onItemsChange(() => previous);
      onError(err instanceof Error ? err.message : "Could not reopen application.");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }

  function beginMove(item: PipelineApplicationItem, targetStatus: PipelineStatus) {
    const from = normalizeStatus(item.status);
    if (from === targetStatus) return;

    if (!canTransition(item.status, targetStatus)) {
      onError(`This application cannot be moved from ${getApplicationStatusMeta(from).label} to ${getApplicationStatusMeta(targetStatus).label}.`);
      return;
    }

    const expectedUpdatedAt = item.updatedAt;

    if (targetStatus === "rejected") {
      setModalApp(item);
      setModalKind("reject");
      setPendingMove({ applicationId: item.id, targetStatus, expectedUpdatedAt });
      return;
    }
    if (targetStatus === "withdrawn") {
      setModalApp(item);
      setModalKind("withdraw");
      setPendingMove({ applicationId: item.id, targetStatus, expectedUpdatedAt });
      return;
    }
    if (from === "offered" && targetStatus === "hired") {
      setModalApp(item);
      setModalKind("hired");
      setPendingMove({ applicationId: item.id, targetStatus, expectedUpdatedAt });
      return;
    }
    if (targetStatus === "interview_scheduled" && !item.hasScheduledInterview) {
      setModalApp(item);
      setModalKind("missing_interview");
      setPendingMove({ applicationId: item.id, targetStatus, expectedUpdatedAt });
      return;
    }

    void patchStatus(item.id, targetStatus, {}, expectedUpdatedAt);
  }

  function closeModals() {
    setModalKind(null);
    setModalApp(null);
    setPendingMove(null);
    setScheduleInterviewOpen(false);
  }

  function openScheduleInterviewFromPrompt() {
    setModalKind(null);
    setPendingMove(null);
    setScheduleInterviewOpen(true);
  }

  function handleInterviewScheduled(applicationId: string) {
    const optimisticUpdatedAt = new Date().toISOString();
    onItemsChange((current) =>
      current.map((row) =>
        row.id === applicationId
          ? {
              ...row,
              status: "interview_scheduled",
              hasScheduledInterview: true,
              updatedAt: optimisticUpdatedAt,
            }
          : row,
      ),
    );
    onError(null);
    closeModals();
    setModalApp(null);
  }

  async function undoLastMove() {
    if (!lastUndo || undoing || updatingId) return;

    onError(null);
    setUndoing(true);
    const snapshot = items;

    try {
      const response = await fetch(
        `/api/backoffice/applications/${lastUndo.applicationId}/status/undo`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previousStatus: lastUndo.previousStatus,
            currentStatus: lastUndo.currentStatus,
            expectedUpdatedAt: lastUndo.expectedUpdatedAt,
          }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        data?: { status: string; updatedAt: string };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not undo the last move.");
      }

      applyServerUpdate(lastUndo.applicationId, payload.data.status, payload.data.updatedAt);
      setLastUndo(null);
    } catch (err) {
      onItemsChange(() => snapshot);
      onError(err instanceof Error ? err.message : "Could not undo the last move.");
    } finally {
      setUndoing(false);
    }
  }

  function handleColumnDragOver(status: PipelineStatus, event: React.DragEvent) {
    event.preventDefault();
    if (!draggingItem || boardTab !== "active") {
      setDragOverColumn(null);
      return;
    }
    const valid = canTransition(draggingItem.status, status);
    event.dataTransfer.dropEffect = valid ? "move" : "none";
    setDragOverColumn({ status, valid });
  }

  return (
    <>
      <section
        ref={pipelineBoardRef}
        className="bo-card bo-span-12 bo-pipeline-board"
        aria-label="Applications pipeline"
      >
        {lastUndo ? (
          <div className="bo-pipeline-board-header">
            <button
              type="button"
              className="btn btn-secondary btn-sm bo-pipeline-undo-btn"
              disabled={undoing || updatingId !== null}
              onClick={() => void undoLastMove()}
              title={`Undo move for ${lastUndo.candidateName}`}
            >
              {undoing ? "Undoing…" : "Undo last move"}
            </button>
          </div>
        ) : null}

        {lastUndo ? (
          <p className="bo-pipeline-undo-hint" role="status">
            Last move: <strong>{lastUndo.candidateName}</strong> ({lastUndo.jobTitle}) —{" "}
            {getApplicationStatusMeta(lastUndo.currentStatus).label} → undo restores{" "}
            {getApplicationStatusMeta(lastUndo.previousStatus).label}.
          </p>
        ) : null}

        <div className="bo-pipeline-board-body">
          <div className="bo-pipeline-board-tabs-row">
            <div className="bo-pipeline-board-tabs" role="tablist" aria-label="Pipeline views">
            {(
              [
                ["active", "Active pipeline"],
                ["rejected", "Rejected"],
                ["withdrawn", "Withdrawn"],
                ["all", "All applications"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={boardTab === tab}
                className={`bo-candidate-tab ${boardTab === tab ? "is-active" : ""}`}
                onClick={() => setBoardTab(tab)}
              >
                {label}
              </button>
            ))}
            </div>
            <button
              type="button"
              className="bo-page-actions-trigger bo-pipeline-fullscreen-btn"
              onClick={() => void togglePipelineFullscreen()}
              aria-pressed={pipelineFullscreen}
              aria-label={pipelineFullscreen ? "Exit full screen" : "Full screen"}
              title={pipelineFullscreen ? "Exit full screen" : "Full screen"}
            >
              {pipelineFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
            </button>
          </div>

          <p className="bo-page-sub">
            {boardTab === "active"
              ? "Drag cards between active stages only. Reject, withdraw, and hire use confirmation dialogs. Times are UTC (Monday–Sunday weeks by last update)."
              : boardTab === "rejected"
                ? "Rejected applications can be reopened to Under Review or Shortlisted using Reopen — not drag-and-drop."
                : boardTab === "withdrawn"
                  ? "Withdrawn applications are read-only on the board."
                  : "All statuses for applications updated in the selected week."}
          </p>

          {scoringUnavailableMessage ? (
            <div className="bo-admin-alert" role="status" style={{ marginBottom: "0.75rem" }}>
              {scoringUnavailableMessage}
            </div>
          ) : null}

          <div className="bo-pipeline-week-nav">
            <button type="button" className="bo-candidate-tab" onClick={() => setPipelineWeekOffset((o) => o - 1)}>
              ← Previous week
            </button>
            <button
              type="button"
              className="bo-candidate-tab"
              disabled={pipelineWeekOffset >= 0}
              style={{ opacity: pipelineWeekOffset >= 0 ? 0.45 : 1 }}
              onClick={() => setPipelineWeekOffset((o) => Math.min(0, o + 1))}
            >
              Next week →
            </button>
            {pipelineWeekOffset !== 0 ? (
              <button type="button" className="bo-candidate-tab is-active" onClick={() => setPipelineWeekOffset(0)}>
                This week
              </button>
            ) : null}
            <p className="bo-pipeline-week-label" aria-live="polite">
              Week: {pipelineWeekLabel}
            </p>
          </div>

          {tabFilteredItems.length === 0 ? (
            <p className="bo-admin-muted">No applications in this view for the selected week.</p>
          ) : null}

          <div className="bo-pipeline-columns">
            {columnStatuses.map((status) => {
              const columnItems = grouped.get(status) ?? [];
              const meta = getApplicationStatusMeta(status);
              const dropValid = dragOverColumn?.status === status && dragOverColumn.valid;
              const dropInvalid = dragOverColumn?.status === status && !dragOverColumn.valid;

              return (
                <div
                  key={status}
                  className={[
                    "bo-pipeline-column",
                    dropValid ? "bo-pipeline-column--drop-valid" : "",
                    dropInvalid ? "bo-pipeline-column--drop-invalid" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onDragOver={(event) => handleColumnDragOver(status, event)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverColumn(null);
                    const id = event.dataTransfer.getData("text/plain");
                    setDraggingId(null);
                    if (!id || id === updatingId) return;
                    const item = items.find((row) => row.id === id);
                    if (!item) return;
                    if (boardTab === "active") beginMove(item, status);
                  }}
                >
                  <div className="bo-pipeline-column-header">
                    <p className="bo-pipeline-column-title">{meta.label}</p>
                    <p className="bo-page-sub bo-pipeline-column-count">
                      {columnItems.length} item{columnItems.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="bo-pipeline-column-cards">
                    {columnItems.map((item) => (
                      <PipelineApplicationCard
                        key={item.id}
                        item={item}
                        status={item.status}
                        disabled={updatingId === item.id}
                        draggable={
                          boardTab === "active" && !isTerminalForDragDrop(item.status) && updatingId !== item.id
                        }
                        draggingId={draggingId}
                        relevance={relevanceById[item.id]}
                        flyoverLayerRef={pipelineFlyoverLayerRef}
                        allowedTargets={getAllowedTargetStatuses(item.status)}
                        onMoveToStatus={(target) => beginMove(item, target as PipelineStatus)}
                        onReject={
                          canTransition(item.status, "rejected")
                            ? () => beginMove(item, "rejected")
                            : undefined
                        }
                        onWithdraw={
                          canTransition(item.status, "withdrawn")
                            ? () => beginMove(item, "withdrawn")
                            : undefined
                        }
                        onReopen={
                          normalizeStatus(item.status) === "rejected"
                            ? () => {
                                setModalApp(item);
                                setModalKind("reopen");
                              }
                            : undefined
                        }
                        onRefreshRelevance={requestRelevanceRefresh}
                        onDragStart={(applicationId, event) => {
                          event.dataTransfer.setData("text/plain", applicationId);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(applicationId);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverColumn(null);
                        }}
                      />
                    ))}
                    {columnItems.length === 0 ? (
                      <p className="bo-admin-muted bo-pipeline-column-empty">Drop cards here</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div ref={pipelineFlyoverLayerRef} className="bo-pipeline-flyover-layer" aria-hidden />
      </section>

      {modalApp && modalKind === "reject" && pendingMove ? (
        <PipelineRejectModal
          open
          candidateName={modalApp.candidate.name}
          jobTitle={modalApp.job.title}
          submitting={updatingId === modalApp.id}
          onClose={closeModals}
          onConfirm={({ reason, note, notifyCandidate }) => {
            void patchStatus(
              pendingMove.applicationId,
              "rejected",
              { reason, note, notifyCandidate },
              pendingMove.expectedUpdatedAt,
            ).then((ok) => {
              if (ok) closeModals();
            });
          }}
        />
      ) : null}

      {modalApp && modalKind === "withdraw" && pendingMove ? (
        <PipelineWithdrawModal
          open
          candidateName={modalApp.candidate.name}
          jobTitle={modalApp.job.title}
          submitting={updatingId === modalApp.id}
          onClose={closeModals}
          onConfirm={({ withdrawalSource, reason, note }) => {
            void patchStatus(
              pendingMove.applicationId,
              "withdrawn",
              { withdrawalSource, reason, note },
              pendingMove.expectedUpdatedAt,
            ).then((ok) => {
              if (ok) closeModals();
            });
          }}
        />
      ) : null}

      {modalApp && modalKind === "hired" && pendingMove ? (
        <PipelineHiredModal
          open
          candidateName={modalApp.candidate.name}
          jobTitle={modalApp.job.title}
          submitting={updatingId === modalApp.id}
          onClose={closeModals}
          onConfirm={() => {
            void patchStatus(
              pendingMove.applicationId,
              "hired",
              { offerAccepted: true },
              pendingMove.expectedUpdatedAt,
            ).then((ok) => {
              if (ok) closeModals();
            });
          }}
        />
      ) : null}

      {modalApp && modalKind === "reopen" ? (
        <PipelineReopenModal
          open
          candidateName={modalApp.candidate.name}
          jobTitle={modalApp.job.title}
          submitting={updatingId === modalApp.id}
          onClose={closeModals}
          onConfirm={({ targetStatus, reason, note }) => {
            void reopenStatus(modalApp.id, targetStatus, reason, note, modalApp.updatedAt).then((ok) => {
              if (ok) closeModals();
            });
          }}
        />
      ) : null}

      {modalApp && modalKind === "missing_interview" ? (
        <PipelineMissingInterviewModal
          open
          candidateName={modalApp.candidate.name}
          jobTitle={modalApp.job.title}
          onClose={closeModals}
          onScheduleNow={openScheduleInterviewFromPrompt}
        />
      ) : null}

      {modalApp && scheduleInterviewOpen ? (
        <ScheduleInterviewModal
          open
          applicationId={modalApp.id}
          candidateName={modalApp.candidate.name}
          candidateEmail={modalApp.candidate.email}
          jobTitle={modalApp.job.title}
          onClose={closeModals}
          onScheduled={() => handleInterviewScheduled(modalApp.id)}
          onError={onError}
        />
      ) : null}
    </>
  );
}
