import type { ReactNode } from "react";
import Link from "next/link";
import { IconApplications, IconDashboard, IconJobs, IconUser } from "./nav-icons";

export type MyAppsNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  matchPath?: string;
  matchPrefix?: string;
  external?: boolean;
};

const items: MyAppsNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <IconDashboard />, matchPrefix: "/dashboard" },
  { href: "/my-applications", label: "My Applications", icon: <IconApplications />, matchPrefix: "/my-applications" },
  { href: "/my-profile", label: "My Profile", icon: <IconUser />, matchPrefix: "/my-profile" },
  { href: "/cv-upload", label: "Upload CV", icon: <IconApplications />, matchPrefix: "/cv-upload" },
  { href: "/cover-letters", label: "Cover Letters", icon: <IconApplications />, matchPrefix: "/cover-letters" },
  {
    href: "/job-search",
    label: "Job search",
    icon: <IconJobs />,
    /* /job-search and /jobs/... detail */
    matchPrefix: "/job",
  },
];

type MyAppsSidebarProps = {
  currentPath?: string;
};

export function MyAppsSidebar({ currentPath = "/" }: MyAppsSidebarProps) {
  return (
    <aside className="bo-sidebar" id="boSidebar" aria-label="Main navigation">
      <div className="bo-sidebar-brand">
        <span className="bo-sidebar-logo" aria-hidden>
          T
        </span>
        <div className="bo-sidebar-product">
          TalentHub
          <span>My Applications</span>
        </div>
      </div>
      <nav className="bo-nav" aria-label="Primary">
        <ul>
          {items.map((item) => {
            const isCurrent = item.external
              ? false
              : item.matchPrefix && item.matchPrefix !== "__never__"
                ? currentPath === item.matchPrefix || currentPath.startsWith(`${item.matchPrefix}/`)
                : item.matchPath !== undefined && currentPath === item.matchPath;
            const link = item.external ? (
              <a href={item.href} rel="noopener noreferrer" target="_blank">
                {item.icon}
                {item.label}
              </a>
            ) : (
              <Link href={item.href} aria-current={isCurrent ? "page" : undefined}>
                {item.icon}
                {item.label}
              </Link>
            );
            return <li key={item.label}>{link}</li>;
          })}
        </ul>
      </nav>
    </aside>
  );
}
