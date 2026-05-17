import { useEffect, useMemo, useRef, useState } from "react";

export type RelevanceEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; score: number; breakdownText?: string | null }
  | { status: "unavailable"; message?: string }
  | { status: "error"; message?: string };

type Item = {
  id: string;
  relevance?: { score: number; breakdownText: string | null } | null;
};

type CachedRelevance = { score: number; breakdownText: string | null };

/**
 * Uses persisted DB scores when present; fetches only for applications without a stored score.
 * Pass `refreshIds` to force re-score on demand (e.g. after recruiter clicks Recalculate).
 */
export function usePipelineRelevanceScores(
  enabled: boolean,
  items: Item[],
  refreshIds: string[] = [],
) {
  const [map, setMap] = useState<Record<string, RelevanceEntry>>({});
  const [scoringUnavailableMessage, setScoringUnavailableMessage] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, CachedRelevance>>(new Map());
  const seededRef = useRef(false);

  const idsKey = useMemo(() => [...new Set(items.map((i) => i.id))].sort().join(","), [items]);
  const refreshKey = refreshIds.join(",");

  useEffect(() => {
    if (!enabled || !idsKey) {
      seededRef.current = false;
      setScoringUnavailableMessage(null);
      return;
    }

    const ids = idsKey.split(",").filter(Boolean);

    if (!seededRef.current) {
      seededRef.current = true;
      for (const item of items) {
        if (item.relevance?.score != null) {
          cacheRef.current.set(item.id, {
            score: item.relevance.score,
            breakdownText: item.relevance.breakdownText,
          });
          setMap((m) => ({
            ...m,
            [item.id]: {
              status: "ready",
              score: item.relevance!.score,
              breakdownText: item.relevance!.breakdownText,
            },
          }));
        }
      }
    }

    const refreshSet = new Set(refreshIds);
    for (const id of refreshSet) {
      cacheRef.current.delete(id);
    }

    const toFetch = ids.filter((id) => !cacheRef.current.has(id) || refreshSet.has(id));
    if (toFetch.length === 0) return;

    setScoringUnavailableMessage(null);
    for (const id of toFetch) {
      setMap((m) => ({ ...m, [id]: { status: "loading" } }));
    }

    let cancelled = false;

    void (async () => {
      for (const id of toFetch) {
        if (cancelled) return;
        const forceRefresh = refreshSet.has(id);
        try {
          const url = `/api/backoffice/applications/${id}/relevance-score${
            forceRefresh ? "?refresh=true" : ""
          }`;
          const res = await fetch(url, { credentials: "include" });
          const payload = (await res.json()) as {
            data?: { score?: number; breakdownText?: string | null };
            error?: { code?: string; message?: string };
          };

          if (cancelled) return;

          if (res.status === 503) {
            const message = payload.error?.message ?? "Scoring not configured";
            setScoringUnavailableMessage(message);
            setMap((m) => ({
              ...m,
              [id]: { status: "unavailable", message },
            }));
            continue;
          }

          if (!res.ok || payload.data?.score == null) {
            setMap((m) => ({
              ...m,
              [id]: {
                status: "error",
                message: payload.error?.message ?? "Could not load score",
              },
            }));
            continue;
          }

          const score = Math.max(0, Math.min(100, Math.round(payload.data.score)));
          const breakdownText = payload.data.breakdownText ?? null;
          cacheRef.current.set(id, { score, breakdownText });
          setMap((m) => ({ ...m, [id]: { status: "ready", score, breakdownText } }));
        } catch {
          if (!cancelled) {
            setMap((m) => ({ ...m, [id]: { status: "error", message: "Network error" } }));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, idsKey, refreshKey, items]);

  return { scores: map, scoringUnavailableMessage };
}
