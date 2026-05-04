"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useCloseDetailsOnOutsideAndEscape } from "@/hooks/useCloseDetailsOnOutsideAndEscape";
import { clearCandidateSession } from "@/lib/auth-storage";
import { IconChevronDown } from "./nav-icons";

type CandidateUserMenuProps = {
  userName: string;
  userRole: string;
  avatarInitials: string;
};

export function CandidateUserMenu({ userName, userRole, avatarInitials }: CandidateUserMenuProps) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useCloseDetailsOnOutsideAndEscape(detailsRef);

  function onSignOut() {
    clearCandidateSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <details ref={detailsRef} className="bo-user-menu">
      <summary>
        <span className="bo-user-avatar" aria-hidden>
          {avatarInitials}
        </span>
        <div className="bo-user-meta">
          <div className="bo-user-name">{userName}</div>
          <div className="bo-user-role">{userRole}</div>
        </div>
        <IconChevronDown />
      </summary>
      <nav className="bo-user-dropdown" aria-label="Account actions">
        <ul>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="#">Profile</Link>
          </li>
          <li className="bo-user-menu-sep" aria-hidden>
            <hr />
          </li>
          <li>
            <button type="button" className="bo-user-dropdown-signout" onClick={onSignOut}>
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </details>
  );
}
