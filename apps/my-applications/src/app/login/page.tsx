import type { Metadata } from "next";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginHero } from "@/components/login/LoginHero";

export const metadata: Metadata = {
  title: "Sign in — TalentHub My Applications",
  description: "Sign in to the TalentHub candidate portal.",
};

export default function LoginPage() {
  return (
    <div className="bo-login-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="bo-login-split">
        <LoginHero />
        <div className="bo-login-panel">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
