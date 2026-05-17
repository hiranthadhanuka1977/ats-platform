"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** 0–100 when ready */
  score: number | null;
  status: "idle" | "loading" | "ready" | "unavailable" | "error";
  size?: number;
  title?: string;
  breakdownText?: string | null;
  /** Portal target inside the pipeline board (required for fullscreen tooltips). */
  flyoverLayerRef?: RefObject<HTMLDivElement | null>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const TOOLTIP_WIDTH = 268;
const TOOLTIP_MAX_HEIGHT = 280;
const VIEWPORT_PAD = 12;

type TooltipPosition = { top: number; left: number };

function computeTooltipPosition(anchor: DOMRect, layer: HTMLElement): TooltipPosition {
  const layerRect = layer.getBoundingClientRect();
  const gap = 10;
  const layerW = layerRect.width;
  const layerH = layerRect.height;

  let top = anchor.top - layerRect.top;
  let left = anchor.right - layerRect.left + gap;

  if (left + TOOLTIP_WIDTH > layerW - VIEWPORT_PAD) {
    left = anchor.left - layerRect.left - gap - TOOLTIP_WIDTH;
  }
  if (left < VIEWPORT_PAD) {
    left = Math.max(VIEWPORT_PAD, anchor.left - layerRect.left);
    top = anchor.bottom - layerRect.top + gap;
  }

  top = Math.min(Math.max(VIEWPORT_PAD, top), layerH - TOOLTIP_MAX_HEIGHT - VIEWPORT_PAD);

  return { top, left };
}

function computeTooltipPositionViewport(anchor: DOMRect): TooltipPosition {
  const gap = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = anchor.top;
  let left = anchor.right + gap;

  if (left + TOOLTIP_WIDTH > vw - VIEWPORT_PAD) {
    left = anchor.left - gap - TOOLTIP_WIDTH;
  }
  if (left < VIEWPORT_PAD) {
    left = Math.max(VIEWPORT_PAD, anchor.left);
    top = anchor.bottom + gap;
  }

  top = Math.min(Math.max(VIEWPORT_PAD, top), vh - TOOLTIP_MAX_HEIGHT - VIEWPORT_PAD);

  return { top, left };
}

/**
 * Circular relevance indicator (stroke progress 0–100%).
 */
export function RelevanceScoreRing({
  score,
  status,
  size = 44,
  title,
  breakdownText,
  flyoverLayerRef,
  onRefresh,
  isRefreshing,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [useLayerCoords, setUseLayerCoords] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateTooltipPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const anchorRect = el.getBoundingClientRect();
    const layer = flyoverLayerRef?.current;
    if (layer) {
      setUseLayerCoords(true);
      setTooltipPos(computeTooltipPosition(anchorRect, layer));
    } else {
      setUseLayerCoords(false);
      setTooltipPos(computeTooltipPositionViewport(anchorRect));
    }
  }, [flyoverLayerRef]);

  const displayStatus = isRefreshing ? "loading" : status;
  const showBreakdownTooltip = hovered && displayStatus === "ready" && Boolean(breakdownText);

  useEffect(() => {
    if (!showBreakdownTooltip) {
      setTooltipPos(null);
      return;
    }
    updateTooltipPosition();
    window.addEventListener("scroll", updateTooltipPosition, true);
    window.addEventListener("resize", updateTooltipPosition);
    document.addEventListener("fullscreenchange", updateTooltipPosition);
    return () => {
      window.removeEventListener("scroll", updateTooltipPosition, true);
      window.removeEventListener("resize", updateTooltipPosition);
      document.removeEventListener("fullscreenchange", updateTooltipPosition);
    };
  }, [showBreakdownTooltip, updateTooltipPosition]);

  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = displayStatus === "ready" && score != null ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const dashOffset = displayStatus === "loading" ? c * 0.75 : c * (1 - pct);

  const label =
    displayStatus === "loading"
      ? "…"
      : displayStatus === "ready" && score != null
        ? `${score}%`
        : displayStatus === "unavailable"
          ? "N/A"
          : displayStatus === "error"
            ? "!"
            : displayStatus === "idle"
              ? ""
              : "";

  const ringTitle =
    title ??
    (status === "ready" && score != null
      ? breakdownText
        ? `Relevance match: ${score}%\n\n${breakdownText}`
        : `Relevance match: ${score}%`
      : status === "loading"
        ? "Calculating relevance score"
        : status === "unavailable"
          ? "Relevance scoring unavailable (check OPENAI_API_KEY for backoffice)"
          : status === "error"
            ? "Relevance score failed to load"
            : status === "idle"
              ? "Relevance score pending"
              : "Relevance");

  const useNativeTitle = !showBreakdownTooltip;

  const portalTarget =
    flyoverLayerRef?.current ?? (typeof document !== "undefined" ? document.body : null);

  const flyover = showBreakdownTooltip && tooltipPos && portalTarget ? (
    <div
      role="tooltip"
      className={`bo-relevance-breakdown-flyover${useLayerCoords ? " bo-relevance-breakdown-flyover--layer" : ""}`}
      style={{ top: tooltipPos.top, left: tooltipPos.left }}
    >
      <p className="bo-relevance-breakdown-flyover-title">{`Relevance: ${score}%`}</p>
      <pre className="bo-relevance-breakdown-flyover-body">{breakdownText}</pre>
      {onRefresh ? (
        <button
          type="button"
          className="bo-relevance-breakdown-flyover-refresh"
          onClick={(event) => {
            event.stopPropagation();
            onRefresh();
          }}
        >
          Recalculate score
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={anchorRef}
        role="img"
        aria-label={ringTitle}
        title={useNativeTitle ? ringTitle : undefined}
        className="bo-relevance-ring-anchor"
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
        onMouseEnter={() => {
          setHovered(true);
          updateTooltipPosition();
        }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => {
          setHovered(true);
          updateTooltipPosition();
        }}
        onBlur={() => setHovered(false)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-border, #e2e8f0)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={
            displayStatus === "unavailable"
              ? "var(--color-muted, #94a3b8)"
              : displayStatus === "error"
                ? "var(--color-danger, #dc2626)"
                : "var(--color-accent, #2563eb)"
            }
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 0.35s ease",
              opacity: displayStatus === "loading" ? 0.85 : displayStatus === "idle" ? 0.35 : 1,
            }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            fontSize: displayStatus === "unavailable" ? "0.58rem" : size < 40 ? "0.65rem" : "0.7rem",
            fontWeight: 700,
            color: "var(--color-text, #0f172a)",
            lineHeight: 1,
          }}
        >
          {displayStatus === "loading" ? "…" : label}
        </span>
      </div>

      {mounted && flyover && portalTarget ? createPortal(flyover, portalTarget) : null}
    </>
  );
}
