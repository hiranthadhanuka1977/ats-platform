"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const TEXT_SIZES = [87.5, 100, 112.5, 125, 137.5];
const DEFAULT_INDEX = 1;

function readStoredTextSizeIndex(): number {
  if (typeof window === "undefined") return DEFAULT_INDEX;
  try {
    const raw = sessionStorage.getItem("cp-text-size-index");
    if (raw == null) return DEFAULT_INDEX;
    const i = parseInt(raw, 10);
    if (!Number.isNaN(i) && i >= 0 && i < TEXT_SIZES.length) return i;
  } catch {
    /* ignore */
  }
  return DEFAULT_INDEX;
}

export function SiteHeader() {
  const pathname = usePathname();
  const jobsLanding = pathname === "/" || pathname === "";
  const [navOpen, setNavOpen] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(readStoredTextSizeIndex);

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZES[sizeIndex]}%`;
    try {
      sessionStorage.setItem("cp-text-size-index", String(sizeIndex));
    } catch {
      /* ignore */
    }
  }, [sizeIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && navOpen) {
        setNavOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const resize = useCallback((action: "decrease" | "reset" | "increase") => {
    setSizeIndex((i) => {
      if (action === "reset") return DEFAULT_INDEX;
      if (action === "increase") return Math.min(i + 1, TEXT_SIZES.length - 1);
      return Math.max(i - 1, 0);
    });
  }, []);

  return (
    <header className={`site-header${navOpen ? " nav-open" : ""}`} role="banner">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="TalentHub home">
          <span className="logo-icon" aria-hidden="true">
            T
          </span>
          TalentHub
        </Link>

        <nav className={`main-nav${navOpen ? " is-open" : ""}`} aria-label="Primary navigation">
          <Link href="/" aria-current={jobsLanding ? "page" : undefined}>
            Jobs
          </Link>
          <a href="#">About Us</a>
          <a href="#">Culture</a>
          <a href="#">Contact</a>
        </nav>

        <div className="header-actions">
          <div className="text-resizer" role="group" aria-label="Text size">
            <button
              type="button"
              className={`text-resizer-btn${sizeIndex < DEFAULT_INDEX ? " is-active" : ""}`}
              aria-label="Decrease text size"
              onClick={() => resize("decrease")}
            >
              A−
            </button>
            <button
              type="button"
              className={`text-resizer-btn${sizeIndex === DEFAULT_INDEX ? " is-active" : ""}`}
              aria-label="Reset text size"
              onClick={() => resize("reset")}
            >
              A
            </button>
            <button
              type="button"
              className={`text-resizer-btn${sizeIndex > DEFAULT_INDEX ? " is-active" : ""}`}
              aria-label="Increase text size"
              onClick={() => resize("increase")}
            >
              A+
            </button>
          </div>
          <a href="/login" className="btn btn-ghost btn-sm">
            Log In
          </a>
          <a href="/register" className="btn btn-primary btn-sm">
            Register
          </a>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
