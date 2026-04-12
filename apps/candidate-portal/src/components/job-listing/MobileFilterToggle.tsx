"use client";

import { useFilterDrawer } from "@/components/job-listing/JobListingShell";

export function MobileFilterToggle() {
  const { open, onOpen } = useFilterDrawer();
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm filter-toggle-mobile"
      id="filterToggle"
      aria-expanded={open}
      aria-controls="filterPanel"
      onClick={onOpen}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="12" y1="18" x2="20" y2="18" />
        <circle cx="6" cy="12" r="2" fill="currentColor" />
        <circle cx="10" cy="18" r="2" fill="currentColor" />
      </svg>
      Filters
    </button>
  );
}
