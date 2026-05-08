"use client";

import { useCallback, useState } from "react";
import type { ParsedCvEducation, ParsedCvExperience, ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload } from "@/types/cv-parse";
import { loadCandidateSession } from "@/lib/auth-storage";
import "./cv-import-prototype.css";

type Step = "drop" | "working" | "review" | "saving" | "done";

type CvImportPrototypeProps = {
  accessToken: string;
};

export function CvImportPrototype({ accessToken }: CvImportPrototypeProps) {
  const [step, setStep] = useState<Step>("drop");
  const [error, setError] = useState<string | null>(null);
  const [parseId, setParseId] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [payload, setPayload] = useState<ParsedCvPayload>(emptyParsedCvPayload());

  const runUploadAndParse = useCallback(
    async (file: File) => {
      setError(null);
      setStep("working");
      setFileLabel(file.name);

      const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
      const auth = { Authorization: `Bearer ${liveToken}` };

      const fd = new FormData();
      fd.set("file", file);

      const up = await fetch("/api/my-applications/cv/upload", {
        method: "POST",
        headers: auth,
        body: fd,
      });
      const upJson = (await up.json().catch(() => ({}))) as {
        data?: { parseId?: string };
        error?: { message?: string; code?: string };
      };
      if (!up.ok || !upJson.data?.parseId) {
        setError(upJson.error?.message ?? "Upload failed.");
        setStep("drop");
        return;
      }
      const id = upJson.data.parseId;
      setParseId(id);

      const pr = await fetch("/api/my-applications/cv/parse", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ parseId: id }),
      });
      const prJson = (await pr.json().catch(() => ({}))) as {
        data?: { payload?: ParsedCvPayload };
        error?: { message?: string };
      };
      if (!pr.ok || !prJson.data?.payload) {
        setError(prJson.error?.message ?? "Could not extract or parse the CV.");
        setStep("drop");
        return;
      }

      setPayload(prJson.data.payload);
      setStep("review");
    },
    [accessToken]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      void runUploadAndParse(file);
    },
    [runUploadAndParse]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      void runUploadAndParse(file);
    },
    [runUploadAndParse]
  );

  async function onSave() {
    if (!parseId) return;
    setError(null);
    setStep("saving");
    const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
    const res = await fetch("/api/my-applications/cv/save", {
      method: "POST",
      headers: { Authorization: `Bearer ${liveToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ parseId, payload }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      setError(json.error?.message ?? "Save failed.");
      setStep("review");
      return;
    }
    setStep("done");
  }

  function reset() {
    setStep("drop");
    setError(null);
    setParseId(null);
    setFileLabel(null);
    setPayload(emptyParsedCvPayload());
  }

  function updateCandidate<K extends keyof ParsedCvPayload["candidate"]>(key: K, value: string) {
    setPayload((p) => ({ ...p, candidate: { ...p.candidate, [key]: value } }));
  }

  function setEducation(i: number, patch: Partial<ParsedCvEducation>) {
    setPayload((p) => {
      const next = [...p.education];
      next[i] = { ...next[i], ...patch };
      return { ...p, education: next };
    });
  }

  function addEducation() {
    setPayload((p) => ({
      ...p,
      education: [...p.education, { qualification: "", institution: "", startDate: "", endDate: "" }],
    }));
  }

  function removeEducation(i: number) {
    setPayload((p) => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));
  }

  function setExperience(i: number, patch: Partial<ParsedCvExperience>) {
    setPayload((p) => {
      const next = [...p.experience];
      next[i] = { ...next[i], ...patch };
      return { ...p, experience: next };
    });
  }

  function addExperience() {
    setPayload((p) => ({
      ...p,
      experience: [...p.experience, { company: "", role: "", startDate: "", endDate: "" }],
    }));
  }

  function removeExperience(i: number) {
    setPayload((p) => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  }

  return (
    <section className="bo-card bo-span-12" aria-labelledby="cv-proto-title">
      <h2 id="cv-proto-title" className="bo-card-title">
        CV import (prototype)
      </h2>
      <p className="bo-page-sub" style={{ marginTop: 0 }}>
        Drop a CV (PDF or Word). Text is extracted, parsed (OpenAI when <code>OPENAI_API_KEY</code> is set, otherwise
        heuristics), then you review and confirm to save to your profile.
      </p>

      {error ? (
        <p className="bo-login-error" role="alert">
          {error}
        </p>
      ) : null}

      {step === "drop" || step === "working" ? (
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
            id="cv-file-input"
            onChange={onFileChange}
            disabled={step === "working"}
            aria-label="Choose CV file"
          />
          <label htmlFor="cv-file-input" className="myapps-cv-drop-inner">
            {step === "working" ? (
              <span>Uploading and parsing…</span>
            ) : (
              <>
                <strong>Drop your CV here</strong>
                <span className="myapps-cv-drop-hint">or click to choose a file (PDF, .doc, .docx — max 10 MB)</span>
              </>
            )}
          </label>
        </div>
      ) : null}

      {step === "review" || step === "saving" ? (
        <div className="myapps-cv-review">
          {fileLabel ? (
            <p className="bo-page-sub" style={{ marginTop: 0 }}>
              File: <strong>{fileLabel}</strong>
            </p>
          ) : null}

          <h3 className="myapps-cv-section-title">Candidate</h3>
          <div className="myapps-cv-grid">
            <label className="myapps-cv-field">
              Full name
              <input
                className="myapps-cv-input"
                value={payload.candidate.fullName}
                onChange={(e) => updateCandidate("fullName", e.target.value)}
              />
            </label>
            <label className="myapps-cv-field">
              Email
              <input
                className="myapps-cv-input"
                type="email"
                value={payload.candidate.email}
                onChange={(e) => updateCandidate("email", e.target.value)}
              />
            </label>
            <label className="myapps-cv-field">
              Phone
              <input
                className="myapps-cv-input"
                value={payload.candidate.phone}
                onChange={(e) => updateCandidate("phone", e.target.value)}
              />
            </label>
            <label className="myapps-cv-field">
              Location
              <input
                className="myapps-cv-input"
                value={payload.candidate.location}
                onChange={(e) => updateCandidate("location", e.target.value)}
              />
            </label>
            <label className="myapps-cv-field myapps-cv-field-span2">
              Current title
              <input
                className="myapps-cv-input"
                value={payload.candidate.currentTitle}
                onChange={(e) => updateCandidate("currentTitle", e.target.value)}
              />
            </label>
          </div>

          <h3 className="myapps-cv-section-title">Education</h3>
          {payload.education.length === 0 ? (
            <p className="bo-page-sub">No rows — add entries manually if needed.</p>
          ) : null}
          {payload.education.map((row, i) => (
            <div key={`edu-${i}`} className="myapps-cv-row-block">
              <div className="myapps-cv-grid">
                <label className="myapps-cv-field">
                  Qualification
                  <input
                    className="myapps-cv-input"
                    value={row.qualification}
                    onChange={(e) => setEducation(i, { qualification: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  Institution
                  <input
                    className="myapps-cv-input"
                    value={row.institution}
                    onChange={(e) => setEducation(i, { institution: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  Start
                  <input
                    className="myapps-cv-input"
                    value={row.startDate}
                    onChange={(e) => setEducation(i, { startDate: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  End
                  <input
                    className="myapps-cv-input"
                    value={row.endDate}
                    onChange={(e) => setEducation(i, { endDate: e.target.value })}
                  />
                </label>
              </div>
              <button type="button" className="btn btn-secondary btn-sm myapps-cv-remove" onClick={() => removeEducation(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm myapps-cv-add" onClick={addEducation}>
            + Add education
          </button>

          <h3 className="myapps-cv-section-title">Experience</h3>
          {payload.experience.length === 0 ? (
            <p className="bo-page-sub">No rows — add entries manually if needed.</p>
          ) : null}
          {payload.experience.map((row, i) => (
            <div key={`exp-${i}`} className="myapps-cv-row-block">
              <div className="myapps-cv-grid">
                <label className="myapps-cv-field">
                  Company
                  <input
                    className="myapps-cv-input"
                    value={row.company}
                    onChange={(e) => setExperience(i, { company: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  Role
                  <input
                    className="myapps-cv-input"
                    value={row.role}
                    onChange={(e) => setExperience(i, { role: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  Start
                  <input
                    className="myapps-cv-input"
                    value={row.startDate}
                    onChange={(e) => setExperience(i, { startDate: e.target.value })}
                  />
                </label>
                <label className="myapps-cv-field">
                  End
                  <input
                    className="myapps-cv-input"
                    value={row.endDate}
                    onChange={(e) => setExperience(i, { endDate: e.target.value })}
                  />
                </label>
              </div>
              <button type="button" className="btn btn-secondary btn-sm myapps-cv-remove" onClick={() => removeExperience(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm myapps-cv-add" onClick={addExperience}>
            + Add experience
          </button>

          <div className="myapps-cv-actions">
            <button type="button" className="btn btn-secondary" disabled={step === "saving"} onClick={reset}>
              Start over
            </button>
            <button type="button" className="btn btn-primary" disabled={step === "saving"} onClick={() => void onSave()}>
              {step === "saving" ? "Saving…" : "Confirm & save to profile"}
            </button>
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="myapps-cv-done">
          <p className="bo-page-sub" style={{ marginBottom: "var(--space-4)" }}>
            Saved. Your profile and CV-derived education/experience rows were updated (prototype).
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Upload another CV
          </button>
        </div>
      ) : null}
    </section>
  );
}
