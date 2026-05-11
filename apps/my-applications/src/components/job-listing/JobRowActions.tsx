"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCandidateSession } from "@/lib/auth-storage";
import { formatShortDate } from "@/lib/format";

type Props = {
  slug: string;
  title?: string;
};

type ApplicationsListPayload = {
  data?: Array<{
    appliedAt: string;
    job: { slug: string };
  }>;
};

let appliedBySlugCache: Map<string, string> | null = null;
let appliedBySlugPromise: Promise<Map<string, string>> | null = null;

async function loadAppliedBySlug(accessToken: string): Promise<Map<string, string>> {
  if (appliedBySlugCache) return appliedBySlugCache;
  if (appliedBySlugPromise) return appliedBySlugPromise;

  appliedBySlugPromise = (async () => {
    const response = await fetch("/api/my-applications/applications/list", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = (await response.json().catch(() => ({}))) as ApplicationsListPayload;
    const map = new Map<string, string>();
    for (const item of payload.data ?? []) {
      if (item?.job?.slug) map.set(item.job.slug, item.appliedAt);
    }
    appliedBySlugCache = map;
    appliedBySlugPromise = null;
    return map;
  })().catch(() => {
    appliedBySlugPromise = null;
    return new Map<string, string>();
  });

  return appliedBySlugPromise;
}

export function JobRowActions({ slug, title }: Props) {
  const [appliedAt, setAppliedAt] = useState<string | null>(null);

  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) return;
    void (async () => {
      const appliedMap = await loadAppliedBySlug(session.accessToken);
      setAppliedAt(appliedMap.get(slug) ?? null);
    })();
  }, [slug]);

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
      <Link href={`/jobs/${slug}`} className="btn btn-secondary btn-sm">
        View
      </Link>
      {appliedAt ? (
        <p
          className="bo-page-sub"
          style={{ margin: 0, alignSelf: "center", marginLeft: "auto", textAlign: "right" }}
        >
          You have applied for this job on <strong>{formatShortDate(appliedAt)}</strong>
        </p>
      ) : (
        <Link
          href={`/jobs/${slug}/apply`}
          className="btn btn-primary btn-sm"
          style={{ minWidth: "116px", justifyContent: "center" }}
          aria-label={title ? `Apply for ${title}` : "Apply"}
        >
          Apply
        </Link>
      )}
    </div>
  );
}
