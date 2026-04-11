/**
 * Seeds dev data into PostgreSQL via Prisma.
 * Loads `.env` from `packages/db` or repo root so `DATABASE_URL` is set.
 *
 * Lookup seeds align with docs/specification/db-schema.md §1 (Lookup / Reference Tables).
 */
const path = require('path');
const fs = require('fs');

const dbEnv = path.resolve(__dirname, '../.env');
const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(dbEnv)) {
  require('dotenv').config({ path: dbEnv });
} else if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SEED_STAFF_USER = {
  email: 'dhanuka@ideahub.lk',
  password: 'abc123',
  name: 'Dhanuka De Silva',
  role: 'admin',
};

/** @see db-schema.md §1.1 */
const DEPARTMENTS = [
  { name: 'Engineering', slug: 'engineering', sortOrder: 1 },
  { name: 'Product & Delivery', slug: 'product', sortOrder: 2 },
  { name: 'Design', slug: 'design', sortOrder: 3 },
  { name: 'Marketing', slug: 'marketing', sortOrder: 4 },
  { name: 'Human Resources', slug: 'human-resources', sortOrder: 5 },
  { name: 'Data & Analytics', slug: 'data-analytics', sortOrder: 6 },
  { name: 'Finance', slug: 'finance', sortOrder: 7 },
  { name: 'Operations', slug: 'operations', sortOrder: 8 },
];

/** @see db-schema.md §1.2 — display: city || ', ' || country */
const LOCATIONS = [
  { city: 'Colombo', country: 'Sri Lanka', slug: 'colombo', sortOrder: 1 },
  { city: 'London', country: 'UK', slug: 'london', sortOrder: 2 },
  { city: 'New York', country: 'USA', slug: 'new-york', sortOrder: 3 },
  { city: 'Singapore', country: 'Singapore', slug: 'singapore', sortOrder: 4 },
];

/** @see db-schema.md §1.3 */
const EMPLOYMENT_TYPES = [
  { name: 'Full-time', slug: 'full-time', sortOrder: 1 },
  { name: 'Part-time', slug: 'part-time', sortOrder: 2 },
  { name: 'Contract', slug: 'contract', sortOrder: 3 },
  { name: 'Internship', slug: 'internship', sortOrder: 4 },
];

/** @see db-schema.md §1.4 */
const EXPERIENCE_LEVELS = [
  { name: 'No Experience', slug: 'no-experience', minYears: 0, sortOrder: 1 },
  { name: 'Entry Level (0–2 Years)', slug: 'entry-level', minYears: 0, sortOrder: 2 },
  { name: 'Mid Level (2–5 Years)', slug: 'mid-level', minYears: 2, sortOrder: 3 },
  { name: 'Senior (5+ Years)', slug: 'senior', minYears: 5, sortOrder: 4 },
  { name: 'Lead / Principal (8+ Years)', slug: 'lead-principal', minYears: 8, sortOrder: 5 },
];

/** @see db-schema.md §1.5 — examples + common ATS / product-tech skills */
const SKILLS = [
  'Requirement Analysis',
  'TypeScript',
  'JavaScript',
  'React',
  'Node.js',
  'PostgreSQL',
  'Prisma',
  'REST API',
  'GraphQL',
  'AWS',
  'Docker',
  'CI/CD',
  'Agile',
  'Scrum',
  'UX Research',
  'Product Strategy',
  'Data Analysis',
  'SQL',
];

/** @see db-schema.md §1.6 — job posting PDP / perks (description is the stable key for idempotent seed) */
const BENEFITS = [
  { description: 'Health insurance', sortOrder: 1 },
  { description: 'Dental & vision', sortOrder: 2 },
  { description: 'Flexible working hours', sortOrder: 3 },
  { description: 'Remote work options', sortOrder: 4 },
  { description: 'Learning & development budget', sortOrder: 5 },
  { description: 'Paid time off', sortOrder: 6 },
  { description: 'Parental leave', sortOrder: 7 },
  { description: 'Employee stock options', sortOrder: 8 },
  { description: 'Retirement / pension plan', sortOrder: 9 },
  { description: 'Life & disability insurance', sortOrder: 10 },
  { description: 'Wellness & gym stipend', sortOrder: 11 },
  { description: 'Home office allowance', sortOrder: 12 },
  { description: 'Mental health support (EAP)', sortOrder: 13 },
  { description: 'Team events & social budget', sortOrder: 14 },
];

/** @see db-schema.md §1.7 — variant maps to badge classes */
const TAGS = [
  { name: 'On-site', variant: 'accent', sortOrder: 0 },
  { name: 'Hybrid', variant: 'warning', sortOrder: 1 },
  { name: 'Remote', variant: 'success', sortOrder: 2 },
];

async function seedLookups() {
  for (const row of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { slug: row.slug },
      create: {
        name: row.name,
        slug: row.slug,
        isActive: true,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        isActive: true,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log('Seeded departments:', DEPARTMENTS.length);

  for (const row of LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: row.slug },
      create: {
        city: row.city,
        country: row.country,
        slug: row.slug,
        isActive: true,
        sortOrder: row.sortOrder,
      },
      update: {
        city: row.city,
        country: row.country,
        isActive: true,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log('Seeded locations:', LOCATIONS.length);

  for (const row of EMPLOYMENT_TYPES) {
    await prisma.employmentType.upsert({
      where: { slug: row.slug },
      create: {
        name: row.name,
        slug: row.slug,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log('Seeded employment_types:', EMPLOYMENT_TYPES.length);

  for (const row of EXPERIENCE_LEVELS) {
    await prisma.experienceLevel.upsert({
      where: { slug: row.slug },
      create: {
        name: row.name,
        slug: row.slug,
        minYears: row.minYears,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        minYears: row.minYears,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log('Seeded experience_levels:', EXPERIENCE_LEVELS.length);

  for (const name of SKILLS) {
    await prisma.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log('Seeded skills:', SKILLS.length);

  for (const row of BENEFITS) {
    const existing = await prisma.benefit.findFirst({
      where: { description: row.description },
    });
    if (existing) {
      await prisma.benefit.update({
        where: { id: existing.id },
        data: { sortOrder: row.sortOrder },
      });
    } else {
      await prisma.benefit.create({
        data: { description: row.description, sortOrder: row.sortOrder },
      });
    }
  }
  console.log('Seeded benefits:', BENEFITS.length);

  for (const row of TAGS) {
    await prisma.tag.upsert({
      where: { name: row.name },
      create: {
        name: row.name,
        variant: row.variant,
        sortOrder: row.sortOrder,
      },
      update: {
        variant: row.variant,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log('Seeded tags:', TAGS.length);
}

async function seedStaffUser() {
  const email = SEED_STAFF_USER.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(SEED_STAFF_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: SEED_STAFF_USER.name,
      passwordHash,
      role: SEED_STAFF_USER.role,
      isActive: true,
    },
    update: {
      name: SEED_STAFF_USER.name,
      passwordHash,
      role: SEED_STAFF_USER.role,
      isActive: true,
    },
  });

  console.log('Seeded staff user (users table):', {
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

async function main() {
  await seedLookups();
  await seedStaffUser();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
