"use client";

import { usePathname, useRouter } from "next/navigation";
import { MAINTENANCE_SECTION_IDS, MAINTENANCE_SECTIONS, type MaintenanceSectionId } from "./maintenance-config";

function sectionFromPathname(pathname: string): MaintenanceSectionId {
  const match = MAINTENANCE_SECTION_IDS.find((id) => pathname === `/administration/${id}`);
  return match ?? "departments";
}

export function AdministrationNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const current = sectionFromPathname(pathname);

  return (
    <nav className="bo-admin-section-nav" aria-label="Administration sections">
      <label className="bo-admin-section-nav-label" htmlFor="bo-admin-section-select">
        Section
      </label>
      <select
        id="bo-admin-section-select"
        className="bo-input bo-admin-section-select"
        value={current}
        onChange={(e) => router.push(`/administration/${e.target.value}`)}
      >
        {MAINTENANCE_SECTION_IDS.map((id) => (
          <option key={id} value={id}>
            {MAINTENANCE_SECTIONS[id].title}
          </option>
        ))}
      </select>
    </nav>
  );
}
