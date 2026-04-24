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

/** Slug prefix for idempotent re-seed (delete + recreate). */
const SEED_JOB_SLUG_PREFIX = 'seed-dhanuka-';

const SEED_STAFF_USER = {
  email: 'dhanuka@ideahub.lk',
  password: 'Think100%',
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

/** Pool of titles; 30 unique picks after shuffle. */
const JOB_TITLE_POOL = [
  'Senior Software Engineer',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'Product Manager',
  'Product Designer',
  'UX Researcher',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'QA Automation Engineer',
  'Technical Writer',
  'Engineering Manager',
  'Solutions Architect',
  'Business Analyst',
  'Marketing Manager',
  'Content Strategist',
  'HR Business Partner',
  'Finance Analyst',
  'Operations Coordinator',
  'Customer Success Manager',
  'Sales Engineer',
  'Security Engineer',
  'Mobile Developer',
  'Scrum Master',
  'Product Owner',
  'Visual Designer',
  'Growth Marketer',
  'IT Support Specialist',
  'Cloud Solutions Architect',
  'Site Reliability Engineer',
];

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomStatuses() {
  const r = Math.random();
  if (r < 0.72) return 'published';
  if (r < 0.86) return 'draft';
  if (r < 0.96) return 'closed';
  return 'archived';
}

async function seedJobPostings() {
  const email = SEED_STAFF_USER.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`Seed user ${email} not found — run seedStaffUser first`);
  }

  const deleted = await prisma.jobPosting.deleteMany({
    where: {
      createdById: user.id,
      slug: { startsWith: SEED_JOB_SLUG_PREFIX },
    },
  });
  if (deleted.count > 0) {
    console.log('Removed previous seed job postings:', deleted.count);
  }

  const departments = await prisma.department.findMany({ where: { isActive: true } });
  const locations = await prisma.location.findMany({ where: { isActive: true } });
  const employmentTypes = await prisma.employmentType.findMany();
  const experienceLevels = await prisma.experienceLevel.findMany();
  const skills = await prisma.skill.findMany();
  const benefits = await prisma.benefit.findMany();
  const tags = await prisma.tag.findMany();

  if (
    departments.length === 0 ||
    locations.length === 0 ||
    employmentTypes.length === 0 ||
    experienceLevels.length === 0
  ) {
    throw new Error('Lookups must be seeded before job postings');
  }

  const tagByName = Object.fromEntries(tags.map((t) => [t.name, t]));
  const titles = shuffleInPlace([...JOB_TITLE_POOL]).slice(0, 30);

  const RESP_TEMPLATES = [
    'Collaborate with cross-functional teams to deliver high-quality outcomes.',
    'Own discovery through delivery for assigned initiatives.',
    'Participate in code reviews, design discussions, and incident response as needed.',
    'Communicate progress and risks clearly to stakeholders.',
    'Improve team practices, documentation, and tooling.',
  ];

  const REQ_QUAL = [
    'Strong communication and collaboration skills.',
    'Relevant degree or equivalent practical experience.',
    'Comfortable working in Agile delivery cycles.',
  ];

  const PREF_QUAL = [
    'Experience in a fast-paced product environment.',
    'Familiarity with modern cloud and CI/CD practices.',
  ];

  for (let i = 0; i < 30; i++) {
    const title = titles[i];
    const slug = `${SEED_JOB_SLUG_PREFIX}${String(i + 1).padStart(3, '0')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.slice(0, 220);
    const dept = pick(departments);
    const loc = pick(locations);
    const emp = pick(employmentTypes);
    const exp = pick(experienceLevels);
    const status = randomStatuses();
    const daysAgo = Math.floor(Math.random() * 100);
    const postedAt =
      status === 'published' || status === 'closed' || status === 'archived'
        ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        : null;

    const isRemoteRoll = Math.random();
    const isRemote = isRemoteRoll > 0.55;
    const workplaceTagName = isRemote ? 'Remote' : isRemoteRoll > 0.25 ? 'Hybrid' : 'On-site';
    const tagRow = tagByName[workplaceTagName];

    const summary = `${title} — ${dept.name} team in ${loc.city}. ${emp.name} role; ${exp.name}. Join us to build products customers love.`.slice(0, 500);

    const skillPick = shuffleInPlace(skills.slice()).slice(0, Math.min(3 + Math.floor(Math.random() * 4), skills.length));
    const benefitPick = shuffleInPlace(benefits.slice()).slice(0, Math.min(3 + Math.floor(Math.random() * 3), benefits.length));

    const responsibilities = shuffleInPlace([...RESP_TEMPLATES]).slice(0, 3 + Math.floor(Math.random() * 3));

    await prisma.jobPosting.create({
      data: {
        title,
        slug,
        departmentId: dept.id,
        locationId: loc.id,
        employmentTypeId: emp.id,
        experienceLevelId: exp.id,
        summary,
        overview: `We are hiring a ${title} to strengthen our ${dept.name} function. You will partner with peers across the org, ship iteratively, and help raise the bar for quality and customer focus.\n\nThis is a ${emp.name} opportunity based in ${loc.city}, ${loc.country}.`,
        roleSummary: `Day to day you will contribute to roadmap execution, collaborate with stakeholders, and help the team hit measurable goals. We value ownership, clarity, and continuous improvement.`,
        applicationInfo: 'Apply with your CV and a short note on why this role fits you. We review applications on a rolling basis.',
        isRemote,
        isFeatured: Math.random() > 0.88,
        status,
        postedAt,
        expiresAt: Math.random() > 0.65 ? new Date(Date.now() + (30 + Math.floor(Math.random() * 120)) * 24 * 60 * 60 * 1000) : null,
        createdById: user.id,
        responsibilities: {
          create: responsibilities.map((description, sortOrder) => ({ description, sortOrder })),
        },
        qualifications: {
          create: [
            { description: pick(REQ_QUAL), type: 'required', sortOrder: 0 },
            { description: pick(REQ_QUAL), type: 'required', sortOrder: 1 },
            { description: pick(PREF_QUAL), type: 'preferred', sortOrder: 2 },
          ],
        },
        jobPostingSkills: {
          create: skillPick.map((s, sortOrder) => ({
            skillId: s.id,
            sortOrder,
          })),
        },
        jobPostingBenefits: {
          create: benefitPick.map((b, sortOrder) => ({
            benefitId: b.id,
            sortOrder,
          })),
        },
        ...(tagRow
          ? {
              jobPostingTags: {
                create: [{ tagId: tagRow.id, sortOrder: 0 }],
              },
            }
          : {}),
      },
    });
  }

  console.log('Seeded job postings: 30 (creator:', email + ')');
}

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
  await seedJobPostings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
