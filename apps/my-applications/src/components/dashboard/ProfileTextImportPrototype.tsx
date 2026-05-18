"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload } from "@/types/cv-parse";
import { loadCandidateSession } from "@/lib/auth-storage";
import {
  clearCvProfileAutofillDraft,
  clearPendingCvParseId,
  loadCvProfileAutofillDraft,
  loadPendingCvParseId,
  savePendingCvParseId,
} from "@/lib/cv-profile-autofill-draft";
import { COUNTRIES } from "@/lib/countries";
import { INTERNATIONAL_DIAL_CODES } from "@/lib/international-dial-codes";
import {
  CandidateProfileReadOnlyView,
  type ProfileViewApplication,
} from "@/components/dashboard/CandidateProfileReadOnlyView";
import "./cv-import-prototype.css";

type Step = "idle" | "extracting-experience" | "extracting-education" | "saving" | "done";

type PendingRowFocus = { kind: "experience" | "education"; index: number };

type Props = {
  accessToken: string;
  defaultEmail: string;
  defaultFullName: string;
};

function splitPhone(raw: string): { code: string; number: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { code: "+65", number: "" };
  const m = /^\s*(\+\d{1,4}(?:-\d{1,4})?)\s*(.*)$/.exec(trimmed);
  if (!m) return { code: "+65", number: trimmed };
  return { code: m[1], number: m[2].trim() };
}

