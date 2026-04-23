"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CandidateSearchBox, type CandidateSearchItem } from "@/components/candidates/CandidateSearchBox";

type CandidatesHeaderProps = {
  activeTab: "summary" | "all";
  searchCandidates: CandidateSearchItem[];
};

export function CandidatesHeader({ activeTab, searchCandidates }: CandidatesHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentActivityOpen, setRecentActivityOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setRecentActivityOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <>
      <div className="bo-page-header-actions">
        <h1 className="bo-page-title">Candidates</h1>
        <CandidateSearchBox candidates={searchCandidates} compact />
        {activeTab === "all" ? (
          <div className="bo-page-actions-menu bo-candidate-actions-menu" ref={menuRef}>
            <button
              type="button"
              className="bo-page-actions-trigger"
              aria-label="Candidate quick actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
            </button>
            {menuOpen ? (
              <div className="bo-page-actions-dropdown bo-candidate-actions-dropdown">
                <ul>
                  <li>
                    <button type="button" className="bo-candidate-menu-item">
                      <span className="bo-candidate-menu-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V5Zm0 4h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm4 3v2h10v-2H7Z" />
                        </svg>
                      </span>
                      All Candidates
                    </button>
                  </li>
                  <li>
                    <button type="button" className="bo-candidate-menu-item">
                      <span className="bo-candidate-menu-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 4a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 6Zm2 12h-4v-1h1v-4h-1v-1h3v5h1v1Z" />
                        </svg>
                      </span>
                      Without Applications
                    </button>
                  </li>
                  <li>
                    <button type="button" className="bo-candidate-menu-item">
                      <span className="bo-candidate-menu-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4L9 16.2Z" />
                        </svg>
                      </span>
                      Shortlisted
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="bo-page-actions-trigger bo-candidate-activity-trigger"
          aria-label="Open recent activity panel"
          aria-expanded={recentActivityOpen}
          onClick={() => setRecentActivityOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5v4l5-4-5-4v2Zm-1 5h2v5h4v2h-6V8Z"
            />
          </svg>
        </button>
      </div>

      <p className="bo-page-sub">Static candidate dashboard preview for the backoffice portal.</p>

      <div className="bo-candidate-tabs" role="tablist" aria-label="Candidates views">
        <Link href="/candidates" className={`bo-candidate-tab${activeTab === "summary" ? " is-active" : ""}`} aria-current={activeTab === "summary" ? "page" : undefined}>
          <span className="bo-candidate-tab-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4 19h16v2H4v-2Zm1-2h2V9H5v8Zm6 0h2V3h-2v14Zm6 0h2v-5h-2v5Z" />
            </svg>
          </span>
          Summary
        </Link>
        <Link href="/candidates/all" className={`bo-candidate-tab${activeTab === "all" ? " is-active" : ""}`} aria-current={activeTab === "all" ? "page" : undefined}>
          <span className="bo-candidate-tab-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 11c1.66 0 2.99-1.57 2.99-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11ZM8 11c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4Zm8 0c-.29 0-.62.02-.97.05 1.33.97 2.97 2.44 2.97 3.95v3h6v-3c0-2.66-5.33-4-8-4Z" />
            </svg>
          </span>
          All Candidates
        </Link>
      </div>

      {recentActivityOpen ? (
        <div className="bo-candidate-activity-overlay" onClick={() => setRecentActivityOpen(false)}>
          <aside
            className="bo-candidate-activity-panel"
            aria-label="Recent Activity"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bo-candidate-activity-head">
              <h2 className="bo-candidate-activity-title">Recent Activity</h2>
              <button
                type="button"
                className="bo-candidate-activity-close"
                aria-label="Close recent activity panel"
                onClick={() => setRecentActivityOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="m18.3 5.71-1.41-1.42L12 9.17 7.11 4.29 5.7 5.71 10.59 10.6 5.7 15.49l1.41 1.42L12 12l4.89 4.91 1.41-1.42-4.88-4.89 4.88-4.89Z" />
                </svg>
              </button>
            </div>
            <ul className="bo-candidate-activity-list">
              <li>
                <p className="bo-candidate-activity-item-title">Aarav Sharma moved to Shortlisted</p>
                <p className="bo-candidate-activity-item-meta">12 minutes ago</p>
              </li>
              <li>
                <p className="bo-candidate-activity-item-title">New candidate profile created: Emily Davis</p>
                <p className="bo-candidate-activity-item-meta">45 minutes ago</p>
              </li>
              <li>
                <p className="bo-candidate-activity-item-title">3 candidates without applications detected</p>
                <p className="bo-candidate-activity-item-meta">Today, 09:10 AM</p>
              </li>
              <li>
                <p className="bo-candidate-activity-item-title">Michael Chen submitted application for Product Designer</p>
                <p className="bo-candidate-activity-item-meta">Yesterday, 06:35 PM</p>
              </li>
            </ul>
          </aside>
        </div>
      ) : null}
    </>
  );
}
