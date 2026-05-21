"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { getApplicationStatusMeta } from "@ats-platform/types";
import type { RelevanceEntry } from "@/hooks/usePipelineRelevanceScores";
import { RelevanceScoreRing } from "@/components/applications/RelevanceScoreRing";

export type PipelineCardItem = {
  id: string;
  appliedAt: string;
  updatedAt: string;
  candidate: { id: string; name: string; email: string };
  job: { title: string };
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

type Props = {
  item: PipelineCardItem;
  status: string;
  disabled: boolean;
  draggable: boolean;
  draggingId: string | null;
  relevance?: RelevanceEntry;
  flyoverLayerRef?: RefObject<HTMLDivElement | null>;
  allowedTargets: string[];
  onMoveToStatus: (status: string) => void;
  onReject?: () => void;
  onWithdraw?: () => void;
  onReopen?: () => void;
  onDragStart: (applicationId: string, event: React.DragEvent) => void;
  onDragEnd: () => void;
};

function ringProps(relevance: RelevanceEntry | undefined): {
  score: number | null;
  status: "idle" | "loading" | "ready" | "unavailable" | "error";
  title?: string;
  breakdownText?: string | null;
} {
  if (!relevance || relevance.status === "idle") {
    return { score: null, status: "idle", breakdownText: null };
  }
  if (relevance.status === "loading") {
    return { score: null, status: "loading", breakdownText: null };
  }
  if (relevance.status === "ready") {
    return {
      score: relevance.score,
      status: "ready",
      title: `Relevance match: ${relevance.score}%`,
      breakdownText: relevance.breakdownText ?? null,
    };
  }
  if (relevance.status === "unavailable") {
    return {
      score: null,
      status: "unavailable",
      title: relevance.message ?? "Relevance scoring unavailable",
      breakdownText: null,
    };
  }
  return {
    score: null,
    status: "error",
    title: relevance.message ?? "Could not load relevance score",
    breakdownText: null,
  };
}

export function PipelineApplicationCard({
  item,
  status,
  disabled,
  draggable,
  draggingId,
  relevance,
  flyoverLayerRef,
  allowedTargets,
  onMoveToStatus,
  onReject,
  onWithdraw,
  onReopen,
  onDragStart,
  onDragEnd,
}: Props) {
  const router = useRouter();
  const blockClickUntil = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  const activeTargets = allowedTargets.filter(
    (t) => t !== "rejected" && t !== "withdrawn" && t !== status,
  );

  return (
    <article
      className="bo-pipeline-card"
      aria-disabled={disabled}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Open application for ${item.job.title}, ${item.candidate.name}`}
        draggable={draggable && !disabled}
        onDragStart={(event) => {
          blockClickUntil.current = 0;
          onDragStart(item.id, event);
        }}
        onDragEnd={() => {
          onDragEnd();
          blockClickUntil.current = Date.now() + 200;
        }}
        onClick={() => {
          if (disabled || menuOpen) return;
          if (Date.now() < blockClickUntil.current) return;
          router.push(`/applications/${item.id}`);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(`/applications/${item.id}`);
          }
        }}
        className={`bo-pipeline-card-main${draggingId === item.id ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <RelevanceScoreRing
          {...ringProps(relevance)}
          size={52}
          flyoverLayerRef={flyoverLayerRef}
        />
        <div className="bo-pipeline-card-body">
          <p className="bo-pipeline-card-job" title={item.job.title}>
            {item.job.title}
          </p>
          <p className="bo-pipeline-card-candidate" title={item.candidate.name}>
            {item.candidate.name}
          </p>
          <p className="bo-pipeline-card-meta">Updated {formatDateTime(item.updatedAt)}</p>
        </div>
      </div>

      <div className="bo-pipeline-card-actions" ref={menuRef}>
        <button
          type="button"
          className="bo-pipeline-card-menu-trigger"
          aria-label="Application actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          ⋮
        </button>
        {menuOpen ? (
          <div className="bo-pipeline-card-menu" role="menu">
            {activeTargets.length > 0 ? (
              <>
                <p className="bo-pipeline-card-menu-label">Move to</p>
                {activeTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onMoveToStatus(target);
                    }}
                  >
                    {getApplicationStatusMeta(target).label}
                  </button>
                ))}
              </>
            ) : null}
            {onReject ? (
              <button
                type="button"
                role="menuitem"
                className="bo-pipeline-card-menu-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onReject();
                }}
              >
                Reject…
              </button>
            ) : null}
            {onWithdraw ? (
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onWithdraw();
                }}
              >
                Withdraw…
              </button>
            ) : null}
            {onReopen ? (
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onReopen();
                }}
              >
                Reopen application…
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
