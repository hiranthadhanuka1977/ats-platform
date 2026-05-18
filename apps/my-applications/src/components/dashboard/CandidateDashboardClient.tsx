"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadCandidateSession } from "@/lib/auth-storage";
import {
  DashboardApplicationActivity,
  type DashboardApplicationActivityItem,
} from "@/components/dashboard/DashboardApplicationActivity";
import { DashboardJourneySteps, type JourneyStep } from "@/components/dashboard/DashboardJourneySteps";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
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
  hasCv: boolean;
  hasCoverLetter: boolean;
  completeProfileDone: boolean;
};

export function CandidateDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [profileProgress, setProfileProgress] = useState<ProfileProgress | null>(null);
  const [recentApplicationActivity, setRecentApplicationActivity] = useState<
    DashboardApplicationActivityItem[]
  >([]);
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

        const applicationsResponse = await fetch(
          "/api/my-applications/applications/list?limit=4&sortBy=updatedAt",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        const applicationsPayload = (await applicationsResponse.json().catch(() => ({}))) as {
          data?: DashboardApplicationActivityItem[];
        };
        if (applicationsResponse.ok && applicationsPayload.data) {
          setRecentApplicationActivity(applicationsPayload.data);
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
    const hasCv = Boolean(profileProgress?.hasCv);
    const hasCoverLetter = Boolean(profileProgress?.hasCoverLetter);
    const steps: JourneyStep[] = [
      {
        label: hasCv ? "CV on file" : "Upload your CV",
        description: "Upload at least one résumé to apply faster.",
        complete: hasCv,
        actionHref: "/cv-upload",
        actionLabel: hasCv ? "Manage CVs" : "Upload CV",
      },
      {
        label: "Complete your profile",
        description: "Add your details, experience, and education.",
        complete: profileComplete,
        actionHref: "/my-profile",
        actionLabel: profileComplete ? "View profile" : "Complete profile",
      },
      {
        label: hasCoverLetter ? "Cover letters ready" : "Add a cover letter",
        description: "Save templates you can reuse when applying.",
        complete: hasCoverLetter,
        actionHref: "/cover-letters",
        actionLabel: hasCoverLetter ? "Manage letters" : "Add cover letter",
      },
      {
        label: "Start applying",
        description: "Browse open roles and submit your first application.",
        complete: false,
        actionHref: "/job-search",
        actionLabel: "Browse jobs",
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
      <article className="bo-card bo-span-12 myapps-journey-card">
        <header className="myapps-journey-card-head">
          <div>
            <h2 className="bo-card-title">Your application journey</h2>
            <p className="bo-page-sub myapps-journey-card-intro">
              Finish each step below to get application-ready.
            </p>
          </div>
        </header>
        <DashboardJourneySteps
          steps={progressState.steps}
          completedCount={progressState.completed}
          percentage={progressState.percentage}
        />
      </article>

      <div className="bo-dash-grid" style={{ marginTop: "1rem" }}>
        <article className="bo-card bo-span-6">
          <div className="myapps-dashboard-card-head">
            <h2 className="bo-card-title" style={{ marginBottom: 0 }}>
              Applications
            </h2>
            {recentApplicationActivity.length > 0 ? (
              <Link href="/my-applications" className="myapps-dashboard-card-link">
                View all
              </Link>
            ) : null}
          </div>
          <p className="bo-page-sub myapps-dashboard-card-intro">
            Latest updates from your submitted applications.
          </p>
          <DashboardApplicationActivity items={recentApplicationActivity} />
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
