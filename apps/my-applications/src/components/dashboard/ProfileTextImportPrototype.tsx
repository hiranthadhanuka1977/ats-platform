"use client";

import { useMemo, useState } from "react";
import type { ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload } from "@/types/cv-parse";
import "./cv-import-prototype.css";

type Step = "idle" | "extracting-experience" | "extracting-education" | "saving" | "done";

type Props = {
  accessToken: string;
  defaultEmail: string;
  defaultFullName: string;
};

export function ProfileTextImportPrototype({ accessToken, defaultEmail, defaultFullName }: Props) {
  const initialPayload = useMemo(() => {
    const base = emptyParsedCvPayload();
    base.candidate.email = defaultEmail;
    base.candidate.fullName = defaultFullName;
    return base;
  }, [defaultEmail, defaultFullName]);

  const [payload, setPayload] = useState<ParsedCvPayload>(initialPayload);
  const [experienceText, setExperienceText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");

  function updateCandidate<K extends keyof ParsedCvPayload["candidate"]>(key: K, value: string) {
    setPayload((p) => ({ ...p, candidate: { ...p.candidate, [key]: value } }));
  }

  function addExperienceRow() {
    setPayload((p) => ({
      ...p,
      experience: [...p.experience, { company: "", role: "", startDate: "", endDate: "" }],
    }));
  }

  function removeExperienceRow(index: number) {
    setPayload((p) => ({
      ...p,
      experience: p.experience.filter((_, i) => i !== index),
    }));
  }

  function addEducationRow() {
    setPayload((p) => ({
      ...p,
      education: [...p.education, { qualification: "", institution: "", startDate: "", endDate: "" }],
    }));
  }

  function removeEducationRow(index: number) {
    setPayload((p) => ({
      ...p,
      education: p.education.filter((_, i) => i !== index),
    }));
  }

  async function applyExperienceText() {
    if (!experienceText.trim()) {
      setExperienceError("Paste experience text first.");
      return;
    }
    setError(null);
    setExperienceError(null);
    setEducationError(null);
    setNote(null);
    setStep("extracting-experience");

    const res = await fetch("/api/my-applications/text/extract", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ experienceText, educationText: "" }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { payload?: ParsedCvPayload };
      error?: { message?: string };
    };
    if (!res.ok || !json.data?.payload) {
      setExperienceError(json.error?.message ?? "Could not parse experience text.");
      setStep("idle");
      return;
    }

    const parsed = json.data.payload;
    setPayload((p) => ({
      candidate: {
        fullName: parsed.candidate.fullName || p.candidate.fullName,
        email: parsed.candidate.email || p.candidate.email,
        phone: parsed.candidate.phone || p.candidate.phone,
        location: parsed.candidate.location || p.candidate.location,
        currentTitle: parsed.candidate.currentTitle || p.candidate.currentTitle,
      },
      experience: parsed.experience,
      education: p.education,
    }));
    setNote("Experience text parsed with AI. Review and edit before saving.");
    setStep("idle");
  }

  async function applyEducationText() {
    if (!educationText.trim()) {
      setEducationError("Paste education text first.");
      return;
    }
    setError(null);
    setExperienceError(null);
    setEducationError(null);
    setNote(null);
    setStep("extracting-education");

    const res = await fetch("/api/my-applications/text/extract", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ experienceText: "", educationText }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { payload?: ParsedCvPayload };
      error?: { message?: string };
    };
    if (!res.ok || !json.data?.payload) {
      setEducationError(json.error?.message ?? "Could not parse education text.");
      setStep("idle");
      return;
    }

    const parsed = json.data.payload;
    setPayload((p) => ({
      candidate: {
        fullName: parsed.candidate.fullName || p.candidate.fullName,
        email: parsed.candidate.email || p.candidate.email,
        phone: parsed.candidate.phone || p.candidate.phone,
        location: parsed.candidate.location || p.candidate.location,
        currentTitle: parsed.candidate.currentTitle || p.candidate.currentTitle,
      },
      experience: p.experience,
      education: parsed.education,
    }));
    setNote("Education text parsed with AI. Review and edit before saving.");
    setStep("idle");
  }

  async function onSave() {
    setError(null);
    setExperienceError(null);
    setEducationError(null);
    setStep("saving");

    const res = await fetch("/api/my-applications/screenshot/save", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      setError(json.error?.message ?? "Could not save profile.");
      setStep("idle");
      return;
    }
    setStep("done");
  }

  function reset() {
    setError(null);
    setExperienceError(null);
    setEducationError(null);
    setNote(null);
    setStep("idle");
    setExperienceText("");
    setEducationText("");
    setPayload(initialPayload);
  }

  return (
    <section className="bo-card bo-span-12" aria-labelledby="text-import-title">
      <h2 id="text-import-title" className="bo-card-title">
        Build profile from LinkedIn text (prototype)
      </h2>
      <p className="bo-page-sub" style={{ marginTop: 0 }}>
        Paste text from your LinkedIn <strong>Experience</strong> and <strong>Education</strong> sections, then apply it to prefill your profile rows.
      </p>

      {error ? (
        <p className="bo-login-error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? (
        <p className="myapps-linkedin-note" role="status">
          {note}
        </p>
      ) : null}

      <h3 className="myapps-cv-section-title">Profile review</h3>
      <div className="myapps-cv-grid">
        <label className="myapps-cv-field">
          Full name
          <input className="myapps-cv-input" value={payload.candidate.fullName} onChange={(e) => updateCandidate("fullName", e.target.value)} />
        </label>
        <label className="myapps-cv-field">
          Email
          <input className="myapps-cv-input" type="email" value={payload.candidate.email} onChange={(e) => updateCandidate("email", e.target.value)} />
        </label>
        <label className="myapps-cv-field">
          Phone
          <input className="myapps-cv-input" value={payload.candidate.phone} onChange={(e) => updateCandidate("phone", e.target.value)} />
        </label>
        <label className="myapps-cv-field">
          Location
          <input className="myapps-cv-input" value={payload.candidate.location} onChange={(e) => updateCandidate("location", e.target.value)} />
        </label>
        <label className="myapps-cv-field myapps-cv-field-span2">
          Current title
          <input className="myapps-cv-input" value={payload.candidate.currentTitle} onChange={(e) => updateCandidate("currentTitle", e.target.value)} />
        </label>
      </div>

      <h3 className="myapps-cv-section-title">Experience</h3>
      <label className="myapps-cv-field">
        <span className="myapps-field-label-row">
          <span>Experience text</span>
          <span className="myapps-help-inline" tabIndex={0}>
            <span className="myapps-help-icon" aria-hidden>
              ?
            </span>
            <span className="myapps-help-link">What&apos;s this?</span>
            <span className="myapps-help-tip" role="tooltip">
              Copy and paste your LinkedIn Experience section here. We map it automatically into structured experience rows.
            </span>
          </span>
        </span>
        <textarea
          className="myapps-cv-input"
          rows={6}
          placeholder="Paste LinkedIn Experience text here..."
          value={experienceText}
          onChange={(e) => setExperienceText(e.target.value)}
        />
      </label>
      <div className="myapps-cv-actions" style={{ marginTop: 0 }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={step === "extracting-experience" || step === "extracting-education" || step === "saving"}
          onClick={() => void applyExperienceText()}
        >
          {step === "extracting-experience" ? "Parsing experience text..." : "Apply Experience text"}
        </button>
      </div>
      {experienceError ? (
        <p className="bo-login-error" role="alert" style={{ marginTop: "0.35rem" }}>
          {experienceError}
        </p>
      ) : null}
      <button type="button" className="btn btn-secondary btn-sm myapps-cv-add" onClick={addExperienceRow}>
        + Add experience manually
      </button>
      {payload.experience.length === 0 ? <p className="bo-page-sub">No rows yet. Paste Experience text and click "Apply pasted text".</p> : null}
      {payload.experience.map((row, i) => (
        <div key={`txt-exp-${i}`} className="myapps-cv-row-block">
          <div className="myapps-cv-grid">
            <label className="myapps-cv-field">
              Company
              <input
                className="myapps-cv-input"
                value={row.company}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.experience];
                    next[i] = { ...next[i], company: e.target.value };
                    return { ...p, experience: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              Role
              <input
                className="myapps-cv-input"
                value={row.role}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.experience];
                    next[i] = { ...next[i], role: e.target.value };
                    return { ...p, experience: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              Start
              <input
                className="myapps-cv-input"
                value={row.startDate}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.experience];
                    next[i] = { ...next[i], startDate: e.target.value };
                    return { ...p, experience: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              End
              <input
                className="myapps-cv-input"
                value={row.endDate}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.experience];
                    next[i] = { ...next[i], endDate: e.target.value };
                    return { ...p, experience: next };
                  })
                }
              />
            </label>
          </div>
          <button type="button" className="btn btn-secondary btn-sm myapps-cv-remove" onClick={() => removeExperienceRow(i)}>
            Remove
          </button>
        </div>
      ))}

      <h3 className="myapps-cv-section-title">Education</h3>
      <label className="myapps-cv-field">
        <span className="myapps-field-label-row">
          <span>Education text</span>
          <span className="myapps-help-inline" tabIndex={0}>
            <span className="myapps-help-icon" aria-hidden>
              ?
            </span>
            <span className="myapps-help-link">What&apos;s this?</span>
            <span className="myapps-help-tip" role="tooltip">
              Copy and paste your LinkedIn Education section here. We map it automatically into structured education rows.
            </span>
          </span>
        </span>
        <textarea
          className="myapps-cv-input"
          rows={6}
          placeholder="Paste LinkedIn Education text here..."
          value={educationText}
          onChange={(e) => setEducationText(e.target.value)}
        />
      </label>
      <div className="myapps-cv-actions" style={{ marginTop: 0 }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={step === "extracting-experience" || step === "extracting-education" || step === "saving"}
          onClick={() => void applyEducationText()}
        >
          {step === "extracting-education" ? "Parsing education text..." : "Apply Education text"}
        </button>
      </div>
      {educationError ? (
        <p className="bo-login-error" role="alert" style={{ marginTop: "0.35rem" }}>
          {educationError}
        </p>
      ) : null}
      <button type="button" className="btn btn-secondary btn-sm myapps-cv-add" onClick={addEducationRow}>
        + Add education manually
      </button>
      {payload.education.length === 0 ? <p className="bo-page-sub">No rows yet. Paste Education text and click "Apply pasted text".</p> : null}
      {payload.education.map((row, i) => (
        <div key={`txt-edu-${i}`} className="myapps-cv-row-block">
          <div className="myapps-cv-grid">
            <label className="myapps-cv-field">
              Qualification
              <input
                className="myapps-cv-input"
                value={row.qualification}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.education];
                    next[i] = { ...next[i], qualification: e.target.value };
                    return { ...p, education: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              Institution
              <input
                className="myapps-cv-input"
                value={row.institution}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.education];
                    next[i] = { ...next[i], institution: e.target.value };
                    return { ...p, education: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              Start
              <input
                className="myapps-cv-input"
                value={row.startDate}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.education];
                    next[i] = { ...next[i], startDate: e.target.value };
                    return { ...p, education: next };
                  })
                }
              />
            </label>
            <label className="myapps-cv-field">
              End
              <input
                className="myapps-cv-input"
                value={row.endDate}
                onChange={(e) =>
                  setPayload((p) => {
                    const next = [...p.education];
                    next[i] = { ...next[i], endDate: e.target.value };
                    return { ...p, education: next };
                  })
                }
              />
            </label>
          </div>
          <button type="button" className="btn btn-secondary btn-sm myapps-cv-remove" onClick={() => removeEducationRow(i)}>
            Remove
          </button>
        </div>
      ))}

      <div className="myapps-cv-actions">
        <button type="button" className="btn btn-secondary" disabled={step === "saving"} onClick={reset}>
          Reset
        </button>
        <button type="button" className="btn btn-primary" disabled={step === "saving"} onClick={() => void onSave()}>
          {step === "saving" ? "Saving..." : "Confirm & save profile"}
        </button>
      </div>

      {step === "done" ? (
        <div className="myapps-cv-done">
          <p className="bo-page-sub" style={{ marginBottom: "var(--space-4)" }}>
            Saved. Profile, experience, and education were updated from pasted LinkedIn text.
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Start again
          </button>
        </div>
      ) : null}
    </section>
  );
}
