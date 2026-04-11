"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAINTENANCE_SECTION_IDS, MAINTENANCE_SECTIONS } from "./maintenance-config";

export function AdministrationNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="bo-admin-subnav" aria-label="Administration sections">
      <ul>
        {MAINTENANCE_SECTION_IDS.map((id) => {
          const href = `/administration/${id}`;
          const isCurrent = pathname === href;
          return (
            <li key={id}>
              <Link href={href} aria-current={isCurrent ? "page" : undefined}>
                {MAINTENANCE_SECTIONS[id].title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
