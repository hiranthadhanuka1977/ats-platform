"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMobileNav } from "@/hooks/useMobileNav";
import type { HeaderUserDisplay } from "./header-user-display";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type BackOfficeShellProps = {
  children: ReactNode;
  userDisplay: HeaderUserDisplay;
};

export function BackOfficeShell({ children, userDisplay }: BackOfficeShellProps) {
  const pathname = usePathname() ?? "/";
  const { open, toggleNav, closeNav } = useMobileNav();

  return (
    <div className="bo-app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="bo-shell">
        <Sidebar currentPath={pathname} />
        <div
          className="bo-sidebar-overlay"
          id="boOverlay"
          aria-hidden={!open}
          onClick={closeNav}
        />
        <div className="bo-main-wrap">
          <TopBar expanded={open} onToggle={toggleNav} userDisplay={userDisplay} />
          {children}
        </div>
      </div>
    </div>
  );
}
