"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCandidateSession } from "@/lib/auth-storage";
import { CvImportPrototype } from "@/components/dashboard/CvImportPrototype";

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
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const session = loadCandidateSession();
    if (!session?.accessToken) {
      router.replace("/login");
      return;
    }
    setAccessToken(session.accessToken);

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

      {accessToken ? <CvImportPrototype accessToken={accessToken} /> : null}

      <div className="bo-dash-grid">
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
