"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCandidateSession } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type LoginErrors = {
  email?: string;
  password?: string;
};

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="password-toggle-icon">
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.41-.59" />
        <path d="M9.9 5.2A10.75 10.75 0 0 1 12 5c5 0 9 4 10 7a11.8 11.8 0 0 1-4.1 5.2" />
        <path d="M6.1 6.1A11.8 11.8 0 0 0 2 12c1 3 5 7 10 7a10.75 10.75 0 0 0 2.1-.2" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="password-toggle-icon">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  function validate(): LoginErrors {
    const errors: LoginErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    return errors;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          audience: "candidate",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          user: { id: string; email: string; type: "candidate" };
        };
        error?: { code?: string };
      };

      if (!response.ok || !payload.data) {
        switch (payload.error?.code) {
          case "INVALID_CREDENTIALS":
            setErrorMessage("Invalid email or password.");
            break;
          case "EMAIL_NOT_VERIFIED":
            setErrorMessage("Please verify your email before logging in.");
            break;
          case "ACCOUNT_LOCKED":
            setErrorMessage("Your account is temporarily locked. Please try again later.");
            break;
          case "ACCOUNT_DISABLED":
            setErrorMessage("Your account is disabled. Contact support.");
            break;
          default:
            setErrorMessage("Unable to log in right now. Please try again.");
            break;
        }
        return;
      }

      saveCandidateSession(payload.data, rememberMe);
      router.push("/dashboard");
    } catch {
      setErrorMessage("Network error while logging in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="login-email" className="form-label">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          className={`form-input${fieldErrors.email ? " form-input--error" : ""}`}
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          required
        />
        {fieldErrors.email ? <p className="form-error">{fieldErrors.email}</p> : null}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <Link className="form-link" href="/register">
            Need an account?
          </Link>
        </div>
        <div className="form-input-icon-wrap">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            className={`form-input${fieldErrors.password ? " form-input--error" : ""}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
        {fieldErrors.password ? <p className="form-error">{fieldErrors.password}</p> : null}
      </div>

      <label className="form-checkbox">
        <input type="checkbox" name="remember" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
        <span className="form-checkbox-mark" aria-hidden="true" />
        Remember me
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
