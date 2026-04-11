"use client";

import type { HeaderUserDisplay } from "./header-user-display";
import { IconMenu } from "./nav-icons";
import { UserMenu } from "./UserMenu";

type TopBarProps = {
  expanded: boolean;
  onToggle: () => void;
  orgName?: string;
  orgBadge?: string;
  userDisplay: HeaderUserDisplay;
};

export function TopBar({
  expanded,
  onToggle,
  orgName = "Northwind Talent Co.",
  orgBadge = "Enterprise",
  userDisplay,
}: TopBarProps) {
  return (
    <header className="bo-topbar" role="banner">
      <div className="bo-topbar-left">
        <button
          type="button"
          className="bo-sidebar-toggle"
          id="boSidebarToggle"
          aria-expanded={expanded}
          aria-controls="boSidebar"
          aria-label={expanded ? "Close navigation menu" : "Open navigation menu"}
          onClick={onToggle}
        >
          <IconMenu />
        </button>
        <div role="group" aria-label="Current organization">
          <span className="bo-org-name">{orgName}</span>
          <span className="bo-org-badge">{orgBadge}</span>
        </div>
      </div>
      <UserMenu
        userName={userDisplay.userName}
        userRole={userDisplay.userRole}
        avatarInitials={userDisplay.avatarInitials}
      />
    </header>
  );
}
