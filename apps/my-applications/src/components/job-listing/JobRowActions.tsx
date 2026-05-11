"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadCandidateSession } from "@/lib/auth-storage";
import { formatShortDate } from "@/lib/format";

type Props = {
  slug: string;
  title: string;
};

type CvItem = {
  id: string;
  originalFilename: string;
};

type CvListPayload = {
  data?: {
    defaultCvId?: string | null;
    cvs?: CvItem[];
  };
  error?: { message?: string };
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cvItems, setCvItems] = useState<CvItem[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [appliedAt, setAppliedAt] = useState<string | null>(null);

  const hasCoverLetter = coverLetterFile != null;
  const canSubmit = selectedCvId.length > 0 && hasCoverLetter && !submitting;
  const coverLetterLabel = useMemo(() => {
    if (!coverLetterFile) return "Upload cover letter (PDF or Word)";
    return `Selected: ${coverLetterFile.name}`;
  }, [coverLetterFile]);

  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) return;
    void (async () => {
      const appliedMap = await loadAppliedBySlug(session.accessToken);
      setAppliedAt(appliedMap.get(slug) ?? null);
    })();
  }, [slug]);

  useEffect(() => {
    if (!isOpen) return;
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    void (async () => {
      try {
        const response = await fetch("/api/my-applications/cv/list", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const payload = (await response.json().catch(() => ({}))) as CvListPayload;
        if (!response.ok) {
          throw new Error(payload.error?.message || "Unable to load your CV list.");
        }
        const cvs = payload.data?.cvs ?? [];
        setCvItems(cvs);
        const defaultId = payload.data?.defaultCvId ?? "";
        const preselected = defaultId && cvs.some((cv) => cv.id === defaultId) ? defaultId : cvs[0]?.id ?? "";
        setSelectedCvId(preselected);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load your CV list.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const handleApply = async () => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    if (!selectedCvId) {
      setError("Please select a CV before applying.");
      return;
    }
    if (!coverLetterFile) {
      setError("Please upload a cover letter to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.set("jobSlug", slug);
      formData.set("cvId", selectedCvId);
      formData.set("coverLetter", coverLetterFile);

      const response = await fetch("/api/my-applications/applications/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message || "Unable to complete your application.");
      }
      setSuccess("Application submitted successfully.");
      setTimeout(() => {
        setIsOpen(false);
        router.push("/my-applications");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ minWidth: "116px", justifyContent: "center" }}
            onClick={() => setIsOpen(true)}
          >
            Apply
          </button>
        )}
      </div>

      {isOpen ? (
        <div className="bo-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Apply for ${title}`}>
          <div className="bo-modal" style={{ maxWidth: "560px" }}>
            <h2 className="bo-modal-title">Apply for {title}</h2>

            {loading ? <p className="bo-modal-body">Loading your CV list...</p> : null}

            {!loading ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <label className="bo-label" htmlFor={`apply-cv-${slug}`}>
                  Select CV
                </label>
                {cvItems.length > 0 ? (
                  <select
                    id={`apply-cv-${slug}`}
                    className="form-select"
                    value={selectedCvId}
                    onChange={(event) => setSelectedCvId(event.target.value)}
                  >
                    {cvItems.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.originalFilename}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="bo-modal-body" style={{ marginBottom: 0 }}>
                    No CV found. Upload a CV in the CV Upload page first.
                  </p>
                )}

                <label className="bo-label" htmlFor={`apply-cover-letter-${slug}`}>
                  {coverLetterLabel}
                </label>
                <input
                  id={`apply-cover-letter-${slug}`}
                  type="file"
                  className="form-input"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setCoverLetterFile(event.target.files?.[0] ?? null)}
                />
              </div>
            ) : null}

            {error ? (
              <p className="bo-modal-body" role="alert" style={{ color: "var(--color-error)", marginTop: "0.75rem" }}>
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="bo-modal-body" role="status" style={{ color: "var(--color-success)", marginTop: "0.75rem" }}>
                {success}
              </p>
            ) : null}

            <div className="bo-modal-actions" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Close
              </button>
              <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={handleApply}>
                {submitting ? "Applying..." : "Complete application"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
