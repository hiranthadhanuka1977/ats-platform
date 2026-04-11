import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconAdministration,
  IconApplications,
  IconCandidates,
  IconDashboard,
  IconInterviews,
  IconJobs,
  IconReports,
  IconSettings,
} from "./nav-icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  /** Exact path match (e.g. dashboard home). */
  matchPath?: string;
  /** Highlight when current path starts with this prefix. */
  matchPrefix?: string;
};

const items: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <IconDashboard />, matchPath: "/" },
  {
    href: "/applications",
    label: "Applications",
    icon: <IconApplications />,
    matchPrefix: "/applications",
  },
  {
    href: "/interviews",
    label: "Interviews",
    icon: <IconInterviews />,
    matchPrefix: "/interviews",
  },
  { href: "/jobs", label: "Jobs", icon: <IconJobs />, matchPrefix: "/jobs" },
  {
    href: "/candidates",
    label: "Candidates",
    icon: <IconCandidates />,
    matchPrefix: "/candidates",
  },
  { href: "/reports", label: "Reports", icon: <IconReports />, matchPrefix: "/reports" },
  {
    href: "/administration",
    label: "Administration",
    icon: <IconAdministration />,
    matchPrefix: "/administration",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <IconSettings />,
    matchPrefix: "/settings",
  },
];

type SidebarProps = {
  currentPath?: string;
};

export function Sidebar({ currentPath = "/" }: SidebarProps) {
  return (
    <aside className="bo-sidebar" id="boSidebar" aria-label="Main navigation">
      <div className="bo-sidebar-brand">
        <span className="bo-sidebar-logo" aria-hidden>
          T
        </span>
        <div className="bo-sidebar-product">
          TalentHub
          <span>Back Office</span>
        </div>
      </div>
      <nav className="bo-nav" aria-label="Primary">
        <ul>
          {items.map((item) => {
            const isCurrent = item.matchPrefix
              ? currentPath === item.matchPrefix || currentPath.startsWith(`${item.matchPrefix}/`)
              : item.matchPath !== undefined && currentPath === item.matchPath;
            return (
              <li key={item.label}>
                <Link href={item.href} aria-current={isCurrent ? "page" : undefined}>
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