export function ProfileTextImportPrototype({ accessToken, defaultEmail, defaultFullName }: Props) {
  const searchParams = useSearchParams();
  const cvParseIdFromUrl = searchParams.get("cvParseId");
  const cvFileNameFromUrl = searchParams.get("cvFileName");

  const initialPayload = useMemo(() => {
    const base = emptyParsedCvPayload();
    base.candidate.email = defaultEmail;
    base.candidate.fullName = defaultFullName;
    return base;
  }, [defaultEmail, defaultFullName]);

  const [payload, setPayload] = useState<ParsedCvPayload>(initialPayload);
  const initialPhone = splitPhone(initialPayload.candidate.phone);
  const [phoneCode, setPhoneCode] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [experienceText, setExperienceText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [loadingView, setLoadingView] = useState(true);
  const [readOnlyView, setReadOnlyView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileAccount, setProfileAccount] = useState<{
    status: string;
    createdAt: string | null;
    lastLoginAt: string | null;
    resumeUrl: string | null;
  } | null>(null);
  const [profileInsights, setProfileInsights] = useState<{
    applicationCount: number;
    bookmarkCount: number;
    authProviderCount: number;
  } | null>(null);
  const [profileApplications, setProfileApplications] = useState<ProfileViewApplication[]>([]);
  const [pendingRowFocus, setPendingRowFocus] = useState<PendingRowFocus | null>(null);
  const [cvAutofillParseId, setCvAutofillParseId] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const cvAutofillAppliedRef = useRef(false);
  const cvParseIdRef = useRef<string | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (!pendingRowFocus) return;

    const elementId =
      pendingRowFocus.kind === "experience"
        ? `profile-exp-${pendingRowFocus.index}-company`
        : `profile-edu-${pendingRowFocus.index}-qualification`;

    const focusNewRow = () => {
      const el = document.getElementById(elementId);
      if (!(el instanceof HTMLInputElement)) return false;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
      return true;
    };

    if (!focusNewRow()) {
      requestAnimationFrame(focusNewRow);
    }
    setPendingRowFocus(null);
  }, [pendingRowFocus]);

  async function loadProfileView(markInitialLoad = false, force = false) {
    const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
    try {
      const response = await fetch("/api/my-applications/profile/view", {
        headers: { Authorization: `Bearer ${liveToken}` },
      });
      const payloadResponse = (await response.json().catch(() => ({}))) as {
        data?: {
          payload?: ParsedCvPayload;
          readOnly?: boolean;
          account?: {
            status: string;
            createdAt: string | null;
            lastLoginAt: string | null;
            resumeUrl: string | null;
          };
          insights?: {
            applicationCount: number;
            bookmarkCount: number;
            authProviderCount: number;
          };
          applications?: ProfileViewApplication[];
        };
      };
      if (response.ok && payloadResponse.data) {
        const shouldApplyPayload = force || !cvAutofillAppliedRef.current;
        if (shouldApplyPayload && payloadResponse.data.payload) {
          const loaded = payloadResponse.data.payload;
          setPayload(loaded);
          const parsedPhone = splitPhone(loaded.candidate.phone || "");
          setPhoneCode(parsedPhone.code);
          setPhoneNumber(parsedPhone.number);
        }
        setReadOnlyView(Boolean(payloadResponse.data.readOnly));
        if (payloadResponse.data.account) {
          setProfileAccount(payloadResponse.data.account);
        }
        if (payloadResponse.data.insights) {
          setProfileInsights(payloadResponse.data.insights);
        }
        setProfileApplications(payloadResponse.data.applications ?? []);
      }
    } catch {
      // keep default editable payload
    } finally {
      if (markInitialLoad) {
        setLoadingView(false);
      }
    }
  }

  function resolveCvParseIdForSave(): string | null {
    return cvAutofillParseId ?? cvParseIdRef.current ?? loadPendingCvParseId();
  }

  const applyCvAutofillPayload = useCallback(
    (parsed: ParsedCvPayload, parseId: string, fileName: string) => {
      const merged: ParsedCvPayload = {
        candidate: {
          fullName: parsed.candidate.fullName.trim() || defaultFullName,
          email: parsed.candidate.email.trim() || defaultEmail,
          phone: parsed.candidate.phone,
          location: parsed.candidate.location,
          currentTitle: parsed.candidate.currentTitle,
        },
        experience: parsed.experience,
        education: parsed.education,
      };

      setPayload(merged);
      const parsedPhone = splitPhone(merged.candidate.phone || "");
      setPhoneCode(parsedPhone.code);
      setPhoneNumber(parsedPhone.number);
      setCvAutofillParseId(parseId);
      cvParseIdRef.current = parseId;
      savePendingCvParseId(parseId);
      setEditMode(true);
      setSaveSuccessMessage(null);
      setStep("idle");
      setNote(`We extracted details from ${fileName}. Review each field below, then save your profile.`);
    },
    [defaultEmail, defaultFullName]
  );

  useEffect(() => {
    void loadProfileView(true);
  }, [accessToken]);

  useEffect(() => {
    if (loadingView || cvAutofillAppliedRef.current) return;

    const run = async () => {
      if (cvParseIdFromUrl) {
        const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
        try {
          const response = await fetch(
            `/api/my-applications/cv/parsed?id=${encodeURIComponent(cvParseIdFromUrl)}`,
            { headers: { Authorization: `Bearer ${liveToken}` } }
          );
          const json = (await response.json().catch(() => ({}))) as {
            data?: { parseId?: string; fileName?: string; payload?: ParsedCvPayload };
            error?: { message?: string };
          };
          if (response.ok && json.data?.payload && json.data.parseId) {
            cvAutofillAppliedRef.current = true;
            applyCvAutofillPayload(
              json.data.payload,
              json.data.parseId,
              json.data.fileName ?? cvFileNameFromUrl ?? "your CV"
            );
            return;
          }
          if (!response.ok) {
            setError(json.error?.message ?? "Could not load extracted CV data for your profile.");
          }
        } catch {
          setError("Network error while loading extracted CV data.");
        }
      }

      const draft = loadCvProfileAutofillDraft();
      if (!draft) return;

      cvAutofillAppliedRef.current = true;
      clearCvProfileAutofillDraft();
      applyCvAutofillPayload(draft.payload, draft.parseId, draft.fileName);
    };

    void run();
  }, [
    loadingView,
    cvParseIdFromUrl,
    cvFileNameFromUrl,
    accessToken,
    applyCvAutofillPayload,
  ]);

  useEffect(() => {
    if (readOnlyView && editMode) {
      fullNameInputRef.current?.focus();
    }
  }, [readOnlyView, editMode]);

  useEffect(() => {
    if (editMode && cvAutofillParseId) {
      fullNameInputRef.current?.focus();
    }
  }, [editMode, cvAutofillParseId]);

  function updateCandidate<K extends keyof ParsedCvPayload["candidate"]>(key: K, value: string) {
    setPayload((p) => ({ ...p, candidate: { ...p.candidate, [key]: value } }));
  }

  function updatePhone(nextCode: string, nextNumber: string) {
    const normalizedNumber = nextNumber.replace(/\s+/g, " ").trim();
    const combined = normalizedNumber ? `${nextCode} ${normalizedNumber}` : "";
    setPhoneCode(nextCode);
    setPhoneNumber(nextNumber);
    updateCandidate("phone", combined);
  }

  function addExperienceRow() {
    const nextIndex = payload.experience.length;
    setPayload((p) => ({
      ...p,
      experience: [...p.experience, { company: "", role: "", startDate: "", endDate: "" }],
    }));
    setPendingRowFocus({ kind: "experience", index: nextIndex });
  }

  function removeExperienceRow(index: number) {
    setPayload((p) => ({
      ...p,
      experience: p.experience.filter((_, i) => i !== index),
    }));
  }

  function addEducationRow() {
    const nextIndex = payload.education.length;
    setPayload((p) => ({
      ...p,
      education: [...p.education, { qualification: "", institution: "", startDate: "", endDate: "" }],
    }));
    setPendingRowFocus({ kind: "education", index: nextIndex });
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

    const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
    const res = await fetch("/api/my-applications/text/extract", {
      method: "POST",
      headers: { Authorization: `Bearer ${liveToken}`, "Content-Type": "application/json" },
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

    const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
    const res = await fetch("/api/my-applications/text/extract", {
      method: "POST",
      headers: { Authorization: `Bearer ${liveToken}`, "Content-Type": "application/json" },
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
    setSaveSuccessMessage(null);
    setStep("saving");

    const parseIdForSave = resolveCvParseIdForSave();
    const liveToken = loadCandidateSession()?.accessToken ?? accessToken;
    const saveUrl = parseIdForSave ? "/api/my-applications/cv/save" : "/api/my-applications/screenshot/save";
    const payloadToSave: ParsedCvPayload = {
      ...payload,
      candidate: { ...payload.candidate, email: defaultEmail },
    };
    const saveBody = parseIdForSave
      ? { parseId: parseIdForSave, payload: payloadToSave }
      : { payload: payloadToSave };

    const res = await fetch(saveUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${liveToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(saveBody),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    if (!res.ok) {
      setError(json.error?.message ?? "Could not save profile.");
      setStep("idle");
      return;
    }

    const savedFromCv = Boolean(parseIdForSave);
    cvAutofillAppliedRef.current = false;
    setCvAutofillParseId(null);
    cvParseIdRef.current = null;
    clearPendingCvParseId();
    clearCvProfileAutofillDraft();
    setEditMode(false);
    setNote(null);

    await loadProfileView(false, true);

    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", "/my-profile");
    }

    setSaveSuccessMessage(
      savedFromCv
        ? "Your profile was saved from your CV. You can update it anytime from this page."
        : "Your profile was saved successfully."
    );
    setStep("done");
  }

  function reset() {
    if (readOnlyView && !editMode) return;
    setError(null);
    setExperienceError(null);
    setEducationError(null);
    setNote(null);
    setSaveSuccessMessage(null);
    setStep("idle");
    setExperienceText("");
    setEducationText("");
    setCvAutofillParseId(null);
    cvParseIdRef.current = null;
    clearPendingCvParseId();
    cvAutofillAppliedRef.current = false;
    setPayload(initialPayload);
    setPhoneCode(initialPhone.code);
    setPhoneNumber(initialPhone.number);
  }

  const displayName = payload.candidate.fullName.trim() || defaultFullName || "Candidate";
  const showReadOnlyDashboard = readOnlyView && !editMode;
  const readOnlyAccount = profileAccount ?? {
    status: "—",
    createdAt: null,
    lastLoginAt: null,
    resumeUrl: null,
  };
  const readOnlyInsights = profileInsights ?? {
    applicationCount: 0,
    bookmarkCount: 0,
    authProviderCount: 0,
  };

  if (loadingView) {
    return <p className="bo-page-sub">Loading profile...</p>;
  }

  if (showReadOnlyDashboard) {
    return (
      <>
        <div className="bo-page-header-actions">
          <div>
            <h1 className="bo-page-title">{displayName}</h1>
            <p className="bo-page-sub">My profile</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
            Update profile
          </button>
        </div>

        {error ? (
          <p className="bo-login-error" role="alert">
            {error}
          </p>
        ) : null}

        <CandidateProfileReadOnlyView
          payload={payload}
          account={readOnlyAccount}
          insights={readOnlyInsights}
          applications={profileApplications}
        />
      </>
    );
  }

  return (
    <>
      <div className="bo-page-header-actions">
        <div>
          <h1 className="bo-page-title">{readOnlyView && editMode ? "Edit profile" : displayName}</h1>
          <p className="bo-page-sub">
            {cvAutofillParseId
              ? "Review the details we extracted from your CV, then save."
              : readOnlyView && editMode
                ? "Update your details, then save to lock your profile again."
                : "Complete your profile using LinkedIn text parsing."}
          </p>
        </div>
        {readOnlyView && editMode ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        ) : null}
      </div>

      <section className="bo-card bo-span-12" aria-labelledby="text-import-title">

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
      {saveSuccessMessage ? (
        <p className="myapps-linkedin-note myapps-cv-save-success" role="status">
          {saveSuccessMessage}
        </p>
      ) : null}
      <fieldset disabled={step === "saving" || step === "done"} style={{ border: 0, padding: 0, margin: 0 }}>
      <h3 className="myapps-cv-section-title">Profile review</h3>
      <div className="myapps-cv-grid">
        <label className="myapps-cv-field">
          Full name
          <input
            ref={fullNameInputRef}
            className="myapps-cv-input"
            value={payload.candidate.fullName}
            onChange={(e) => updateCandidate("fullName", e.target.value)}
          />
        </label>
        <label className="myapps-cv-field">
          Email
          <input
            className="myapps-cv-input myapps-cv-input-readonly"
            type="email"
            value={defaultEmail}
            readOnly
            aria-readonly="true"
            title="Email is tied to your account and cannot be changed here"
          />
          <span className="myapps-field-hint">Sign-in email — cannot be edited on this page.</span>
        </label>
        <label className="myapps-cv-field">
          Phone
          <div className="myapps-phone-row">
            <select className="myapps-cv-input" value={phoneCode} onChange={(e) => updatePhone(e.target.value, phoneNumber)}>
              {INTERNATIONAL_DIAL_CODES.map((option, index) => (
                <option key={`${option.value}-${index}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="myapps-cv-input"
              inputMode="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => updatePhone(phoneCode, e.target.value)}
            />
          </div>
        </label>
        <label className="myapps-cv-field">
          Country
          <select className="myapps-cv-input" value={payload.candidate.location} onChange={(e) => updateCandidate("location", e.target.value)}>
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className="myapps-cv-field myapps-cv-field-span2">
          Current title
          <input className="myapps-cv-input" value={payload.candidate.currentTitle} onChange={(e) => updateCandidate("currentTitle", e.target.value)} />
        </label>
      </div>

      <h3 className="myapps-cv-section-title">Experience</h3>
      <div className="myapps-cv-text-apply-block">
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
        <div className="myapps-cv-text-apply-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={step === "extracting-experience" || step === "extracting-education" || step === "saving"}
            onClick={() => void applyExperienceText()}
          >
            {step === "extracting-experience" ? "Extracting experience..." : "Extract Experience"}
          </button>
        </div>
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
                id={`profile-exp-${i}-company`}
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
      <div className="myapps-cv-text-apply-block">
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
        <div className="myapps-cv-text-apply-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={step === "extracting-experience" || step === "extracting-education" || step === "saving"}
            onClick={() => void applyEducationText()}
          >
            {step === "extracting-education" ? "Extracting education..." : "Extract Education"}
          </button>
        </div>
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
                id={`profile-edu-${i}-qualification`}
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
      </fieldset>

      {step === "done" ? (
        <div className="myapps-cv-done">
          <p className="bo-page-sub" style={{ marginBottom: "var(--space-4)" }}>
            {saveSuccessMessage ?? "Your profile has been saved."}
          </p>
          <div className="myapps-cv-actions" style={{ marginTop: 0 }}>
            <Link href="/dashboard" className="btn btn-primary">
              Back to dashboard
            </Link>
            {!readOnlyView ? (
              <button type="button" className="btn btn-secondary" onClick={reset}>
                Edit again
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
    </>
  );
}
