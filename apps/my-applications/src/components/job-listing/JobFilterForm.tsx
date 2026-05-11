import Link from "next/link";

export function JobFilterForm() {
  return (
    <aside className="filter-marketing-banner filter-marketing-banner--matched" aria-label="Career support">
      <p className="filter-marketing-banner__title">Get matched faster</p>
      <p className="filter-marketing-banner__text">
        Upload your CV and keep your profile up to date so you can apply quickly.
      </p>
      <Link href="/cv-upload" className="filter-marketing-banner__link">
        Manage CVs
      </Link>
    </aside>
  );
}
