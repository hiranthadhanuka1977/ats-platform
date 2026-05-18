"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CvAutofillProcessingOverlay } from "@/components/dashboard/CvAutofillProcessingOverlay";
import { CvAutofillPromptDialog } from "@/components/dashboard/CvAutofillPromptDialog";
import { loadCandidateSession } from "@/lib/auth-storage";
import type { ParsedCvPayload } from "@/types/cv-parse";
import "./cv-import-prototype.css";

type AutofillOffer = { parseId: string; fileName: string };

type UploadState = "idle" | "uploading" | "done";
type CvRow = {
  id: string;
  originalFilename: string;
  mimeType: string;
  createdAt: string;
};

function getCvTypeMeta(mimeType: string): { label: string; icon: string } {
  if (mimeType === "application/pdf") {
    return { label: "PDF Document", icon: "📕" };
  }
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return { label: "Word Document", icon: "📘" };
  }
  return { label: "Document", icon: "📄" };
}

export function CvUploadPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CvRow[]>([]);
  const [defaultCvId, setDefaultCvId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [menuOpenCvId, setMenuOpenCvId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewName, setPreviewName] = useState<string>("");
  const [previewMime, setPreviewMime] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmDeleteCv, setConfirmDeleteCv] = useState<CvRow | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [autofillOffer, setAutofillOffer] = useState<AutofillOffer | null>(null);
  const [processing, setProcessing] = useState<{
    fileName: string;
    label: string;
    progress: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const loadList = useCallback(async () => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      setLoadingList(false);
      return;
    }
    try {
      const response = await fetch("/api/my-applications/cv/list", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { defaultCvId?: string | null; cvs?: CvRow[] };
        error?: { message?: string };
      };
      if (!response.ok || !payload.data?.cvs) {
        setError(payload.error?.message ?? "Could not load CVs.");
        setLoadingList(false);
        return;
      }
      setCvs(payload.data.cvs);
      setDefaultCvId(payload.data.defaultCvId ?? null);
    } catch {
      setError("Network error while loading CVs.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      setProcessing((current) => {
        if (!current || current.progress >= 88) return current;
        const next = Math.min(88, current.progress + 2);
        return { ...current, progress: next };
      });
    }, 400);
  }, [stopProgressTimer]);

  const runProfileAutofill = useCallback(
    async (offer: AutofillOffer) => {
      const session = loadCandidateSession();
      if (!session?.accessToken) {
        setError("Session expired. Please sign in again.");
        return;
      }

      setAutofillOffer(null);
      setError(null);
      setProcessing({
        fileName: offer.fileName,
        label: "Extracting text from your CV…",
        progress: 12,
      });
      startProgressTimer();

      try {
        const response = await fetch("/api/my-applications/cv/parse", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ parseId: offer.parseId }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { payload?: ParsedCvPayload };
          error?: { message?: string };
        };

        stopProgressTimer();

        if (!response.ok || !payload.data?.payload) {
          setProcessing(null);
          setError(payload.error?.message ?? "Could not extract profile details from your CV.");
          return;
        }

        setProcessing({
          fileName: offer.fileName,
          label: "Preparing your profile for review…",
          progress: 100,
        });

        await new Promise((resolve) => setTimeout(resolve, 400));
        const params = new URLSearchParams({
          cvParseId: offer.parseId,
          cvFileName: offer.fileName,
        });
        router.push(`/my-profile?${params.toString()}`);
      } catch {
        stopProgressTimer();
        setProcessing(null);
        setError("Network error while processing your CV.");
      }
    },
    [router, startProgressTimer, stopProgressTimer]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const session = loadCandidateSession();
      if (!session?.accessToken) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const wasFirstCv = cvs.length === 0;

      setError(null);
      setSuccessMessage(null);
      setUploadedName(null);
      setAutofillOffer(null);
      setState("uploading");

      const formData = new FormData();
      formData.set("file", file);

      try {
        const response = await fetch("/api/my-applications/cv/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { parseId?: string; originalFilename?: string };
          error?: { message?: string };
        };

        if (!response.ok || !payload.data?.originalFilename) {
          setError(payload.error?.message ?? "Could not upload CV.");
          setState("idle");
          return;
        }

        setUploadedName(payload.data.originalFilename);
        setSuccessMessage(`Uploaded CV: ${payload.data.originalFilename}`);
        setState("done");
        await loadList();

        if (wasFirstCv && payload.data.parseId) {
          setAutofillOffer({
            parseId: payload.data.parseId,
            fileName: payload.data.originalFilename,
          });
        }
      } catch {
        setError("Network error while uploading CV.");
        setState("idle");
      }
    },
    [cvs.length, loadList]
  );

  const setAsDefault = useCallback(async (cvId: string) => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setError(null);
    const previous = defaultCvId;
    setDefaultCvId(cvId);
    try {
      const response = await fetch("/api/my-applications/cv/default", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cvId }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { defaultCvId?: string };
        error?: { message?: string };
      };
      if (!response.ok || !payload.data?.defaultCvId) {
        setDefaultCvId(previous ?? null);
        setError(payload.error?.message ?? "Could not set default CV.");
      }
    } catch {
      setDefaultCvId(previous ?? null);
      setError("Network error while updating default CV.");
    }
  }, [defaultCvId]);

  const openPreview = useCallback(async (cv: CvRow) => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setError(null);
    setPreviewLoading(true);
    setPreviewName(cv.originalFilename);
    setPreviewMime(cv.mimeType);
    setPreviewOpen(true);
    try {
      const response = await fetch(`/api/my-applications/cv/download?id=${encodeURIComponent(cv.id)}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
        setError(payload.error?.message ?? "Could not load CV preview.");
        setPreviewLoading(false);
        return;
      }
      const blob = await response.blob();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    } catch {
      setError("Network error while loading CV preview.");
    } finally {
      setPreviewLoading(false);
    }
  }, [previewUrl]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const deleteCv = useCallback(
    async (cvId: string) => {
      const session = loadCandidateSession();
      if (!session?.accessToken) {
        setError("Session expired. Please sign in again.");
        return;
      }
      const target = cvs.find((c) => c.id === cvId);
      if (!target) return;
      if (defaultCvId === cvId) {
        setError("Default CV cannot be deleted. Choose another default first.");
        return;
      }

      setError(null);
      setSuccessMessage(null);
      setMenuOpenCvId(null);
      setConfirmDeleteCv(null);
      try {
        const response = await fetch("/api/my-applications/cv/delete", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cvId }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { deletedCvId?: string };
          error?: { message?: string };
        };
        if (!response.ok || !payload.data?.deletedCvId) {
          setError(payload.error?.message ?? "Could not delete CV.");
          return;
        }
        setSuccessMessage(`Deleted CV: ${target.originalFilename}`);
        await loadList();
      } catch {
        setError("Network error while deleting CV.");
      }
    },
    [cvs, defaultCvId, loadList]
  );

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      void uploadFile(file);
    },
    [uploadFile]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      void uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <section aria-labelledby="cv-upload-title">
      <h1 id="cv-upload-title" className="bo-page-title">
        {cvs.length > 0 ? "My CVs" : "Upload CV"}
      </h1>
      <p className="bo-page-sub">Drag and drop your CV file here, or browse and upload. Accepted: PDF, DOC, DOCX (max 10 MB).</p>

      {error ? (
        <p className="bo-login-error" role="alert">
          {error}
        </p>
      ) : null}
      {successMessage ? (
        <p className={successMessage.startsWith("Deleted CV:") ? "bo-login-error" : "myapps-linkedin-note"} role="status">
          {successMessage}
        </p>
      ) : null}

      <div
        className="myapps-cv-drop"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="myapps-cv-file-input"
          id="cv-upload-file-input"
          onChange={onFileChange}
          disabled={state === "uploading" || Boolean(processing) || Boolean(autofillOffer)}
          aria-label="Choose CV file to upload"
        />
        <label htmlFor="cv-upload-file-input" className="myapps-cv-drop-inner">
          {state === "uploading" ? (
            <span>Uploading CV...</span>
          ) : (
            <>
              <strong>Drop your CV file here</strong>
              <span className="myapps-cv-drop-hint">or click to browse files</span>
            </>
          )}
        </label>
      </div>

      {state === "done" && uploadedName ? (
        <p className="myapps-linkedin-note" role="status" style={{ marginTop: "0.75rem" }}>
          Uploaded successfully: <strong>{uploadedName}</strong>
        </p>
      ) : null}

      <div className="bo-card" style={{ marginTop: "1rem" }}>
        <h2 className="bo-card-title" style={{ marginBottom: "0.5rem" }}>
          {cvs.length > 0 ? "Uploaded CVs" : "No CVs uploaded yet"}
        </h2>
        {loadingList ? <p className="bo-page-sub">Loading CV list...</p> : null}
        {!loadingList && cvs.length === 0 ? (
          <p className="bo-page-sub" style={{ marginBottom: 0 }}>
            Upload your first CV to get started.
          </p>
        ) : null}
        {!loadingList && cvs.length > 0 ? (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {cvs.map((cv) => (
              <article key={cv.id} className="myapps-cv-list-row">
                {(() => {
                  const typeMeta = getCvTypeMeta(cv.mimeType);
                  return (
                <div className="myapps-cv-list-main">
                  <div className="myapps-cv-field" style={{ margin: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="radio"
                        name="default-cv"
                        checked={defaultCvId === cv.id}
                        onChange={() => void setAsDefault(cv.id)}
                      />
                      <button
                        type="button"
                        className="myapps-cv-filename-btn"
                        onClick={() => void setAsDefault(cv.id)}
                      >
                        <strong>{cv.originalFilename}</strong>
                      </button>
                    </span>
                    <span className="bo-page-sub" style={{ marginTop: "0.25rem", marginBottom: 0 }}>
                      <span aria-hidden>{typeMeta.icon}</span> {typeMeta.label} • {new Date(cv.createdAt).toLocaleString()}
                      {defaultCvId === cv.id ? " • Default CV" : ""}
                    </span>
                    <div className="myapps-cv-actions" style={{ marginTop: "0.5rem" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => void openPreview(cv)}>
                        View
                      </button>
                    </div>
                  </div>
                </div>
                  );
                })()}
                <div className="myapps-cv-menu-wrap">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm myapps-cv-menu-trigger"
                    aria-label={`Actions for ${cv.originalFilename}`}
                    onClick={() => setMenuOpenCvId((prev) => (prev === cv.id ? null : cv.id))}
                  >
                    ⋮
                  </button>
                  {menuOpenCvId === cv.id ? (
                    <div className="myapps-cv-menu-popover" role="menu">
                      <button
                        type="button"
                        className="myapps-cv-menu-item"
                        role="menuitem"
                        disabled={defaultCvId === cv.id}
                        title={defaultCvId === cv.id ? "Default CV cannot be deleted" : "Delete CV"}
                        onClick={() => setConfirmDeleteCv(cv)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {returnTo && cvs.length > 0 ? (
        <div style={{ marginTop: "0.9rem" }}>
          <Link href={returnTo} className="btn btn-primary">
            Continue application
          </Link>
        </div>
      ) : null}

      {previewOpen ? (
        <div className="myapps-cv-modal-backdrop" role="dialog" aria-modal="true" aria-label="CV preview">
          <div className="myapps-cv-modal">
            <div className="myapps-cv-modal-head">
              <h3 className="bo-card-title" style={{ marginBottom: 0 }}>
                {previewName || "CV preview"}
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={closePreview}>
                Close
              </button>
            </div>
            <div className="myapps-cv-modal-body">
              {previewLoading ? <p className="bo-page-sub">Loading preview...</p> : null}
              {!previewLoading && previewUrl ? (
                previewMime === "application/pdf" ? (
                  <iframe title="CV preview" src={previewUrl} className="myapps-cv-preview-frame" />
                ) : (
                  <div>
                    <p className="bo-page-sub">
                      Preview for Word files depends on browser support. Use download if preview does not render.
                    </p>
                    <iframe title="CV preview" src={previewUrl} className="myapps-cv-preview-frame" />
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {autofillOffer ? (
        <CvAutofillPromptDialog
          fileName={autofillOffer.fileName}
          onConfirm={() => void runProfileAutofill(autofillOffer)}
          onDecline={() => setAutofillOffer(null)}
        />
      ) : null}

      {processing ? (
        <CvAutofillProcessingOverlay
          fileName={processing.fileName}
          label={processing.label}
          progress={processing.progress}
        />
      ) : null}

      {confirmDeleteCv ? (
        <div className="myapps-cv-modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete CV confirmation">
          <div className="myapps-cv-modal myapps-cv-confirm-modal">
            <div className="myapps-cv-modal-head">
              <h3 className="bo-card-title" style={{ marginBottom: 0 }}>
                Delete CV
              </h3>
            </div>
            <div className="myapps-cv-modal-body">
              <p className="bo-page-sub" style={{ marginTop: 0 }}>
                Are you sure you want to delete <strong>{confirmDeleteCv.originalFilename}</strong>?
              </p>
              <p className="bo-page-sub">This removes the CV from the system and file storage permanently.</p>
              <div className="myapps-cv-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmDeleteCv(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={() => void deleteCv(confirmDeleteCv.id)}>
                  Delete CV
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
