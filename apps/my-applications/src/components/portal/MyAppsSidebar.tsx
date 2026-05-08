import type { ReactNode } from "react";
import Link from "next/link";
import { IconDashboard, IconJobs, IconUser } from "./nav-icons";

export type MyAppsNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  matchPath?: string;
  matchPrefix?: string;
  external?: boolean;
};

const jobsPortalBase = process.env.NEXT_PUBLIC_CANDIDATE_PORTAL_BASE_URL ?? "http://localhost:3000";

const items: MyAppsNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <IconDashboard />, matchPrefix: "/dashboard" },
  { href: "/my-profile", label: "My Profile", icon: <IconUser />, matchPrefix: "/my-profile" },
  { href: "/cv-upload", label: "Upload CV", icon: <IconUser />, matchPrefix: "/cv-upload" },
  {
    href: `${jobsPortalBase.replace(/\/$/, "")}/`,
    label: "Job search",
    icon: <IconJobs />,
    external: true,
  },
  { href: "#", label: "Profile", icon: <IconUser />, matchPrefix: "__never__" },
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
