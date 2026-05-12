"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

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
  onDragStart: (applicationId: string, event: React.DragEvent) => void;
  onDragEnd: () => void;
};

export function PipelineApplicationCard({ item, disabled, draggingId, onDragStart, onDragEnd }: Props) {
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
  );
}
