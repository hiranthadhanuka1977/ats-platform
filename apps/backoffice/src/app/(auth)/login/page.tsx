import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginHero } from "@/components/login/LoginHero";

export const metadata: Metadata = {
  title: "Sign in — TalentHub Back Office",
  description: "Sign in to the TalentHub recruiter and admin portal.",
};

export default function LoginPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="bo-login-split">
        <LoginHero />
        <div className="bo-login-panel">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
