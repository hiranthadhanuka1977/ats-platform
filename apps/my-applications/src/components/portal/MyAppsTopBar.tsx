"use client";

import type { HeaderUserDisplay } from "./header-user-display";
import { IconMenu } from "./nav-icons";
import { CandidateUserMenu } from "./CandidateUserMenu";

type MyAppsTopBarProps = {
  expanded: boolean;
  onToggle: () => void;
  orgName?: string;
  orgBadge?: string;
  userDisplay: HeaderUserDisplay;
};

export function MyAppsTopBar({
  expanded,
  onToggle,
  orgName = "TalentHub",
  orgBadge = "My Applications",
  userDisplay,
}: MyAppsTopBarProps) {
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
        <div role="group" aria-label="Current product">
          <span className="bo-org-name">{orgName}</span>
          <span className="bo-org-badge">{orgBadge}</span>
        </div>
      </div>
      <CandidateUserMenu
        userName={userDisplay.userName}
        userRole={userDisplay.userRole}
        avatarInitials={userDisplay.avatarInitials}
      />
    </header>
  );
}
