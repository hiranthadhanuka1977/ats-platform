"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCandidateSession } from "@/lib/auth-storage";
import { ProfileTextImportPrototype } from "@/components/dashboard/ProfileTextImportPrototype";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type CandidateProfile = {
  id: string;
  type: "candidate";
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export function DashboardPrototypeToolsClient() {
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
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const payload = (await response.json().catch(() => ({}))) as { data?: CandidateProfile };
        if (!response.ok || !payload.data || payload.data.type !== "candidate") {
          router.replace("/login");
          return;
        }
        setProfile(payload.data);
      } catch {
        setError("Unable to load prototype tools right now.");
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

  if (loading) return <p className="bo-page-sub">Loading profile tools…</p>;
  if (error) return <p className="bo-login-error" role="alert">{error}</p>;
  if (!profile) return null;

  return (
    <section aria-labelledby="my-profile-title">
      <h1 id="my-profile-title" className="bo-page-title">
        My Profile
      </h1>
      <p className="bo-page-sub">Complete your profile details using LinkedIn text parsing here, {displayName}.</p>

      {accessToken ? (
        <ProfileTextImportPrototype accessToken={accessToken} defaultEmail={profile.email} defaultFullName={displayName} />
      ) : null}
    </section>
  );
}
