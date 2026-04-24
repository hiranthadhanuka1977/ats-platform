"use client";

import { useCallback, useEffect, useRef } from "react";

/** No keyboard/mouse/scroll/etc. for this long → sign out. */
const IDLE_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

/**
 * Keeps staff JWTs fresh while the user is active (POST /api/auth/refresh),
 * and signs out after a fixed idle period (no activity events).
 */
export function StaffSessionActivity() {
  const lastActivityRef = useRef(Date.now());
  const logoutStartedRef = useRef(false);

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const onActivity = () => {
      if (document.visibilityState === "hidden") return;
      bumpActivity();
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart", "pointerdown", "wheel", "visibilitychange"];
    events.forEach((ev) => {
      window.addEventListener(ev, onActivity, { passive: true });
    });
    return () => {
      events.forEach((ev) => {
        window.removeEventListener(ev, onActivity);
      });
    };
  }, [bumpActivity]);

  useEffect(() => {
    let cancelled = false;

    async function idleLogout() {
      if (logoutStartedRef.current) return;
      logoutStartedRef.current = true;
      // Clear local auth cookies even if API routes are unavailable.
      document.cookie = "bo_access=; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "bo_refresh=; Path=/; Max-Age=0; SameSite=Lax";
      window.location.href = "/login";
    }

    const id = window.setInterval(async () => {
      if (cancelled) return;
      const now = Date.now();
      if (now - lastActivityRef.current >= IDLE_MS) {
        await idleLogout();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
