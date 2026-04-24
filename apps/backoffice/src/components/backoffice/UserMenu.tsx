"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useCloseDetailsOnOutsideAndEscape } from "@/hooks/useCloseDetailsOnOutsideAndEscape";
import { IconChevronDown } from "./nav-icons";

type UserMenuProps = {
  userName: string;
  userRole: string;
  avatarInitials: string;
};

export function UserMenu({ userName, userRole, avatarInitials }: UserMenuProps) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useCloseDetailsOnOutsideAndEscape(detailsRef);

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
            <Link href="#">Your profile</Link>
          </li>
          <li>
            <Link href="#">Notification settings</Link>
          </li>
          <li className="bo-user-menu-sep" aria-hidden>
            <hr />
          </li>
          <li>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                document.cookie = "bo_access=; Path=/; Max-Age=0; SameSite=Lax";
                document.cookie = "bo_refresh=; Path=/; Max-Age=0; SameSite=Lax";
                router.push("/login");
                router.refresh();
              }}
            >
              <button type="submit" className="bo-user-dropdown-signout">
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </details>
  );
}
