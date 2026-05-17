import { createHash } from "node:crypto";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MAX_JOB_CHARS = 14_000;
const MAX_CV_CHARS = 14_000;

export function truncateRelevanceText(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}\n\n[truncated]`;
}

export function parseCvIdFromResumeUrl(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;
  const m = /(?:\?|&)id=([^&]+)/.exec(resumeUrl);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export type JobPostingForRelevance = {
  title: string;
  summary: string;
  overview: string | null;
  roleSummary: string | null;
  applicationInfo: string | null;
  updatedAt: Date;
  experienceLevel: { name: string; minYears: number };
  employmentType: { name: string };
  location: { city: string; country: string };
  isRemote: boolean;
  responsibilities: { description: string }[];
  qualifications: { description: string; type: string }[];
  jobPostingSkills: { skill: { name: string } }[];
};

export function buildJobPostingText(job: JobPostingForRelevance): string {
  const lines: string[] = [
    `Title: ${job.title}`,
    `Summary: ${job.summary}`,
    job.overview ? `Overview:\n${job.overview}` : "",
    job.roleSummary ? `Role summary:\n${job.roleSummary}` : "",
    job.applicationInfo ? `Application info:\n${job.applicationInfo}` : "",
    `Experience level: ${job.experienceLevel.name} (min years hint: ${job.experienceLevel.minYears})`,
    `Employment type: ${job.employmentType.name}`,
    `Location: ${job.location.city}, ${job.location.country}`,
    `Remote: ${job.isRemote ? "yes" : "no"}`,
    "",
    "Skills:",
    ...job.jobPostingSkills.map((j) => `- ${j.skill.name}`),
    "",
    "Responsibilities:",
    ...job.responsibilities.map((r) => `- ${r.description}`),
    "",
    "Qualifications:",
    ...job.qualifications.map((q) => `- [${q.type}] ${q.description}`),
  ];
  return lines.filter(Boolean).join("\n");
}

export type ApplicationAnswersForRelevance = {
  experienceYears: number | null;
  experienceMonths: number | null;
  hasDomainExperience: boolean | null;
  noticePeriods: string | null;
  salaryExpectationAnnual: { toString(): string } | null;
  willingToRelocate: boolean | null;
  workModePreference: string | null;
  shortMotivation: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
};

export function buildApplicationAnswersSummary(app: ApplicationAnswersForRelevance): string {
  const parts: string[] = [];
  if (app.experienceYears != null || app.experienceMonths != null) {
    parts.push(`Stated experience: ${app.experienceYears ?? 0} years, ${app.experienceMonths ?? 0} months`);
  }
  if (app.hasDomainExperience != null) {
    parts.push(`Domain experience: ${app.hasDomainExperience ? "yes" : "no"}`);
  }
  if (app.noticePeriods) parts.push(`Notice periods (raw): ${app.noticePeriods}`);
  if (app.salaryExpectationAnnual != null) {
    parts.push(`Salary expectation: ${app.salaryExpectationAnnual.toString()}`);
  }
  if (app.willingToRelocate != null) {
    parts.push(`Willing to relocate: ${app.willingToRelocate ? "yes" : "no"}`);
  }
  if (app.workModePreference?.trim()) parts.push(`Work mode preference: ${app.workModePreference.trim()}`);
  if (app.shortMotivation?.trim()) parts.push(`Motivation: ${app.shortMotivation.trim()}`);
  return parts.join("\n");
}

export function buildCvText(cv: { extractedText: string | null; parsedJson: unknown } | null): string {
  const parts: string[] = [];
  if (cv?.extractedText?.trim()) parts.push(cv.extractedText.trim());
  if (cv?.parsedJson != null) {
    try {
      parts.push("\n--- Parsed structured data (JSON) ---\n");
      parts.push(JSON.stringify(cv.parsedJson).slice(0, 8000));
    } catch {
      /* ignore */
    }
  }
  return parts.join("\n") || "";
}

export type RelevanceInputHashPayload = {
  jobPostingId: string;
  jobUpdatedAt: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  experienceYears: number | null;
  experienceMonths: number | null;
  hasDomainExperience: boolean | null;
  noticePeriods: string | null;
  salaryExpectationAnnual: string | null;
  willingToRelocate: boolean | null;
  workModePreference: string | null;
  shortMotivation: string | null;
  cvId: string | null;
  cvUpdatedAt: string | null;
};

export function buildRelevanceInputHashPayload(
  application: ApplicationAnswersForRelevance & { jobPostingId: string },
  job: { id: string; updatedAt: Date },
  cv: { id: string; updatedAt: Date } | null,
): RelevanceInputHashPayload {
  return {
    jobPostingId: job.id,
    jobUpdatedAt: job.updatedAt.toISOString(),
    resumeUrl: application.resumeUrl,
    coverLetter: application.coverLetter,
    experienceYears: application.experienceYears,
    experienceMonths: application.experienceMonths,
    hasDomainExperience: application.hasDomainExperience,
    noticePeriods: application.noticePeriods,
    salaryExpectationAnnual:
      application.salaryExpectationAnnual != null ? application.salaryExpectationAnnual.toString() : null,
    willingToRelocate: application.willingToRelocate,
    workModePreference: application.workModePreference,
    shortMotivation: application.shortMotivation,
    cvId: cv?.id ?? null,
    cvUpdatedAt: cv?.updatedAt.toISOString() ?? null,
  };
}

export function computeRelevanceInputHash(payload: RelevanceInputHashPayload): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

type OpenAiScoreJson = {
  score?: number;
  skills?: number;
  experience?: number;
  responsibilities?: number;
  qualifications?: number;
  location?: number;
};

function clampPercent(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function scoreJobCvRelevanceWithOpenAI(params: {
  apiKey: string;
  model?: string;
  jobPostingText: string;
  cvText: string;
  applicationAnswersSummary?: string;
}): Promise<{ score: number; breakdownText: string }> {
  const model = params.model?.trim() || "gpt-4o-mini";
  const jobPostingText = truncateRelevanceText(params.jobPostingText, MAX_JOB_CHARS);
  const cvText = truncateRelevanceText(params.cvText, MAX_CV_CHARS);
  const answers = params.applicationAnswersSummary?.trim() ?? "";

  const userContent = [
    "Rate how well the candidate's CV matches the job posting for screening triage.",
    "Consider the following criteria separately and also provide an overall score:",
    "- skills & keywords",
    "- experience level vs role seniority",
    "- responsibilities overlap",
    "- qualifications (education / certifications) vs requirements",
    "- location / remote fit (only if clearly relevant)",
    "",
    "Ignore protected characteristics. Base the scores only on professional content.",
    "Use the same inputs to produce the same scores when run again.",
    "",
    "## Job posting",
    jobPostingText || "(empty)",
    "",
    "## CV / resume text",
    cvText || "(no extractable CV text)",
    answers ? `\n## Application form (structured answers)\n${answers}` : "",
    "",
    'Respond with JSON only, for example:',
    '{',
    '  "score": 82,',
    '  "skills": 85,',
    '  "experience": 80,',
    '  "responsibilities": 78,',
    '  "qualifications": 70,',
    '  "location": 90',
    "}",
    '"score" is the overall 0-100 match for this application to this job.',
  ].join("\n");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are an expert technical recruiter. Output only valid JSON with integer fields "score", "skills", "experience", "responsibilities", "qualifications", "location" (each 0-100).',
        },
        { role: "user", content: userContent },
      ],
    }),
  });

  const raw = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    const msg = raw.error?.message ?? `OpenAI request failed (${response.status})`;
    throw new Error(msg);
  }

  const content = raw.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");

  let parsed: OpenAiScoreJson;
  try {
    parsed = JSON.parse(content) as OpenAiScoreJson;
  } catch {
    throw new Error("OpenAI returned non-JSON");
  }

  const overall = clampPercent(parsed.score);
  if (overall === undefined) throw new Error("OpenAI JSON missing numeric score");

  const lines: string[] = [`Overall match: ${overall}%`];
  const skills = clampPercent(parsed.skills);
  const experience = clampPercent(parsed.experience);
  const responsibilities = clampPercent(parsed.responsibilities);
  const qualifications = clampPercent(parsed.qualifications);
  const location = clampPercent(parsed.location);
  if (skills != null) lines.push(`Skills & keywords: ${skills}%`);
  if (experience != null) lines.push(`Experience level: ${experience}%`);
  if (responsibilities != null) lines.push(`Responsibilities overlap: ${responsibilities}%`);
  if (qualifications != null) lines.push(`Qualifications: ${qualifications}%`);
  if (location != null) lines.push(`Location / remote fit: ${location}%`);

  return { score: overall, breakdownText: lines.join("\n") };
}

