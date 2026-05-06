"use client";

import { useMemo, useState } from "react";
import type { ParsedCvEducation, ParsedCvExperience, ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload } from "@/types/cv-parse";
import "./cv-import-prototype.css";

type Step = "idle" | "saving" | "done";
type Section = "experience" | "education";

type Props = {
  accessToken: string;
  defaultEmail: string;
  defaultFullName: string;
};

function readImageFromClipboard(event: React.ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

export function ProfileScreenshotImportPrototype({ accessToken, defaultEmail, defaultFullName }: Props) {
  const initialPayload = useMemo(() => {
    const base = emptyParsedCvPayload();
    base.candidate.email = defaultEmail;
    base.candidate.fullName = defaultFullName;
    return base;
  }, [defaultEmail, defaultFullName]);

  const [payload, setPayload] = useState<ParsedCvPayload>(initialPayload);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [busy, setBusy] = useState<Section | null>(null);

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

  async function extract(section: Section, file: File) {
    setError(null);
    setNote(null);
    setBusy(section);
    const fd = new FormData();
    fd.set("section", section);
    fd.set("file", file);
    const res = await fetch("/api/my-applications/screenshot/extract", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: fd,
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { experience?: ParsedCvExperience[]; education?: ParsedCvEducation[] };
      error?: { message?: string };
    };
    if (!res.ok || !json.data) {
      setError(json.error?.message ?? `Could not extract ${section} from screenshot.`);
      setBusy(null);
      return;
    }
    const data = json.data;

    setPayload((p) => ({
      ...p,
      experience: section === "experience" ? (data.experience ?? []) : p.experience,
      education: section === "education" ? (data.education ?? []) : p.education,
    }));
    setNote(`${section === "experience" ? "Experience" : "Education"} extracted. Review and edit before saving.`);
    setBusy(null);
  }

  async function onSave() {
    setError(null);
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
    setNote(null);
    setBusy(null);
    setStep("idle");
    setPayload(initialPayload);
  }

  return (
    <section className="bo-card bo-span-12" aria-labelledby="screenshot-import-title">
      <h2 id="screenshot-import-title" className="bo-card-title">
        Build profile from LinkedIn screenshots (prototype)
      </h2>
      <p className="bo-page-sub" style={{ marginTop: 0 }}>
        Upload or paste screenshots for your LinkedIn <strong>Experience</strong> and <strong>Education</strong> sections.
        We extract the data with OpenAI, then you review/edit and save.
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

      <div className="myapps-screenshot-grid">
        <div
          className="myapps-screenshot-block"
          onPaste={(e) => {
            const file = readImageFromClipboard(e);
            if (!file || busy) return;
            e.preventDefault();
            void extract("experience", file);
          }}
        >
          <h3 className="myapps-cv-section-title">Experience screenshot</h3>
          <p className="bo-page-sub myapps-screenshot-sub">Upload or click here then press Ctrl/Cmd+V to paste image.</p>
          <label className="myapps-screenshot-drop">
            <input
              type="file"
              accept="image/*"
              className="myapps-cv-file-input"
              disabled={Boolean(busy)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                void extract("experience", file);
              }}
            />
            <span>{busy === "experience" ? "Extracting experience…" : "Select/Paste Experience screenshot"}</span>
          </label>
        </div>

        <div
          className="myapps-screenshot-block"
          onPaste={(e) => {
            const file = readImageFromClipboard(e);
            if (!file || busy) return;
            e.preventDefault();
            void extract("education", file);
          }}
        >
          <h3 className="myapps-cv-section-title">Education screenshot</h3>
          <p className="bo-page-sub myapps-screenshot-sub">Upload or click here then press Ctrl/Cmd+V to paste image.</p>
          <label className="myapps-screenshot-drop">
            <input
              type="file"
              accept="image/*"
              className="myapps-cv-file-input"
              disabled={Boolean(busy)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                void extract("education", file);
              }}
            />
            <span>{busy === "education" ? "Extracting education…" : "Select/Paste Education screenshot"}</span>
          </label>
        </div>
      </div>

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
      {payload.experience.length === 0 ? <p className="bo-page-sub">No rows yet — import screenshot or add manually.</p> : null}
      {payload.experience.map((row, i) => (
        <div key={`screen-exp-${i}`} className="myapps-cv-row-block">
          <div className="myapps-cv-grid">
            <label className="myapps-cv-field">
              Company
              <input className="myapps-cv-input" value={row.company} onChange={(e) => setExperience(i, { company: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              Role
              <input className="myapps-cv-input" value={row.role} onChange={(e) => setExperience(i, { role: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              Start
              <input className="myapps-cv-input" value={row.startDate} onChange={(e) => setExperience(i, { startDate: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              End
              <input className="myapps-cv-input" value={row.endDate} onChange={(e) => setExperience(i, { endDate: e.target.value })} />
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

      <h3 className="myapps-cv-section-title">Education</h3>
      {payload.education.length === 0 ? <p className="bo-page-sub">No rows yet — import screenshot or add manually.</p> : null}
      {payload.education.map((row, i) => (
        <div key={`screen-edu-${i}`} className="myapps-cv-row-block">
          <div className="myapps-cv-grid">
            <label className="myapps-cv-field">
              Qualification
              <input className="myapps-cv-input" value={row.qualification} onChange={(e) => setEducation(i, { qualification: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              Institution
              <input className="myapps-cv-input" value={row.institution} onChange={(e) => setEducation(i, { institution: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              Start
              <input className="myapps-cv-input" value={row.startDate} onChange={(e) => setEducation(i, { startDate: e.target.value })} />
            </label>
            <label className="myapps-cv-field">
              End
              <input className="myapps-cv-input" value={row.endDate} onChange={(e) => setEducation(i, { endDate: e.target.value })} />
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

      <div className="myapps-cv-actions">
        <button type="button" className="btn btn-secondary" disabled={step === "saving"} onClick={reset}>
          Reset
        </button>
        <button type="button" className="btn btn-primary" disabled={step === "saving" || Boolean(busy)} onClick={() => void onSave()}>
          {step === "saving" ? "Saving…" : "Confirm & save profile"}
        </button>
      </div>

      {step === "done" ? (
        <div className="myapps-cv-done">
          <p className="bo-page-sub" style={{ marginBottom: "var(--space-4)" }}>
            Saved. Profile + experience + education were updated from screenshot extraction.
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Start again
          </button>
        </div>
      ) : null}
    </section>
  );
}
