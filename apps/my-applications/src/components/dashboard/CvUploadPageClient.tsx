"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCandidateSession } from "@/lib/auth-storage";
import "./cv-import-prototype.css";

type UploadState = "idle" | "uploading" | "done";
type CvRow = {
  id: string;
  originalFilename: string;
  mimeType: string;
  createdAt: string;
};

export function CvUploadPageClient() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CvRow[]>([]);
  const [defaultCvId, setDefaultCvId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [menuOpenCvId, setMenuOpenCvId] = useState<string | null>(null);

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

  const uploadFile = useCallback(async (file: File) => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setError(null);
    setUploadedName(null);
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
        data?: { originalFilename?: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.data?.originalFilename) {
        setError(payload.error?.message ?? "Could not upload CV.");
        setState("idle");
        return;
      }

      setUploadedName(payload.data.originalFilename);
      setState("done");
      await loadList();
    } catch {
      setError("Network error while uploading CV.");
      setState("idle");
    }
  }, [loadList]);

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
      const ok = window.confirm(`Delete CV "${target.originalFilename}"? This will remove it from storage permanently.`);
      if (!ok) return;

      setError(null);
      setMenuOpenCvId(null);
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
          disabled={state === "uploading"}
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
                <div className="myapps-cv-list-main">
                  <label className="myapps-cv-field" style={{ margin: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="radio"
                        name="default-cv"
                        checked={defaultCvId === cv.id}
                        onChange={() => void setAsDefault(cv.id)}
                      />
                      <strong>{cv.originalFilename}</strong>
                    </span>
                    <span className="bo-page-sub" style={{ marginTop: "0.25rem", marginBottom: 0 }}>
                      {new Date(cv.createdAt).toLocaleString()} • {cv.mimeType}
                      {defaultCvId === cv.id ? " • Default CV" : ""}
                    </span>
                  </label>
                </div>
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
                        onClick={() => void deleteCv(cv.id)}
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
    </section>
  );
}
