"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadCandidateSession } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const JOBS_PORTAL_BASE_URL = process.env.NEXT_PUBLIC_CANDIDATE_PORTAL_BASE_URL ?? "http://localhost:3000";

type CandidateProfile = {
  id: string;
  type: "candidate";
  email: string;
  firstName: string | null;
  lastName: string | null;
};

type ProfileProgress = {
  basicProfileComplete: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  completeProfileDone: boolean;
};

export function CandidateDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [profileProgress, setProfileProgress] = useState<ProfileProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      router.replace("/login");
      return;
    }

    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        const payload = (await response.json().catch(() => ({}))) as { data?: CandidateProfile };
        if (!response.ok || !payload.data || payload.data.type !== "candidate") {
          router.replace("/login");
          return;
        }
        setProfile(payload.data);

        const progressResponse = await fetch("/api/my-applications/profile/progress", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        const progressPayload = (await progressResponse.json().catch(() => ({}))) as { data?: ProfileProgress };
        if (progressResponse.ok && progressPayload.data) {
          setProfileProgress(progressPayload.data);
        }
      } catch {
        setError("Unable to load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [router]);

  const displayName = useMemo(() => {
    if (!profile) return "Candidate";
    const full = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
    return full || profile.email;
  }, [profile]);

  const progressState = useMemo(() => {
    const profileComplete = Boolean(profileProgress?.completeProfileDone);
    const steps = [
      { label: "Completing Profile", complete: profileComplete, actionHref: "/my-profile", actionLabel: "Complete profile" },
      { label: "Upload CV", complete: false, actionHref: "/my-profile", actionLabel: "Upload CV" },
      { label: "Adding Cover Letter", complete: false, actionHref: "/dashboard", actionLabel: "Add cover letter" },
      {
        label: "Start Applying",
        complete: false,
        actionHref: `${JOBS_PORTAL_BASE_URL.replace(/\/$/, "")}/`,
        actionLabel: "Browse jobs",
        external: true,
      },
    ];
    const completed = steps.filter((s) => s.complete).length;
    return { steps, completed, percentage: Math.round((completed / steps.length) * 100) };
  }, [profileProgress]);

  if (loading) {
    return <p className="bo-page-sub">Loading your dashboard…</p>;
  }
  if (error) {
    return <p className="bo-login-error" role="alert">{error}</p>;
  }
  if (!profile) {
    return null;
  }

  return (
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="bo-page-title">
        Welcome, {displayName}
      </h1>
      <p className="bo-page-sub">You are signed in as {profile.email}.</p>
      <article className="bo-card bo-span-12">
        <h2 className="bo-card-title">Your application journey</h2>
        <p className="bo-page-sub myapps-journey-path">
          Complete Profile → Upload CV → Add Cover Letter → Browse Jobs → Apply
        </p>
        <div className="myapps-progress-wrap" aria-label="Onboarding progress">
          <div className="myapps-progress-bar-bg">
            <div className="myapps-progress-bar-fill" style={{ width: `${progressState.percentage}%` }} />
          </div>
          <p className="bo-page-sub myapps-progress-copy">
            {progressState.completed} of {progressState.steps.length} completed ({progressState.percentage}%)
          </p>
        </div>
        <div className="myapps-steps-grid">
          {progressState.steps.map((step) => (
            <article key={step.label} className={`myapps-step-card ${step.complete ? "is-complete" : "is-pending"}`}>
              <div className="myapps-step-top">
                <span className={`myapps-step-badge ${step.complete ? "done" : "todo"}`}>{step.complete ? "Done" : "To-do"}</span>
              </div>
              <h3 className="bo-card-title myapps-step-title">
                {step.label}
              </h3>
              <p className="bo-page-sub myapps-step-status">
                {step.complete ? "Completed" : "Pending"}
              </p>
              {step.external ? (
                <a className="btn btn-secondary btn-sm myapps-step-btn" href={step.actionHref} target="_blank" rel="noopener noreferrer">
                  {step.actionLabel}
                </a>
              ) : (
                <Link className="btn btn-secondary btn-sm myapps-step-btn" href={step.actionHref}>
                  {step.actionLabel}
                </Link>
              )}
            </article>
          ))}
        </div>
      </article>

      <div className="bo-dash-grid" style={{ marginTop: "1rem" }}>
        <article className="bo-card bo-span-6">
          <h2 className="bo-card-title">Applications</h2>
          <p className="bo-page-sub" style={{ marginBottom: 0 }}>
            Track submitted jobs, interview steps, and status updates.
          </p>
        </article>
        <article className="bo-card bo-span-6">
          <h2 className="bo-card-title">Saved jobs</h2>
          <p className="bo-page-sub" style={{ marginBottom: 0 }}>
            Review bookmarked roles from the job portal and apply when you are ready.
          </p>
        </article>
      </div>
    </section>
  );
}
