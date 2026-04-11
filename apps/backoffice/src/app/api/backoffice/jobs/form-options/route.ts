import { NextResponse } from "next/server";
import { withAdminJsonResponse } from "@/lib/admin-api-route";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Lookup data for job posting forms and filters (active departments/locations where applicable).
 */
export async function GET() {
  return withAdminJsonResponse(async () => {
    const auth = await requireStaffSession();
    if (auth instanceof NextResponse) return auth;

    const [departments, locations, employmentTypes, experienceLevels, skills, benefits, tags] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { city: "asc" }],
      select: { id: true, city: true, country: true, slug: true },
    }),
    prisma.employmentType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.experienceLevel.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.skill.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.benefit.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { description: "asc" }],
      select: { id: true, description: true },
    }),
    prisma.tag.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, variant: true },
    }),
  ]);

    return NextResponse.json({
      departments,
      locations,
      employmentTypes,
      experienceLevels,
      skills,
      benefits,
      tags,
    });
  });
}
