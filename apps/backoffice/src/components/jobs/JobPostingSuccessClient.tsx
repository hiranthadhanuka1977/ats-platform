"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const UUID_RE = /^[0-9a-f-]{36}$/i;

function formatJobStatusLabel(status: string): string {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function JobPostingSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const jobIdParam = searchParams.get("jobId");
  const statusParam = searchParams.get("status");

  useEffect(() => {
    if (!jobIdParam || !statusParam || !UUID_RE.test(jobIdParam)) {
      router.replace("/jobs");
      return;
    }
    setJobId(jobIdParam);
    setStatus(statusParam);
  }, [jobIdParam, statusParam, router]);

  async function publishNow() {
    if (!jobId || status !== "draft") return;
    setPublishError(null);
    setPublishing(true);
    try {
      const res = await fetch(`/api/backoffice/jobs/${jobId}/publish`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(j?.error?.message ?? res.statusText);
      }
      const data = (await res.json()) as { item: { status: string } };
      const newStatus = data.item.status;
      setStatus(newStatus);
      // Keep URL in sync so the effect below does not re-apply stale ?status=draft after router.refresh.
      router.replace(
        `/jobs/new/success?jobId=${encodeURIComponent(jobId)}&status=${encodeURIComponent(newStatus)}`,
        { scroll: false }
      );
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setPublishing(false);
    }
  }

  if (!jobId || !status) {
    return (
      <p className="bo-admin-muted" role="status">
        Loading…
      </p>
    );
  }

  return (
    <>
      <header className="bo-jobs-header">
        <div>
          <h1 className="bo-page-title">Job posting created</h1>
          <p className="bo-page-sub">Your posting is saved. You can publish it now or return to the jobs list.</p>
        </div>
      </header>

      <div className="bo-card bo-job-success-panel" role="status">
        <p className="bo-job-success-title">Success! Your job posting has been created.</p>
        <p className="bo-job-success-meta">
          Current status:{" "}
          <span className={`bo-job-status bo-job-status--${status}`}>{formatJobStatusLabel(status)}</span>
        </p>
        {publishError && (
          <p className="bo-job-success-error" role="alert">
            {publishError}
          </p>
        )}
        {status === "draft" && (
          <div className="bo-job-success-actions">
            <button type="button" className="btn btn-primary btn-sm" disabled={publishing} onClick={() => void publishNow()}>
              {publishing ? "Publishing…" : "Publish now"}
            </button>
          </div>
        )}
        <div className="bo-job-success-footer">
          <Link href="/jobs" className="btn btn-secondary btn-sm">
            Back to jobs
          </Link>
          <Link href={`/jobs/${jobId}/edit`} className="btn btn-secondary btn-sm">
            Edit posting
          </Link>
        </div>
      </div>
    </>
  );
}
