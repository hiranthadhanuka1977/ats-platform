"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadCandidateSession } from "@/lib/auth-storage";

type CvItem = {
  id: string;
  originalFilename: string;
  mimeType: string;
  createdAt: string;
};

type Props = {
  jobSlug: string;
  jobTitle: string;
};

type CoverLetterMode = "file" | "text";

function formatCurrencyLikeInput(raw: string): string {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  const numberValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(numberValue)) return "";
  return new Intl.NumberFormat("en-US").format(numberValue);
}

function normalizeCurrencyInput(raw: string): string {
  return raw.replace(/,/g, "").trim();
}

export function ApplyJobPageClient({ jobSlug, jobTitle }: Props) {
  const router = useRouter();
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [mode, setMode] = useState<CoverLetterMode>("file");
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceMonths, setExperienceMonths] = useState("");
  const [hasDomainExperience, setHasDomainExperience] = useState<"yes" | "no" | "">("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [salaryExpectationAnnual, setSalaryExpectationAnnual] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState<"yes" | "no" | "">("");
  const [isLegallyAuthorizedToWork, setIsLegallyAuthorizedToWork] = useState<"yes" | "no" | "">("");
  const [workModePreference, setWorkModePreference] = useState("");
  const [shortMotivation, setShortMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCv = useMemo(() => cvs.find((cv) => cv.id === selectedCvId) ?? null, [cvs, selectedCvId]);
  const hasCv = cvs.length > 0;
  const hasCoverLetter =
    mode === "file" ? coverLetterFile != null : coverLetterText.trim().length > 0;
  const experienceYearsTrimmed = experienceYears.trim();
  const experienceYearsValue = Number.parseInt(experienceYearsTrimmed, 10);
  const experienceMonthsTrimmed = experienceMonths.trim();
  const experienceMonthsValue = Number.parseInt(experienceMonthsTrimmed, 10);
  const salaryExpectationAnnualNormalized = normalizeCurrencyInput(salaryExpectationAnnual);
  const salaryExpectationAnnualValue = Number.parseFloat(salaryExpectationAnnualNormalized);
  const isExperienceYearsValid =
    experienceYearsTrimmed.length === 0 || (Number.isInteger(experienceYearsValue) && experienceYearsValue >= 0);
  const isExperienceMonthsValid =
    experienceMonthsTrimmed.length === 0 ||
    (Number.isInteger(experienceMonthsValue) && experienceMonthsValue >= 0 && experienceMonthsValue <= 11);
  const hasExperienceProvided = experienceYearsTrimmed.length > 0 || experienceMonthsTrimmed.length > 0;
  const isSalaryExpectationValid = Number.isFinite(salaryExpectationAnnualValue) && salaryExpectationAnnualValue >= 0;
  const isDomainExperienceValid = hasDomainExperience === "yes" || hasDomainExperience === "no";
  const isWillingToRelocateValid = willingToRelocate === "yes" || willingToRelocate === "no";
  const isLegallyAuthorizedToWorkValid =
    isLegallyAuthorizedToWork === "yes" || isLegallyAuthorizedToWork === "no";
  const isNoticePeriodValid = [
    "Immediate",
    "15 days",
    "30 days",
    "60 days",
    "90+ days",
    "Negotiable",
  ].includes(noticePeriod);
  const isWorkModePreferenceValid = ["remote", "onsite", "hybrid", "flexible"].includes(workModePreference);
  const hasQuestionnaire =
    hasExperienceProvided &&
    isExperienceYearsValid &&
    isExperienceMonthsValid &&
    isDomainExperienceValid &&
    isNoticePeriodValid &&
    isSalaryExpectationValid &&
    isWillingToRelocateValid &&
    isLegallyAuthorizedToWorkValid &&
    isWorkModePreferenceValid;
  const canContinueToReview = hasQuestionnaire;

  const noticePeriodOptions = [
    "Immediate",
    "15 days",
    "30 days",
    "60 days",
    "90+ days",
    "Negotiable",
  ];

  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Your session has expired. Please sign in again.");
      setLoadingCvs(false);
      return;
    }
    void (async () => {
      try {
        const response = await fetch("/api/my-applications/cv/list", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { defaultCvId?: string | null; cvs?: CvItem[] };
          error?: { message?: string };
        };
        if (!response.ok) {
          throw new Error(payload.error?.message || "Unable to load CV list.");
        }
        const rows = payload.data?.cvs ?? [];
        setCvs(rows);
        const defaultId = payload.data?.defaultCvId ?? "";
        const preselected = defaultId && rows.some((cv) => cv.id === defaultId) ? defaultId : rows[0]?.id ?? "";
        setSelectedCvId(preselected);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load CV list.");
      } finally {
        setLoadingCvs(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    if (!selectedCvId) {
      setError("Please select a CV.");
      return;
    }
    if (!hasCoverLetter) {
      setError("Please provide a cover letter file or text.");
      return;
    }
    if (!hasQuestionnaire) {
      setError("Please complete all required additional questions before continuing.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("jobSlug", jobSlug);
      formData.set("cvId", selectedCvId);
      formData.set("coverLetterMode", mode);
      if (mode === "file" && coverLetterFile) {
        formData.set("coverLetter", coverLetterFile);
      }
      if (mode === "text") {
        formData.set("coverLetterText", coverLetterText.trim());
      }
      formData.set("experienceYears", experienceYearsTrimmed.length > 0 ? experienceYearsTrimmed : "0");
      formData.set("experienceMonths", experienceMonthsTrimmed.length > 0 ? experienceMonthsTrimmed : "0");
      formData.set("hasDomainExperience", hasDomainExperience);
      formData.set("noticePeriods", JSON.stringify(noticePeriod ? [noticePeriod] : []));
      formData.set("salaryExpectationAnnual", salaryExpectationAnnualNormalized);
      formData.set("willingToRelocate", willingToRelocate);
      formData.set("isLegallyAuthorizedToWork", isLegallyAuthorizedToWork);
      formData.set("workModePreference", workModePreference);
      formData.set("shortMotivation", shortMotivation.trim());

      const response = await fetch("/api/my-applications/applications/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: formData,
      });
      const raw = await response.text();
      let payload: { error?: { message?: string } } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as { error?: { message?: string } };
        } catch {
          payload = {};
        }
      }
      if (!response.ok) {
        throw new Error(payload.error?.message || `Unable to submit application (${response.status}).`);
      }
      router.push("/my-applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCvs) {
    return (
      <section aria-labelledby="apply-title">
        <h1 id="apply-title" className="bo-page-title">
          Apply for {jobTitle}
        </h1>
        <p className="bo-page-sub">Loading your CVs...</p>
      </section>
    );
  }

  if (!hasCv) {
    return (
      <section aria-labelledby="apply-title">
        <h1 id="apply-title" className="bo-page-title">
          Apply for {jobTitle}
        </h1>
        <p className="bo-page-sub">You need at least one CV before applying.</p>
        <article className="bo-card bo-span-12" style={{ maxWidth: "720px" }}>
          <p className="bo-page-sub" style={{ marginBottom: "0.8rem" }}>
            No CV found. Upload your CV first, then continue your application.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link
              href={`/cv-upload?returnTo=${encodeURIComponent(`/jobs/${jobSlug}/apply`)}`}
              className="btn btn-primary"
            >
              Upload CV and continue
            </Link>
            <Link href="/job-search" className="btn btn-secondary">
              Back to jobs
            </Link>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section aria-labelledby="apply-title">
      <h1 id="apply-title" className="bo-page-title">
        Apply for {jobTitle}
      </h1>
      <p className="bo-page-sub">Step {step} of 4 — CV, cover letter, questions, review and submit.</p>

      <article className="bo-card bo-span-12" style={{ maxWidth: "820px" }}>
        {step === 1 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="bo-card-title" style={{ marginBottom: 0 }}>
              Step 1: Select CV
            </h2>
            <label className="bo-label" htmlFor="apply-cv-select">
              CV
            </label>
            <select
              id="apply-cv-select"
              className="form-select"
              value={selectedCvId}
              onChange={(event) => setSelectedCvId(event.target.value)}
            >
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.originalFilename}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="bo-card-title" style={{ marginBottom: 0 }}>
              Step 2: Add Cover Letter
            </h2>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  type="radio"
                  name="cover-letter-mode"
                  checked={mode === "file"}
                  onChange={() => setMode("file")}
                />
                Upload file
              </label>
              <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  type="radio"
                  name="cover-letter-mode"
                  checked={mode === "text"}
                  onChange={() => setMode("text")}
                />
                Write text
              </label>
            </div>

            {mode === "file" ? (
              <>
                <label className="bo-label" htmlFor="apply-cover-letter-file">
                  Cover letter file (PDF/DOC/DOCX)
                </label>
                <input
                  id="apply-cover-letter-file"
                  type="file"
                  className="form-input"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setCoverLetterFile(event.target.files?.[0] ?? null)}
                />
              </>
            ) : (
              <>
                <label className="bo-label" htmlFor="apply-cover-letter-text">
                  Cover letter text
                </label>
                <textarea
                  id="apply-cover-letter-text"
                  className="form-input"
                  rows={8}
                  placeholder="Write your cover letter here..."
                  value={coverLetterText}
                  onChange={(event) => setCoverLetterText(event.target.value)}
                />
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="btn btn-primary" disabled={!hasCoverLetter} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="bo-card-title" style={{ marginBottom: 0 }}>
              Step 3: Additional Questions
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="bo-label" htmlFor="apply-exp-years">
                  Years of experience
                </label>
                <input
                  id="apply-exp-years"
                  type="number"
                  min={0}
                  className="form-input"
                  value={experienceYears}
                  onChange={(event) => setExperienceYears(event.target.value)}
                />
              </div>
              <div>
                <label className="bo-label" htmlFor="apply-exp-months">
                  Months of experience
                </label>
                <input
                  id="apply-exp-months"
                  type="number"
                  min={0}
                  max={11}
                  className="form-input"
                  value={experienceMonths}
                  onChange={(event) => setExperienceMonths(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="bo-label">Relevant domain experience</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem" }}>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="domain-experience"
                    checked={hasDomainExperience === "yes"}
                    onChange={() => setHasDomainExperience("yes")}
                  />
                  Yes
                </label>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="domain-experience"
                    checked={hasDomainExperience === "no"}
                    onChange={() => setHasDomainExperience("no")}
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="bo-label">Notice period</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.35rem" }}>
                {noticePeriodOptions.map((option) => (
                  <label key={option} className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <input
                      type="radio"
                      name="notice-period"
                      checked={noticePeriod === option}
                      onChange={() => setNoticePeriod(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="bo-label" htmlFor="apply-salary-annual">
                Salary expectation (annual)
              </label>
              <input
                id="apply-salary-annual"
                type="text"
                inputMode="numeric"
                className="form-input"
                value={salaryExpectationAnnual}
                onChange={(event) => setSalaryExpectationAnnual(formatCurrencyLikeInput(event.target.value))}
              />
            </div>

            <div>
              <label className="bo-label">Willing to relocate</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem" }}>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="relocate"
                    checked={willingToRelocate === "yes"}
                    onChange={() => setWillingToRelocate("yes")}
                  />
                  Yes
                </label>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="relocate"
                    checked={willingToRelocate === "no"}
                    onChange={() => setWillingToRelocate("no")}
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="bo-label">Are you legally authorized to work in this country?</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem" }}>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="legal-authorized-work"
                    checked={isLegallyAuthorizedToWork === "yes"}
                    onChange={() => setIsLegallyAuthorizedToWork("yes")}
                  />
                  Yes
                </label>
                <label className="bo-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="radio"
                    name="legal-authorized-work"
                    checked={isLegallyAuthorizedToWork === "no"}
                    onChange={() => setIsLegallyAuthorizedToWork("no")}
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="bo-label" htmlFor="apply-work-mode">
                Work mode preference
              </label>
              <select
                id="apply-work-mode"
                className="form-select"
                value={workModePreference}
                onChange={(event) => setWorkModePreference(event.target.value)}
              >
                <option value="">Select work mode</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="bo-label" htmlFor="apply-short-motivation">
                Short motivation (optional)
              </label>
              <textarea
                id="apply-short-motivation"
                className="form-input"
                rows={4}
                value={shortMotivation}
                onChange={(event) => setShortMotivation(event.target.value)}
                placeholder="Briefly tell us why you are interested."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canContinueToReview}
                aria-disabled={!canContinueToReview}
                style={!canContinueToReview ? { opacity: 0.55, cursor: "not-allowed", pointerEvents: "none" } : undefined}
                onClick={() => {
                  if (!canContinueToReview) {
                    setError("Please complete all required additional questions.");
                    return;
                  }
                  setError(null);
                  setStep(4);
                }}
              >
                Continue to review
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <h2 className="bo-card-title" style={{ marginBottom: 0 }}>
              Step 4: Review Application
            </h2>
            <div style={{ display: "grid", gap: "0.5rem", marginBottom: "0.9rem" }}>
              <p style={{ margin: 0 }}>
                <strong>Job:</strong> {jobTitle}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Selected CV:</strong> {selectedCv?.originalFilename ?? "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Cover letter:</strong>{" "}
                {mode === "file"
                  ? coverLetterFile?.name ?? "—"
                  : `${coverLetterText.trim().slice(0, 120)}${coverLetterText.trim().length > 120 ? "..." : ""}`}
              </p>
            </div>
            <hr style={{ border: 0, borderTop: "1px solid var(--color-border)", margin: "0 0 0.9rem" }} />
            <div style={{ display: "grid", gap: "0.65rem" }}>
              <p style={{ margin: 0 }}>
                <strong>Experience:</strong> {experienceYears || "0"} years, {experienceMonths || "0"} months
              </p>
              <p style={{ margin: 0 }}>
                <strong>Relevant domain experience:</strong> {hasDomainExperience === "yes" ? "Yes" : "No"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Notice period:</strong> {noticePeriod}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Salary expectation (annual):</strong> {salaryExpectationAnnual}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Willing to relocate:</strong> {willingToRelocate === "yes" ? "Yes" : "No"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Legally authorized to work in this country:</strong>{" "}
                {isLegallyAuthorizedToWork === "yes" ? "Yes" : "No"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Work mode preference:</strong> {workModePreference}
              </p>
            </div>
            {shortMotivation.trim() ? (
              <>
                <hr style={{ border: 0, borderTop: "1px solid var(--color-border)", margin: "0.9rem 0" }} />
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  <strong>Short motivation:</strong> {shortMotivation.trim()}
                </p>
              </>
            ) : null}

            {error ? (
              <p className="bo-page-sub" role="alert" style={{ color: "var(--color-error)", marginBottom: 0 }}>
                {error}
              </p>
            ) : null}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(3)} disabled={submitting}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Complete application"}
              </button>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
