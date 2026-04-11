"use client";

import { useCallback, useEffect, useRef } from "react";

/** No keyboard/mouse/scroll/etc. for this long → sign out. */
const IDLE_MS = 5 * 60 * 1000;
/** Renew access token before 15m expiry while the user is still active. */
const REFRESH_MS = 7 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

/**
 * Keeps staff JWTs fresh while the user is active (POST /api/auth/refresh),
 * and signs out after a fixed idle period (no activity events).
 */
export function StaffSessionActivity() {
  const lastActivityRef = useRef(Date.now());
  const lastRefreshRef = useRef(Date.now());
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

    async function refreshSession(): Promise<boolean> {
      const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!res.ok) return false;
      lastRefreshRef.current = Date.now();
      return true;
    }

    async function idleLogout() {
      if (logoutStartedRef.current) return;
      logoutStartedRef.current = true;
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      window.location.href = "/login";
    }

    void (async () => {
      const ok = await refreshSession();
      if (cancelled) return;
      if (!ok) {
        window.location.href = "/login";
      }
    })();

    const id = window.setInterval(async () => {
      if (cancelled) return;
      const now = Date.now();
      if (now - lastActivityRef.current >= IDLE_MS) {
        await idleLogout();
        return;
      }
      if (now - lastRefreshRef.current >= REFRESH_MS) {
        const ok = await refreshSession();
        if (!ok) {
          window.location.href = "/login";
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
