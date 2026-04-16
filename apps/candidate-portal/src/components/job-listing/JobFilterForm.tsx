import Link from "next/link";

export function JobFilterForm() {
  return (
    <aside className="filter-marketing-banner" aria-label="Career support">
      <p className="filter-marketing-banner__title">Get matched faster</p>
      <p className="filter-marketing-banner__text">
        Upload your resume and receive tailored job recommendations.
      </p>
      <Link href="/login" className="filter-marketing-banner__link">
        Upload resume
      </Link>
    </aside>
  );
}
