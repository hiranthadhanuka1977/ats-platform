import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register | TalentHub",
  description: "Create your TalentHub account to apply for jobs and track your applications.",
};

export default function RegisterPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="auth-page">
        <div className="auth-wrapper">
          <section className="auth-card" aria-labelledby="register-heading">
            <div className="auth-brand" aria-hidden="true">
              <span className="logo-icon logo-icon--lg">T</span>
            </div>

            <h1 id="register-heading" className="auth-heading">
              Create your account
            </h1>
            <p className="auth-subheading">Register to save jobs, apply faster, and manage your applications.</p>

            <div className="auth-oauth" aria-label="Register with a provider">
              <button type="button" className="btn-oauth" aria-label="Continue with Google">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1H12v2.98h5.38c-.23 1.46-1.55 4.28-5.38 4.28a5.99 5.99 0 0 1 0-11.98c2.18 0 3.64.93 4.48 1.73l2.46-2.38C17.38 4.28 15 3.3 12 3.3a8.7 8.7 0 1 0 0 17.4c5.02 0 8.35-3.53 8.35-8.5 0-.57-.06-.99-.15-1.4Z"
                  />
                </svg>
                Continue with Google
              </button>

              <button type="button" className="btn-oauth" aria-label="Continue with LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8h4V23h-4V8Zm7 0h3.84v2.05h.05c.54-1.01 1.85-2.08 3.81-2.08C19.28 7.97 21 10.3 21 14.14V23h-4v-7.8c0-1.86-.03-4.25-2.59-4.25-2.59 0-2.99 2.02-2.99 4.12V23h-4V8Z"
                  />
                </svg>
                Continue with LinkedIn
              </button>
            </div>

            <div className="auth-divider" role="separator" aria-label="or">
              or
            </div>

            <RegisterForm />

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link href="/login" className="auth-footer-link">
                Log in
              </Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
