import { NextResponse } from "next/server";
import type { MaintenanceSectionId } from "@/components/administration/maintenance-config";
import { prisma } from "@/lib/prisma";

/** How many job postings reference this lookup (direct FK or junction row). */
export async function countJobPostingRefs(section: MaintenanceSectionId, id: number): Promise<number> {
  switch (section) {
    case "departments":
      return prisma.jobPosting.count({ where: { departmentId: id } });
    case "locations":
      return prisma.jobPosting.count({ where: { locationId: id } });
    case "employment-types":
      return prisma.jobPosting.count({ where: { employmentTypeId: id } });
    case "experience-levels":
      return prisma.jobPosting.count({ where: { experienceLevelId: id } });
    case "skills":
      return prisma.jobPostingSkill.count({ where: { skillId: id } });
    case "tags":
      return prisma.jobPostingTag.count({ where: { tagId: id } });
    case "benefits":
      return prisma.jobPostingBenefit.count({ where: { benefitId: id } });
    default:
      return 0;
  }
}

export function lookupInUseResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "IN_USE",
        message: "This record is referenced by job postings. Archive it instead of deleting.",
      },
    },
    { status: 409 }
  );
}
