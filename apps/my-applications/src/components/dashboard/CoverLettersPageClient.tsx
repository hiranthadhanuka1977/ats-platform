"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCandidateSession } from "@/lib/auth-storage";
import "./cv-import-prototype.css";

type UploadState = "idle" | "uploading" | "done";

type CoverLetterRow = {
  id: string;
  fileName: string;
  fileUrl: string | null;
  createdAt: string;
};

export function CoverLettersPageClient() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [letters, setLetters] = useState<CoverLetterRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadList = useCallback(async () => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      setLoadingList(false);
      return;
    }
    try {
      const response = await fetch("/api/my-applications/cover-letters/list", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { coverLetters?: CoverLetterRow[] };
        error?: { message?: string };
      };
      if (!response.ok || !payload.data?.coverLetters) {
        setError(payload.error?.message ?? "Could not load cover letters.");
        setLoadingList(false);
        return;
      }
      setLetters(payload.data.coverLetters);
    } catch {
      setError("Network error while loading cover letters.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const uploadFile = useCallback(
    async (file: File) => {
      const session = loadCandidateSession();
      if (!session?.accessToken) {
        setError("Session expired. Please sign in again.");
        return;
      }
      setError(null);
      setSuccessMessage(null);
      setState("uploading");

      const formData = new FormData();
      formData.set("file", file);

      try {
        const response = await fetch("/api/my-applications/cover-letters/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: formData,
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { fileName?: string };
          error?: { message?: string };
        };
        if (!response.ok || !payload.data?.fileName) {
          setError(payload.error?.message ?? "Could not upload cover letter.");
          setState("idle");
          return;
        }
        setSuccessMessage(`Uploaded cover letter: ${payload.data.fileName}`);
        setState("done");
        await loadList();
      } catch {
        setError("Network error while uploading cover letter.");
        setState("idle");
      }
    },
    [loadList],
  );

  const downloadLetter = useCallback(async (id: string, fileName: string) => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/my-applications/cover-letters/download?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
        setError(payload.error?.message ?? "Could not download cover letter.");
        return;
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName || "cover-letter";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Network error while downloading cover letter.");
    }
  }, []);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      void uploadFile(file);
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      void uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <section aria-labelledby="cover-letters-title">
      <h1 id="cover-letters-title" className="bo-page-title">
        Cover Letters
      </h1>
      <p className="bo-page-sub">Upload and manage your cover letters. Accepted: PDF, DOC, DOCX (max 10 MB).</p>

      {error ? (
        <p className="bo-login-error" role="alert">
          {error}
        </p>
      ) : null}
      {successMessage ? (
        <p className="myapps-linkedin-note" role="status">
          {successMessage}
        </p>
      ) : null}

      <div
        className="myapps-cv-drop"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="myapps-cv-file-input"
          id="cover-letter-upload-file-input"
          onChange={onFileChange}
          disabled={state === "uploading"}
          aria-label="Choose cover letter file to upload"
        />
        <label htmlFor="cover-letter-upload-file-input" className="myapps-cv-drop-inner">
          {state === "uploading" ? (
            <span>Uploading cover letter...</span>
          ) : (
            <>
              <strong>Drop your cover letter file here</strong>
              <span className="myapps-cv-drop-hint">or click to browse files</span>
            </>
          )}
        </label>
      </div>

      <div className="bo-card" style={{ marginTop: "1rem" }}>
        <h2 className="bo-card-title" style={{ marginBottom: "0.5rem" }}>
          {letters.length > 0 ? "Uploaded cover letters" : "No cover letters uploaded yet"}
        </h2>
        {loadingList ? <p className="bo-page-sub">Loading cover letters...</p> : null}
        {!loadingList && letters.length === 0 ? (
          <p className="bo-page-sub" style={{ marginBottom: 0 }}>
            Upload your first cover letter to get started.
          </p>
        ) : null}
        {!loadingList && letters.length > 0 ? (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {letters.map((letter) => (
              <article key={letter.id} className="myapps-cv-list-row">
                <div className="myapps-cv-list-main">
                  <p style={{ margin: 0 }}>
                    <strong>{letter.fileName}</strong>
                  </p>
                  <p className="bo-page-sub" style={{ margin: "0.25rem 0 0" }}>
                    Uploaded on {new Date(letter.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void downloadLetter(letter.id, letter.fileName)}
                >
                  Download
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
