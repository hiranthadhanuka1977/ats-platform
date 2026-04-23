"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearCandidateSession, loadCandidateSession } from "@/lib/auth-storage";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const session = loadCandidateSession();
    setCandidateEmail(session?.user?.email ?? null);
  }, []);

  useEffect(() => {
    const onStorage = () => {
      const session = loadCandidateSession();
      setCandidateEmail(session?.user?.email ?? null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const profileInitials = useMemo(() => {
    if (!candidateEmail) return "U";
    const [left] = candidateEmail.split("@");
    const cleaned = left.replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.slice(0, 2).toUpperCase() || "U";
  }, [candidateEmail]);

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  function onLogout() {
    clearCandidateSession();
    setCandidateEmail(null);
    setMenuOpen(false);
    router.push("/login");
  }

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="TalentHub home">
          <span className="logo-icon" aria-hidden="true">
            T
          </span>
          TalentHub
        </Link>

        <div className="header-actions">
          {candidateEmail ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-trigger"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <span className="profile-avatar" aria-hidden="true">
                  {profileInitials}
                </span>
              </button>
              {menuOpen ? (
                <div className="profile-flyout" role="menu" aria-label="Candidate menu">
                  <p className="profile-email">{candidateEmail}</p>
                  <Link href="/dashboard" className="profile-action" role="menuitem" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button type="button" className="profile-action" role="menuitem" onClick={onLogout}>
                    Log Out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {!isLoginPage ? (
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Log In
                </Link>
              ) : null}
              {!isRegisterPage ? (
                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
