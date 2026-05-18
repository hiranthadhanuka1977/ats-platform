"use client";

import { useState } from "react";
import { ActivitySidePanel, type ActivitySidePanelItem } from "@/components/shared/ActivitySidePanel";

const RECENT_ACTIVITY_ITEMS: ActivitySidePanelItem[] = [
  {
    id: "1",
    title: "Aarav Sharma moved to Shortlisted",
    meta: "12 minutes ago",
  },
  {
    id: "2",
    title: "New candidate profile created: Emily Davis",
    meta: "45 minutes ago",
  },
  {
    id: "3",
    title: "3 candidates without applications detected",
    meta: "Today, 09:10 AM",
  },
  {
    id: "4",
    title: "Michael Chen submitted application for Product Designer",
    meta: "Yesterday, 06:35 PM",
  },
];

export function TopBarRecentActivity() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="bo-page-actions-trigger bo-candidate-activity-trigger"
        aria-label="Open recent activity panel"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5v4l5-4-5-4v2Zm-1 5h2v5h4v2h-6V8Z"
          />
        </svg>
      </button>
      <ActivitySidePanel
        open={open}
        title="Recent Activity"
        ariaLabel="Recent Activity"
        items={RECENT_ACTIVITY_ITEMS}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
