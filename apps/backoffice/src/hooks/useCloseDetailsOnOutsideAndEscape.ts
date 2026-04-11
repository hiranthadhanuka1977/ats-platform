"use client";

import { type RefObject, useEffect } from "react";

/** Closes a native details element on outside pointer or Escape (details does not do this by default). */
export function useCloseDetailsOnOutsideAndEscape(detailsRef: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = detailsRef.current;
      if (!el?.open) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      el.open = false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const el = detailsRef.current;
      if (!el?.open) return;
      el.open = false;
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [detailsRef]);
}
