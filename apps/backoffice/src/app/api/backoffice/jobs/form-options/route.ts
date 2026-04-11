import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Lookup data for job posting forms and filters (active departments/locations where applicable).
 */
export async function GET() {
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
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.experienceLevel.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.skill.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.benefit.findMany({
      orderBy: [{ sortOrder: "asc" }, { description: "asc" }],
      select: { id: true, description: true },
    }),
    prisma.tag.findMany({
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
}
