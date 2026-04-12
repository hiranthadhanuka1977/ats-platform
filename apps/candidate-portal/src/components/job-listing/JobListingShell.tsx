"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type DrawerCtx = { open: boolean; onOpen: () => void };

const FilterDrawerContext = createContext<DrawerCtx>({ open: false, onOpen: () => {} });

export function useFilterDrawer() {
  return useContext(FilterDrawerContext);
}

type Props = {
  filterForm: React.ReactNode;
  children: React.ReactNode;
};

export function JobListingShell({ filterForm, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const close = useCallback(() => setDrawerOpen(false), []);
  const open = useCallback(() => setDrawerOpen(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, close]);

  return (
    <FilterDrawerContext.Provider value={{ open: drawerOpen, onOpen: open }}>
      <div
        className={`filter-overlay${drawerOpen ? " is-visible" : ""}`}
        id="filterOverlay"
        aria-hidden={!drawerOpen}
        onClick={close}
        role="presentation"
      />

      <div className="container content-layout">
        <aside
          className={`filter-panel${drawerOpen ? " is-open" : ""}`}
          id="filterPanel"
          aria-label="Job filters"
        >
          <button type="button" className="filter-drawer-close" id="filterClose" aria-label="Close filters" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {filterForm}
        </aside>

        <section className="job-listings" aria-label="Job listings">
          {children}
        </section>
      </div>
    </FilterDrawerContext.Provider>
  );
}
