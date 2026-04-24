"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterState = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};
type RegisterField = keyof RegisterState;
type FieldErrors = Partial<Record<RegisterField | "terms" | "otp", string>>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
type RegisterStep = "details" | "otp";

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

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterState>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<RegisterStep>("details");
  const [otp, setOtp] = useState("");
  const [resendInSec, setResendInSec] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordMismatch = useMemo(
    () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword,
    [form.confirmPassword, form.password]
  );

  function updateField<K extends keyof RegisterState>(key: K, value: RegisterState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateRegisterDetails(): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else {
      const strong =
        form.password.length >= 8 &&
        /[A-Z]/.test(form.password) &&
        /[a-z]/.test(form.password) &&
        /\d/.test(form.password);
      if (!strong) {
        errors.password = "Use 8+ chars with uppercase, lowercase, and a number.";
      }
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeToTerms) {
      errors.terms = "Please agree to the Terms of Service and Privacy Policy.";
    }

    return errors;
  }

  useEffect(() => {
    if (resendInSec <= 0) return;
    const timer = window.setInterval(() => {
      setResendInSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendInSec]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationErrors = validateRegisterDetails();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: { message?: string };
        error?: { code?: string };
      };

      if (!response.ok) {
        if (payload.error?.code === "EMAIL_ALREADY_EXISTS") {
          setError("An account with this email already exists.");
        } else if (payload.error?.code === "VALIDATION_ERROR") {
          setError("Please check your details and password requirements.");
        } else if (payload.error?.code === "EMAIL_SEND_FAILED") {
          setError("We could not send the OTP email right now. Please try again.");
        } else {
          setError("Unable to register right now. Please try again.");
        }
        return;
      }

      setStep("otp");
      setOtp("");
      setResendInSec(60);
      setSuccess(payload.data?.message ?? "A 6-digit OTP has been sent to your email.");
    } catch {
      setError("Network error while creating your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      setFieldErrors((prev) => ({ ...prev, otp: "Please enter a valid 6-digit OTP." }));
      setError("Please enter the 6-digit OTP from your email.");
      return;
    }
    setFieldErrors((prev) => {
      if (!prev.otp) return prev;
      const next = { ...prev };
      delete next.otp;
      return next;
    });

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: otp.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: { message?: string };
        error?: { code?: string };
      };

      if (!response.ok) {
        if (payload.error?.code === "INVALID_OR_EXPIRED_TOKEN") {
          setFieldErrors((prev) => ({ ...prev, otp: "Invalid or expired OTP." }));
          setError("Invalid or expired OTP. Please register again to receive a new code.");
        } else if (payload.error?.code === "VALIDATION_ERROR") {
          setError("Please enter a valid 6-digit OTP.");
        } else {
          setError("Unable to verify OTP right now. Please try again.");
        }
        return;
      }

      setSuccess(payload.data?.message ?? "Email verified successfully.");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Network error while verifying OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onResendOtp() {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        data?: { message?: string; retryAfterSec?: number };
        error?: { code?: string };
      };

      if (!response.ok) {
        if (payload.error?.code === "RATE_LIMITED") {
          const retryAfter = Math.max(1, Number(payload.data?.retryAfterSec ?? 60));
          setResendInSec(retryAfter);
          setError(`Please wait ${retryAfter}s before requesting another OTP.`);
        } else if (payload.error?.code === "EMAIL_SEND_FAILED") {
          setError("We could not resend OTP right now. Please try again.");
        } else {
          setError("Unable to resend OTP right now. Please try again.");
        }
        return;
      }

      setResendInSec(60);
      setSuccess(payload.data?.message ?? "A new OTP has been sent to your email.");
    } catch {
      setError("Network error while resending OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <form className="auth-form" onSubmit={onVerifyOtp} noValidate>
        <div className="form-group">
          <label htmlFor="register-otp" className="form-label">
            Enter OTP
          </label>
          <p className="auth-subtext">A 6-digit verification code was sent to {form.email}.</p>
          <input
            id="register-otp"
            type="text"
            name="otp"
            className={`form-input${fieldErrors.otp ? " form-input--error" : ""}`}
            value={otp}
            onChange={(event) => {
              const next = event.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(next);
              setFieldErrors((prev) => {
                if (!prev.otp) return prev;
                const copy = { ...prev };
                delete copy.otp;
                return copy;
              });
            }}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          {fieldErrors.otp ? <p className="form-error">{fieldErrors.otp}</p> : null}
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Verifying..." : "Verify OTP"}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={onResendOtp} disabled={submitting || resendInSec > 0}>
          {resendInSec > 0 ? `Resend OTP in ${resendInSec}s` : "Resend OTP"}
        </button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="register-first-name" className="form-label">
          First name
        </label>
        <input
          id="register-first-name"
          type="text"
          name="firstName"
          className={`form-input${fieldErrors.firstName ? " form-input--error" : ""}`}
          value={form.firstName}
          onChange={(event) => updateField("firstName", event.target.value)}
          placeholder="Jane"
          autoComplete="given-name"
        />
        {fieldErrors.firstName ? <p className="form-error">{fieldErrors.firstName}</p> : null}
      </div>

      <div className="form-group">
        <label htmlFor="register-last-name" className="form-label">
          Last name
        </label>
        <input
          id="register-last-name"
          type="text"
          name="lastName"
          className={`form-input${fieldErrors.lastName ? " form-input--error" : ""}`}
          value={form.lastName}
          onChange={(event) => updateField("lastName", event.target.value)}
          placeholder="Doe"
          autoComplete="family-name"
        />
        {fieldErrors.lastName ? <p className="form-error">{fieldErrors.lastName}</p> : null}
      </div>

      <div className="form-group">
        <label htmlFor="register-email" className="form-label">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          name="email"
          className={`form-input${fieldErrors.email ? " form-input--error" : ""}`}
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {fieldErrors.email ? <p className="form-error">{fieldErrors.email}</p> : null}
      </div>

      <div className="form-group">
        <label htmlFor="register-password" className="form-label">
          Password
        </label>
        <div className="form-input-icon-wrap">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            name="password"
            className={`form-input${fieldErrors.password || passwordMismatch ? " form-input--error" : ""}`}
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Minimum 8 chars, upper/lowercase and number"
            autoComplete="new-password"
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

      <div className="form-group">
        <label htmlFor="register-confirm-password" className="form-label">
          Confirm password
        </label>
        <div className="form-input-icon-wrap">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            className={`form-input${fieldErrors.confirmPassword || passwordMismatch ? " form-input--error" : ""}`}
            value={form.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            aria-pressed={showConfirmPassword}
          >
            <EyeIcon visible={showConfirmPassword} />
          </button>
        </div>
        {fieldErrors.confirmPassword ? <p className="form-error">{fieldErrors.confirmPassword}</p> : null}
      </div>

      <label className="form-checkbox">
        <input
          type="checkbox"
          name="terms"
          checked={agreeToTerms}
          onChange={(event) => {
            setAgreeToTerms(event.target.checked);
            setFieldErrors((prev) => {
              if (!prev.terms) return prev;
              const copy = { ...prev };
              delete copy.terms;
              return copy;
            });
          }}
        />
        <span className="form-checkbox-mark" aria-hidden="true" />I agree to the Terms of Service and Privacy Policy
      </label>
      {fieldErrors.terms ? <p className="form-error">{fieldErrors.terms}</p> : null}

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Sending OTP..." : "Register"}
      </button>
    </form>
  );
}
