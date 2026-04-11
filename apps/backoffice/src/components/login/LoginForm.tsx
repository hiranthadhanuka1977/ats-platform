"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useId, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let json: { ok?: boolean; error?: { code?: string; message?: string } } = {};
      try {
        json = text ? (JSON.parse(text) as typeof json) : {};
      } catch {
        setError("Invalid response from server. Try again.");
        return;
      }

      if (!res.ok) {
        const code = json.error?.code;
        const msg = json.error?.message;
        if (code === "INVALID_CREDENTIALS") {
          setError("Incorrect email or password.");
        } else if (code === "DB_UNAVAILABLE") {
          setError(
            msg ??
              "Database not reachable. Add DATABASE_URL to apps/backoffice/.env.local (copy from the repo root .env)."
          );
        } else if (code === "API_UNREACHABLE" || code === "API_ERROR") {
          setError(msg ?? "Auth service unavailable.");
        } else {
          setError(msg ?? "Sign in failed. Try again.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main id="main-content" className="bo-login-panel-inner">
      <h2 id="bo-login-heading" className="bo-login-heading">
        Sign in
      </h2>
      <p className="bo-login-sub">Use your work email or continue with SSO.</p>

      {error ? (
        <p className="bo-login-error" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="bo-login-heading"
      >
        <div className="form-group">
          <label htmlFor={emailId} className="form-label">
            Email address
          </label>
          <div className="form-input-icon-wrap">
            <svg
              className="form-input-icon"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
            <input
              type="email"
              id={emailId}
              name="email"
              className="form-input form-input--icon"
              placeholder="you@company.com"
              autoComplete="email"
              required
              aria-required
              disabled={pending}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor={passwordId} className="form-label">
              Password
            </label>
            <Link href="#" className="form-link">
              Forgot password?
            </Link>
          </div>
          <div className="form-input-icon-wrap">
            <svg
              className="form-input-icon"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              id={passwordId}
              name="password"
              className="form-input form-input--icon"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              aria-required
              disabled={pending}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={pending}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        <div className="form-group form-group--inline">
          <label className="form-checkbox">
            <input type="checkbox" name="remember" value="1" disabled={pending} />
            <span className="form-checkbox-mark" aria-hidden />
            Remember me on this device
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-divider">
        <span>Or continue with</span>
      </p>

      <div className="auth-oauth" role="group" aria-label="Social sign in">
        <button type="button" className="btn-oauth" disabled>
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" className="btn-oauth" disabled>
          <LinkedInIcon />
          Continue with LinkedIn
        </button>
      </div>

      <p className="bo-login-footer">
        Protected by your organization’s access policy. Need help? Contact IT support.
      </p>
    </main>
  );
}

function EyeOpenIcon() {
  return (
    <svg className="eye-open" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg className="eye-closed" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill="#0A66C2"
      />
    </svg>
  );
}
