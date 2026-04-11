"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Mobile sidebar: toggles `body.bo-nav-open` to match static backoffice.css behavior.
 */
export function useMobileNav() {
  const [open, setOpen] = useState(false);

  const closeNav = useCallback(() => setOpen(false), []);
  const toggleNav = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (open) {
      document.body.classList.add("bo-nav-open");
    } else {
      document.body.classList.remove("bo-nav-open");
    }
    return () => {
      document.body.classList.remove("bo-nav-open");
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, toggleNav, closeNav };
}
