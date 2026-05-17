"use client";

import { useRouter } from "next/navigation";
import { useRef, type RefObject } from "react";
import type { RelevanceEntry } from "@/hooks/usePipelineRelevanceScores";
import { RelevanceScoreRing } from "@/components/applications/RelevanceScoreRing";

export type PipelineCardItem = {
  id: string;
  appliedAt: string;
  candidate: { name: string };
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
  disabled: boolean;
  draggingId: string | null;
  relevance?: RelevanceEntry;
  flyoverLayerRef?: RefObject<HTMLDivElement | null>;
  onRefreshRelevance?: (applicationId: string) => void;
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
  disabled,
  draggingId,
  relevance,
  flyoverLayerRef,
  onRefreshRelevance,
  onDragStart,
  onDragEnd,
}: Props) {
  const router = useRouter();
  const blockClickUntil = useRef(0);

  return (
    <article
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`Open application for ${item.job.title}, ${item.candidate.name}`}
      draggable={!disabled}
      onDragStart={(event) => {
        blockClickUntil.current = 0;
        onDragStart(item.id, event);
      }}
      onDragEnd={() => {
        onDragEnd();
        blockClickUntil.current = Date.now() + 200;
      }}
      onClick={() => {
        if (disabled) return;
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
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "0.55rem 0.6rem",
        background: "#fff",
        opacity: draggingId === item.id ? 0.55 : 1,
        cursor: disabled ? "progress" : "pointer",
        display: "flex",
        gap: "0.5rem",
        alignItems: "flex-start",
      }}
    >
      <RelevanceScoreRing
        {...ringProps(relevance)}
        size={46}
        flyoverLayerRef={flyoverLayerRef}
        onRefresh={
          onRefreshRelevance && relevance?.status !== "loading" && relevance?.status !== "idle"
            ? () => onRefreshRelevance(item.id)
            : undefined
        }
        isRefreshing={relevance?.status === "loading"}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{item.job.title}</p>
        <p className="bo-page-sub" style={{ margin: "0.25rem 0 0" }}>
          {item.candidate.name}
        </p>
        <p className="bo-page-sub" style={{ margin: "0.15rem 0 0" }}>
          Applied {formatDateTime(item.appliedAt)}
        </p>
      </div>
    </article>
  );
}