export type RelevanceBreakdownDimensionKey =
  | "skills"
  | "experience"
  | "responsibilities"
  | "qualifications"
  | "location";

export type RelevanceBreakdownDimension = {
  key: RelevanceBreakdownDimensionKey;
  label: string;
  shortLabel: string;
  score: number;
};

const BREAKDOWN_LINE_RULES: {
  key: RelevanceBreakdownDimensionKey;
  label: string;
  shortLabel: string;
  pattern: RegExp;
}[] = [
  {
    key: "skills",
    label: "Skills & keywords",
    shortLabel: "Skills",
    pattern: /^Skills\s*&\s*keywords:\s*(\d+)\s*%/im,
  },
  {
    key: "experience",
    label: "Experience level",
    shortLabel: "Experience",
    pattern: /^Experience\s+level:\s*(\d+)\s*%/im,
  },
  {
    key: "responsibilities",
    label: "Responsibilities overlap",
    shortLabel: "Role fit",
    pattern: /^Responsibilities\s+overlap:\s*(\d+)\s*%/im,
  },
  {
    key: "qualifications",
    label: "Qualifications",
    shortLabel: "Qualifications",
    pattern: /^Qualifications:\s*(\d+)\s*%/im,
  },
  {
    key: "location",
    label: "Location / remote fit",
    shortLabel: "Location",
    pattern: /^Location\s*\/\s*remote\s+fit:\s*(\d+)\s*%/im,
  },
];

/** Parses persisted `relevanceBreakdown` text into dimension scores for charts. */
export function parseRelevanceBreakdown(
  breakdownText: string | null | undefined,
): RelevanceBreakdownDimension[] {
  if (!breakdownText?.trim()) return [];

  const dimensions: RelevanceBreakdownDimension[] = [];
  for (const rule of BREAKDOWN_LINE_RULES) {
    const match = breakdownText.match(rule.pattern);
    if (!match?.[1]) continue;
    const score = Number(match[1]);
    if (Number.isNaN(score)) continue;
    dimensions.push({
      key: rule.key,
      label: rule.label,
      shortLabel: rule.shortLabel,
      score: Math.max(0, Math.min(100, Math.round(score))),
    });
  }
  return dimensions;
}
