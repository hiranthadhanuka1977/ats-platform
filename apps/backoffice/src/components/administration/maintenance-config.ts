/** Copy for each section lives in `content/administration/<section>.md` (summary + optional body). */
export const MAINTENANCE_SECTIONS = {
  departments: {
    title: "Departments",
    apiPath: "/api/admin/departments",
  },
  locations: {
    title: "Locations",
    apiPath: "/api/admin/locations",
  },
  "employment-types": {
    title: "Employment types",
    apiPath: "/api/admin/employment-types",
  },
  "experience-levels": {
    title: "Experience levels",
    apiPath: "/api/admin/experience-levels",
  },
  skills: {
    title: "Skills",
    apiPath: "/api/admin/skills",
  },
  tags: {
    title: "Tags",
    apiPath: "/api/admin/tags",
  },
  benefits: {
    title: "Benefits",
    apiPath: "/api/admin/benefits",
  },
} as const;

export type MaintenanceSectionId = keyof typeof MAINTENANCE_SECTIONS;

export const MAINTENANCE_SECTION_IDS = Object.keys(
  MAINTENANCE_SECTIONS
) as MaintenanceSectionId[];

export function isMaintenanceSectionId(s: string): s is MaintenanceSectionId {
  return s in MAINTENANCE_SECTIONS;
}
