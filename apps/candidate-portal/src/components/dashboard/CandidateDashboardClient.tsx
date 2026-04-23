"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCandidateSession } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type CandidateProfile = {
  id: string;
  type: "candidate";
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export function CandidateDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
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

  if (loading) {
    return <p className="dashboard-muted">Loading your dashboard...</p>;
  }
  if (error) {
    return <p className="form-error">{error}</p>;
  }
  if (!profile) {
    return null;
  }

  return (
    <section className="dashboard-card" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="dashboard-title">
        Welcome, {displayName}
      </h1>
      <p className="dashboard-muted">You are logged in as {profile.email}.</p>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <h2 className="dashboard-panel-title">Applications</h2>
          <p className="dashboard-muted">Track submitted jobs, interview steps, and status updates.</p>
        </article>
        <article className="dashboard-panel">
          <h2 className="dashboard-panel-title">Saved Jobs</h2>
          <p className="dashboard-muted">Review your bookmarked roles and apply when ready.</p>
        </article>
      </div>
    </section>
  );
}
