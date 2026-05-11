"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCandidateSession } from "@/lib/auth-storage";
import { formatShortDate } from "@/lib/format";

type ApplicationItem = {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    slug: string;
    title: string;
    department: string;
    location: string;
  };
};

export function MyApplicationsPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Your session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/my-applications/applications/list", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: ApplicationItem[];
          error?: { message?: string };
        };
        if (!response.ok) {
          throw new Error(payload.error?.message || "Unable to load applications.");
        }
        setItems(payload.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section aria-labelledby="my-applications-title">
      <h1 id="my-applications-title" className="bo-page-title">
        My Applications
      </h1>
      <p className="bo-page-sub">Track jobs you have applied for.</p>

      <article className="bo-card bo-span-12">
        {loading ? <p className="bo-page-sub">Loading applications...</p> : null}
        {error ? (
          <p className="bo-page-sub" role="alert" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div>
            <p className="bo-page-sub" style={{ marginBottom: "0.8rem" }}>
              You have not applied to any jobs yet.
            </p>
            <Link href="/job-search" className="btn btn-primary btn-sm">
              Browse jobs
            </Link>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div>
            {items.map((item, index) => (
              <div key={item.id} style={{ padding: "0.8rem 0 0.9rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{item.job.title}</h2>
                <p className="bo-page-sub" style={{ margin: "0.35rem 0 0.25rem" }}>
                  {item.job.department} • {item.job.location}
                </p>
                <p className="bo-page-sub" style={{ margin: 0 }}>
                  Status: <strong style={{ textTransform: "capitalize" }}>{item.status}</strong> • Applied{" "}
                  {formatShortDate(item.appliedAt)}
                </p>
                <div style={{ marginTop: "0.6rem" }}>
                  <Link href={`/jobs/${item.job.slug}`} className="btn btn-secondary btn-sm">
                    View job
                  </Link>
                </div>
                {index < items.length - 1 ? <hr style={{ marginTop: "0.9rem", border: 0, borderTop: "1px solid var(--color-border)" }} /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
