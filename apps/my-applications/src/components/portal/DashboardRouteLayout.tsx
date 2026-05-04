"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCandidateSession, type CandidateAuthSession } from "@/lib/auth-storage";
import { getAvatarInitials } from "@/lib/avatar-initials";
import { MyAppsShell } from "./MyAppsShell";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type DashboardRouteLayoutProps = {
  children: ReactNode;
};

export function DashboardRouteLayout({ children }: DashboardRouteLayoutProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<CandidateAuthSession | null>(null);
  const [headerName, setHeaderName] = useState("");
  const [headerEmail, setHeaderEmail] = useState("");

  useEffect(() => {
    const s = loadCandidateSession();
    if (!s?.accessToken) {
      router.replace("/login");
      return;
    }
    setSession(s);
    const email = s.user.email;
    setHeaderEmail(email);
    setHeaderName(email.split("@")[0] ?? "Candidate");
    setReady(true);

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${s.accessToken}` },
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: { type?: string; email?: string; firstName?: string | null; lastName?: string | null };
        };
        if (response.ok && payload.data?.type === "candidate") {
          const full = `${payload.data.firstName ?? ""} ${payload.data.lastName ?? ""}`.trim();
          setHeaderName(full || payload.data.email || email.split("@")[0] || "Candidate");
          if (payload.data.email) setHeaderEmail(payload.data.email);
        }
      } catch {
        /* keep session-based header */
      }
    })();
  }, [router]);

  if (!ready || !session) {
    return (
      <div className="bo-app" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--color-text-secondary, #64748b)" }}>Loading…</p>
      </div>
    );
  }

  const userDisplay = {
    userName: headerName,
    userRole: "Candidate",
    avatarInitials: getAvatarInitials(headerName, headerEmail),
  };

  return <MyAppsShell userDisplay={userDisplay}>{children}</MyAppsShell>;
}
