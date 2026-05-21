"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Variant = "detail" | "pipeline" | "flyover";

type Props = {
  variant?: Variant;
  /** Optional id for aria-labelledby on parent regions */
  id?: string;
};

export const SHORTLISTING_ADVICE =
  "Shortlisting and rejection must be based on your review of the full application — never on the AI score alone.";

/** Appended to ring tooltips / aria labels when a score is shown. */
export const AI_RELEVANCE_SCORE_DISCLAIMER =
  "Advisory AI score only. Human review required before shortlisting or rejection.";

const DETAIL_FLYOVER_WIDTH = 320;
const VIEWPORT_PAD = 12;

type FlyoverPosition = { top: number; left: number };

function computeFlyoverPosition(anchor: DOMRect): FlyoverPosition {
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchor.left;
  let top = anchor.bottom + gap;

  if (left + DETAIL_FLYOVER_WIDTH > vw - VIEWPORT_PAD) {
    left = vw - DETAIL_FLYOVER_WIDTH - VIEWPORT_PAD;
  }
  left = Math.max(VIEWPORT_PAD, left);

  const maxHeight = Math.min(360, vh - top - VIEWPORT_PAD);
  if (maxHeight < 120) {
    top = Math.max(VIEWPORT_PAD, anchor.top - gap - 200);
  }

  return { top, left };
}

function WarningIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="bo-ai-bias-trigger__icon"
    >
      <path
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AiRelevanceBiasDetailContent({ titleId }: { titleId: string }) {
  return (
    <>
      <p id={titleId} className="bo-ai-bias-notice__title">
        AI bias awareness — not a hiring decision
      </p>
      <ul className="bo-ai-bias-notice__list">
        <li>
          Scores are produced by an AI model and may encode bias (e.g. education pedigree, employer
          names, gendered language, or keyword overlap that rewards résumé gaming).
        </li>
        <li>
          Low scores do <strong>not</strong> mean a candidate is unqualified; high scores do{" "}
          <strong>not</strong> replace reading the CV, cover letter, and screening answers.
        </li>
        <li>
          <strong>{SHORTLISTING_ADVICE}</strong>
        </li>
        <li>
          Use scores only to prioritise which applications to open next — then apply consistent,
          documented criteria.
        </li>
      </ul>
    </>
  );
}

function AiRelevanceBiasDetailTrigger({ id }: { id?: string }) {
  const reactId = useId();
  const titleId = id ? `${id}-title` : `ai-bias-title-${reactId}`;
  const triggerId = id ?? `ai-bias-trigger-${reactId}`;
  const flyoverId = `${triggerId}-flyover`;

  const anchorRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<FlyoverPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }, [clearCloseTimer]);

  const showFlyover = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    setPos(computeFlyoverPosition(el.getBoundingClientRect()));
  }, []);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const flyover =
    open && pos && mounted ? (
      <div
        id={flyoverId}
        role="tooltip"
        className="bo-ai-bias-detail-flyover"
        style={{ top: pos.top, left: pos.left, width: DETAIL_FLYOVER_WIDTH }}
        onMouseEnter={showFlyover}
        onMouseLeave={scheduleClose}
      >
        <div className="bo-ai-bias-notice bo-ai-bias-notice--detail-flyover">
          <AiRelevanceBiasDetailContent titleId={titleId} />
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        id={triggerId}
        className="bo-ai-bias-trigger"
        aria-describedby={open ? flyoverId : undefined}
        aria-expanded={open}
        aria-label="AI bias awareness — human review required before shortlisting. Hover or focus for full guidance."
        onMouseEnter={() => {
          showFlyover();
          updatePosition();
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          showFlyover();
          updatePosition();
        }}
        onBlur={scheduleClose}
      >
        <WarningIcon />
        <span>Human review required</span>
      </button>
      {mounted && flyover ? createPortal(flyover, document.body) : null}
    </>
  );
}

/**
 * Bias and human-review notice for AI-generated relevance scores.
 * Shown wherever scores may influence recruiter triage.
 */
export function AiRelevanceBiasNotice({ variant = "detail", id }: Props) {
  if (variant === "flyover") {
    return (
      <div
        id={id}
        className="bo-ai-bias-notice bo-ai-bias-notice--flyover"
        role="note"
        aria-label="AI score bias and human review guidance"
      >
        <p className="bo-ai-bias-notice__lead">
          <strong>Advisory only.</strong> AI scores can reflect bias and miss non-traditional backgrounds.
        </p>
        <p className="bo-ai-bias-notice__shortlist">{SHORTLISTING_ADVICE}</p>
      </div>
    );
  }

  if (variant === "pipeline") {
    return (
      <div
        id={id}
        className="bo-ai-bias-notice bo-ai-bias-notice--pipeline"
        role="note"
        aria-labelledby={id ? `${id}-title` : undefined}
      >
        <p id={id ? `${id}-title` : undefined} className="bo-ai-bias-notice__title">
          AI relevance scores — human review required
        </p>
        <p className="bo-ai-bias-notice__body">
          Percentages on pipeline cards are <strong>AI-generated triage hints only</strong>. They may
          disadvantage candidates with career gaps, non-linear paths, or wording that does not match
          the job description. <strong>{SHORTLISTING_ADVICE}</strong>
        </p>
      </div>
    );
  }

  return <AiRelevanceBiasDetailTrigger id={id} />;
}
