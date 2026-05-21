"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseRelevanceBreakdown } from "@ats-platform/utils/application-relevance";
import { RelevanceScoreRing } from "@/components/applications/RelevanceScoreRing";
import { AiRelevanceBiasNotice } from "@/components/applications/AiRelevanceBiasNotice";

type RelevanceEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; score: number; breakdownText: string | null }
  | { status: "unavailable"; message?: string }
  | { status: "error"; message?: string };

type Props = {
  applicationId: string;
  initialScore: number | null;
  initialBreakdownText: string | null;
  initialScoredAt: string | null;
};

function formatScoredAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function ApplicationRelevanceSection({
  applicationId,
  initialScore,
  initialBreakdownText,
  initialScoredAt,
}: Props) {
  const [entry, setEntry] = useState<RelevanceEntry>(() =>
    initialScore != null
      ? { status: "ready", score: initialScore, breakdownText: initialBreakdownText }
      : { status: "idle" },
  );
  const [scoredAt, setScoredAt] = useState<string | null>(initialScoredAt);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScore = useCallback(async (forceRefresh: boolean) => {
    setIsRefreshing(forceRefresh);
    setEntry({ status: "loading" });

    try {
      const url = `/api/backoffice/applications/${applicationId}/relevance-score${
        forceRefresh ? "?refresh=true" : ""
      }`;
      const res = await fetch(url, { credentials: "include" });
      const payload = (await res.json()) as {
        data?: { score?: number; breakdownText?: string | null; scoredAt?: string | null };
        error?: { message?: string };
      };

      if (res.status === 503) {
        setEntry({
          status: "unavailable",
          message: payload.error?.message ?? "Relevance scoring is not configured.",
        });
        return;
      }

      if (!res.ok || payload.data?.score == null) {
        setEntry({
          status: "error",
          message: payload.error?.message ?? "Could not load relevance score.",
        });
        return;
      }

      const score = Math.max(0, Math.min(100, Math.round(payload.data.score)));
      setEntry({
        status: "ready",
        score,
        breakdownText: payload.data.breakdownText ?? null,
      });
      if (payload.data.scoredAt) {
        setScoredAt(payload.data.scoredAt);
      }
    } catch {
      setEntry({ status: "error", message: "Network error while loading relevance score." });
    } finally {
      setIsRefreshing(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (initialScore != null) return;
    void fetchScore(false);
  }, [applicationId, initialScore, fetchScore]);

  const displayStatus = isRefreshing ? "loading" : entry.status;
  const score = entry.status === "ready" ? entry.score : null;
  const breakdownText = entry.status === "ready" ? entry.breakdownText : null;
  const dimensions = useMemo(() => parseRelevanceBreakdown(breakdownText), [breakdownText]);
  const scoredAtLabel = formatScoredAt(scoredAt);

  const ringStatus =
    displayStatus === "loading"
      ? "loading"
      : displayStatus === "ready"
        ? "ready"
        : displayStatus === "unavailable"
          ? "unavailable"
          : displayStatus === "error"
            ? "error"
            : "idle";

  return (
    <section className="bo-card bo-span-12" aria-labelledby="application-relevance-title">
      <div className="bo-relevance-section-header">
        <h2 id="application-relevance-title" className="bo-card-title">
          AI relevance match
        </h2>
        <AiRelevanceBiasNotice variant="detail" id="application-relevance-bias-notice" />
      </div>
      <p className="bo-admin-muted bo-relevance-detail-intro">
        CV and application answers vs this job posting (0–100%). Scores are cached until inputs change.
      </p>

      <div className="bo-relevance-detail">
        <div className="bo-relevance-detail-overall">
          <RelevanceScoreRing
            score={score}
            status={ringStatus}
            size={120}
            title={
              displayStatus === "ready" && score != null
                ? `Overall relevance: ${score}%`
                : undefined
            }
            breakdownText={null}
          />
          <div className="bo-relevance-detail-overall-copy">
            <p className="bo-relevance-detail-overall-label">Overall match</p>
            {displayStatus === "ready" && score != null ? (
              <p className="bo-relevance-detail-overall-value">{score}%</p>
            ) : displayStatus === "loading" ? (
              <p className="bo-relevance-detail-overall-value bo-relevance-detail-overall-value--muted">
                Calculating…
              </p>
            ) : displayStatus === "unavailable" ? (
              <p className="bo-relevance-detail-overall-value bo-relevance-detail-overall-value--muted">
                Unavailable
              </p>
            ) : displayStatus === "error" ? (
              <p className="bo-relevance-detail-overall-value bo-relevance-detail-overall-value--muted">
                Could not load
              </p>
            ) : (
              <p className="bo-relevance-detail-overall-value bo-relevance-detail-overall-value--muted">
                Pending
              </p>
            )}
            {scoredAtLabel ? (
              <p className="bo-relevance-detail-scored-at">Last scored {scoredAtLabel}</p>
            ) : null}
          </div>
        </div>

        {dimensions.length > 0 ? (
          <div className="bo-relevance-detail-breakdown" aria-label="Relevance breakdown by criterion">
            {dimensions.map((dimension) => (
              <article key={dimension.key} className="bo-relevance-detail-breakdown-item">
                <RelevanceScoreRing
                  score={dimension.score}
                  status="ready"
                  size={56}
                  title={`${dimension.label}: ${dimension.score}%`}
                  breakdownText={null}
                />
                <p className="bo-relevance-detail-breakdown-label" title={dimension.label}>
                  {dimension.shortLabel}
                </p>
                <p className="bo-relevance-detail-breakdown-value">{dimension.score}%</p>
              </article>
            ))}
          </div>
        ) : breakdownText?.trim() && displayStatus === "ready" ? (
          <pre className="bo-relevance-detail-fallback-text">{breakdownText}</pre>
        ) : null}
      </div>

      {displayStatus === "unavailable" && entry.status === "unavailable" ? (
        <p className="bo-admin-muted bo-relevance-detail-message">{entry.message}</p>
      ) : null}
      {displayStatus === "error" && entry.status === "error" ? (
        <p className="bo-admin-muted bo-relevance-detail-message">{entry.message}</p>
      ) : null}

      <div className="bo-relevance-detail-actions">
        <button
          type="button"
          className="bo-relevance-breakdown-flyover-refresh"
          disabled={displayStatus === "loading"}
          onClick={() => void fetchScore(true)}
        >
          {displayStatus === "loading" ? "Calculating…" : "Recalculate score"}
        </button>
      </div>
    </section>
  );
}
