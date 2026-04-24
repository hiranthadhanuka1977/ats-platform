import Link from "next/link";
const MY_APPLICATIONS_BASE_URL = process.env.NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL ?? "http://localhost:3002";

export function SiteHeader() {
  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="TalentHub home">
          <span className="logo-icon" aria-hidden="true">
            T
          </span>
          TalentHub
        </Link>

        <div className="header-actions">
          <a href={`${MY_APPLICATIONS_BASE_URL}/login`} className="btn btn-primary btn-sm">
            Candidate Login
          </a>
        </div>
      </div>
    </header>
  );
}
