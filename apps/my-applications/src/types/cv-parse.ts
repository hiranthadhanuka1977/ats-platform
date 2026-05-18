export type ParsedCvCandidate = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
};

export type ParsedCvEducation = {
  qualification: string;
  institution: string;
  startDate: string;
  endDate: string;
};

export type ParsedCvExperience = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
};

export type ParsedCvPayload = {
  candidate: ParsedCvCandidate;
  education: ParsedCvEducation[];
  experience: ParsedCvExperience[];
};

export function emptyParsedCvPayload(): ParsedCvPayload {
  return {
    candidate: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      currentTitle: "",
    },
    education: [],
    experience: [],
  };
}

const TRAILING_DEGREE_OR_CERT = new RegExp(
  String.raw`\s*,?\s*\b(?:MBA|EMBA|Ph\.?D\.?|M\.?Phil|D\.?Phil|M\.?S\.?c?\.?|B\.?S\.?c?\.?|B\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|B\.?Tech\.?|M\.?Tech\.?|M\.?B\.?A\.?|B\.?Com\.?|M\.?Com\.?|CFA|CPA|FRM|PMP|P\.?Eng\.?|LL\.?M\.?|J\.?D\.?|M\.?D\.?|B\.?Arch\.?|RN|LPN|CISSP|CISM)\b\.?$`,
  "i"
);

const DEGREEISH_AFTER_COMMA =
  /\b(mba|ph\.?d|m\.?s\.?|b\.?s\.?|b\.?a\.?|b\.?tech|m\.?tech|cf[ap]|ll\.?m|jd|embs?a|msc|bsc)\b/i;

function tokenNorm(w: string): string {
  return w.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

/** Tokens that should never appear in a person-name field (resume noise, locations, headers). */
const NON_NAME_TOKEN = new Set(
  [
    "curriculum",
    "vitae",
    "resume",
    "summary",
    "profile",
    "professional",
    "personal",
    "objective",
    "overview",
    "career",
    "highlights",
    "synopsis",
    "experience",
    "employment",
    "education",
    "skills",
    "projects",
    "references",
    "contact",
    "details",
    "application",
    "mobile",
    "phone",
    "email",
    "fax",
    "street",
    "avenue",
    "road",
    "drive",
    "lane",
    "suite",
    "boulevard",
    "linkedin",
    "github",
    "portfolio",
    "seeking",
    "looking",
    "motivated",
    "qualified",
    "dedicated",
    "extensive",
    "proven",
    "working",
    "years",
    "present",
    "available",
    "immediately",
    "confidential",
    "the",
    "and",
    "with",
    "from",
    "that",
    "this",
    "have",
    "has",
    "including",
    "such",
    "responsible",
    "duties",
    "industry",
    "certified",
    "certification",
  ]);

function isWordLikeNamePart(w: string): boolean {
  if (w.length < 2 || w.length > 50) return false;
  if (!/^[\p{L}'-]+$/u.test(w)) return false;
  if (!/\p{L}/u.test(w)) return false;
  return true;
}

function hasNonNameToken(words: readonly string[]): boolean {
  return words.some((w) => NON_NAME_TOKEN.has(tokenNorm(w)));
}

function isSentenceLikeBlob(s: string): boolean {
  return /\b(the|and|with|for|from|that|this|have|has|been|being|extensive|proven|experience|skills|including|such|as|working|seeking|looking|responsible|duties|highly|successful|track|record)\b/i.test(
    s
  );
}

/** Longest run of 2–4 name-like tokens (avoids grabbing CV headings or sentences). */
function findBestTitleCaseNameRun(s: string): string {
  const words = s.replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  let best = "";
  for (let i = 0; i < words.length; i++) {
    const acc: string[] = [];
    for (let j = i; j < words.length && acc.length < 4; j++) {
      const w = words[j];
      if (!isWordLikeNamePart(w)) break;
      if (NON_NAME_TOKEN.has(tokenNorm(w))) break;
      acc.push(w);
      if (acc.length >= 2) {
        const cand = acc.join(" ");
        if (cand.length > best.length) best = cand;
      }
    }
  }
  return best;
}

function isReasonableFullName(s: string): boolean {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  if (!words.every(isWordLikeNamePart)) return false;
  if (hasNonNameToken(words)) return false;
  if (isSentenceLikeBlob(s)) return false;
  return true;
}

/** Only drop text after a comma when the RHS is clearly a degree, cert, long tagline, or role lead-in (not "Last, First"). */
function shouldTakeLeftOfCommaOnly(left: string, right: string): boolean {
  if (!right) return false;
  if (DEGREEISH_AFTER_COMMA.test(right)) return true;
  if (right.length > 58) return true;
  if (/^\s*(?:MBA|EMBA|Ph\.?\s*D\.?|M\.?\s*S\.?|B\.?\s*S\.?|B\.?\s*A\.?|CFA|CPA|PMP|CSM|PE|RN)\b/i.test(right)) return true;
  if (/^\s*(?:Senior|Junior|Staff|Principal|Chief|Lead|Head)\s+\S{2,}/i.test(right)) return true;
  const rw = right.split(/\s+/).filter(Boolean);
  if (rw.length >= 3 && /\b(engineer|developer|architect|manager|director|consultant|analyst|designer|specialist|scientist|executive|coordinator|technician|programmer|researcher)\b/i.test(right)) {
    return true;
  }
  return false;
}

/**
 * CV headlines often look like "Jane Doe, MBA | Senior Engineer".
 * Prefer a short person-like token run; never return arbitrary sentence fragments.
 */
export function sanitizeCvFullName(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  if (!s) return "";

  s = s.split(/\s*•\s*/)[0].trim();
  s = s.split(/\s*[·‧]\s*/)[0].trim();

  const commaIdx = s.indexOf(",");
  if (commaIdx > 0) {
    const left = s.slice(0, commaIdx).trim();
    const right = s.slice(commaIdx + 1).trim();
    if (shouldTakeLeftOfCommaOnly(left, right)) s = left;
  }

  s = s.replace(/\s*\([^)]{1,120}\)\s*$/g, "").trim();

  for (let i = 0; i < 6; i++) {
    const next = s.replace(TRAILING_DEGREE_OR_CERT, "").trim();
    if (next === s) break;
    s = next;
    s = s.replace(/,\s*$/, "").trim();
  }
  for (let i = 0; i < 4; i++) {
    const next = s.replace(/\s+(?:MBA|EMBA|Ph\.?D\.?|M\.?S\.?c?\.?|B\.?S\.?c?\.?|CFA|CPA|PMP|CSM)\b\.?$/i, "").trim();
    if (next === s) break;
    s = next;
  }

  if (isReasonableFullName(s)) return s.slice(0, 80);

  const run = findBestTitleCaseNameRun(s);
  if (run && isReasonableFullName(run)) return run.slice(0, 80);

  return "";
}

/** First plausible name on early lines of raw CV text (heuristic path only). */
export function pickFullNameFromCvPlainText(text: string): string {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 15);
  for (const line of lines) {
    if (line.length < 3 || line.length > 100) continue;
    if (/[@]|https?:\/\//i.test(line)) continue;
    if (/^(experience|employment|education|skills|summary|objective|profile|projects|references|contact)\b/i.test(line)) {
      continue;
    }
    if (line.length > 22 && line === line.toUpperCase() && !/\d/.test(line)) continue;
    const left = line.split(/\s*[|｜]\s*/)[0].trim();
    const guess = findBestTitleCaseNameRun(left);
    if (guess && isReasonableFullName(guess)) return guess.slice(0, 80);
  }
  return "";
}

/** LLMs often use different keys than our schema; pick the richest non-empty array. */
function coalesceExperienceArray(o: Record<string, unknown>): unknown[] {
  const keys = [
    "experience",
    "workExperience",
    "work_experience",
    "employment",
    "employmentHistory",
    "jobs",
    "positions",
    "professionalExperience",
    "career",
    "workHistory",
  ] as const;
  let best: unknown[] = [];
  for (const k of keys) {
    const v = o[k];
    if (!Array.isArray(v) || v.length === 0) continue;
    if (v.length > best.length) best = v;
  }
  if (best.length > 0) return best;
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function coalesceEducationArray(o: Record<string, unknown>): unknown[] {
  const keys = [
    "education",
    "educations",
    "educationHistory",
    "education_history",
    "academicBackground",
    "academic_background",
    "qualifications",
    "degrees",
    "schooling",
  ] as const;
  let best: unknown[] = [];
  for (const k of keys) {
    const v = o[k];
    if (!Array.isArray(v) || v.length === 0) continue;
    if (v.length > best.length) best = v;
  }
  if (best.length > 0) return best;
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizeEducationRow(e: Record<string, unknown>): ParsedCvEducation {
  const qualification = String(
    e.qualification ??
      e.degree ??
      e.diploma ??
      e.program ??
      e.fieldOfStudy ??
      e.field_of_study ??
      e.major ??
      e.course ??
      e.certification ??
      ""
  ).trim();
  const institution = String(
    e.institution ?? e.school ?? e.university ?? e.college ?? e.academy ?? e.institute ?? ""
  ).trim();
  const startDate = String(
    e.startDate ?? e.start ?? e.from ?? e.start_date ?? e.dateFrom ?? e.beginDate ?? e.yearFrom ?? ""
  ).trim();
  const endDate = String(
    e.endDate ?? e.end ?? e.to ?? e.end_date ?? e.dateTo ?? e.finishDate ?? e.yearTo ?? e.graduationDate ?? ""
  ).trim();
  return { qualification, institution, startDate, endDate };
}

function coalesceCandidateRecord(o: Record<string, unknown>): Record<string, unknown> {
  const nestedKeys = [
    "candidate",
    "personal",
    "personalInfo",
    "personal_info",
    "contact",
    "contactInfo",
    "contact_info",
    "profile",
    "basics",
    "header",
  ] as const;

  const merged: Record<string, unknown> = {};
  for (const key of nestedKeys) {
    const value = o[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(merged, value as Record<string, unknown>);
    }
  }

  const topLevelName = String(o.fullName ?? o.full_name ?? o.name ?? "").trim();
  if (topLevelName && !merged.fullName && !merged.name) merged.fullName = topLevelName;
  if (typeof o.email === "string" && !merged.email) merged.email = o.email;
  if (typeof o.phone === "string" && !merged.phone) merged.phone = o.phone;
  if (typeof o.location === "string" && !merged.location) merged.location = o.location;
  if (typeof o.currentTitle === "string" && !merged.currentTitle) merged.currentTitle = o.currentTitle;
  if (typeof o.title === "string" && !merged.currentTitle) merged.currentTitle = o.title;
  if (typeof o.jobTitle === "string" && !merged.currentTitle) merged.currentTitle = o.jobTitle;

  return merged;
}

function normalizeExperienceRow(e: Record<string, unknown>): ParsedCvExperience {
  const company = String(
    e.company ??
      e.employer ??
      e.organization ??
      e.organisation ??
      e.org ??
      e.companyName ??
      e.client ??
      e.workplace ??
      ""
  ).trim();
  const role = String(
    e.role ?? e.title ?? e.position ?? e.jobTitle ?? e.job_title ?? e.job ?? e.roleTitle ?? ""
  ).trim();
  const startDate = String(
    e.startDate ?? e.start ?? e.from ?? e.start_date ?? e.dateFrom ?? e.beginDate ?? ""
  ).trim();
  const endDate = String(e.endDate ?? e.end ?? e.to ?? e.end_date ?? e.dateTo ?? e.finishDate ?? "").trim();
  return { company, role, startDate, endDate };
}

/** Avoid classifying degree rows (institution + dates, no employer) as jobs when scanning nested arrays. */
function isLikelyEducationRecord(e: Record<string, unknown>): boolean {
  const hasSchool = Boolean(String(e.institution ?? e.school ?? e.university ?? e.college ?? "").trim());
  const hasDegree = Boolean(String(e.qualification ?? e.degree ?? e.diploma ?? e.major ?? "").trim());
  const hasEmployer = Boolean(String(e.company ?? e.employer ?? e.organization ?? e.organisation ?? "").trim());
  const hasRole = Boolean(String(e.role ?? e.title ?? e.position ?? e.jobTitle ?? "").trim());
  return (hasSchool || hasDegree) && !hasEmployer && !hasRole;
}

/** When the model nests jobs (e.g. `work: { history: [...] }`), find the best job-like array anywhere in the tree. */
function collectObjectArrays(node: unknown, depth: number, out: unknown[][]): void {
  if (depth < 0 || node === null || node === undefined) return;
  if (Array.isArray(node)) {
    if (node.length > 0 && typeof node[0] === "object" && node[0] !== null) {
      out.push(node);
    }
    for (const el of node) {
      collectObjectArrays(el, depth - 1, out);
    }
    return;
  }
  if (typeof node === "object") {
    for (const v of Object.values(node as Record<string, unknown>)) {
      collectObjectArrays(v, depth - 1, out);
    }
  }
}

function bestEducationFromTree(raw: unknown): ParsedCvEducation[] {
  const arrays: unknown[][] = [];
  collectObjectArrays(raw, 14, arrays);
  let best: ParsedCvEducation[] = [];
  for (const arr of arrays) {
    const rows = arr
      .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
      .filter((e) => isLikelyEducationRecord(e) || Boolean(String(e.degree ?? e.school ?? e.qualification ?? "").trim()))
      .map((e) => normalizeEducationRow(e))
      .filter((row) => row.qualification || row.institution || row.startDate || row.endDate);
    if (rows.length > best.length) best = rows;
  }
  return best;
}

function bestExperienceFromTree(raw: unknown): ParsedCvExperience[] {
  const arrays: unknown[][] = [];
  collectObjectArrays(raw, 14, arrays);
  let best: ParsedCvExperience[] = [];
  for (const arr of arrays) {
    const rows = arr
      .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
      .filter((e) => !isLikelyEducationRecord(e))
      .map((e) => normalizeExperienceRow(e))
      .filter((row) => row.company || row.role || row.startDate || row.endDate);
    if (rows.length > best.length) best = rows;
  }
  return best;
}

export function normalizeParsedPayload(raw: unknown): ParsedCvPayload {
  const base = emptyParsedCvPayload();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const c = coalesceCandidateRecord(o);
  const rawFull = String(c.fullName ?? c.name ?? "").trim();
  const pipeParts = rawFull.split(/\s*[|｜]\s*/);
  const leftOfPipe = (pipeParts[0] ?? "").trim();
  const rightOfPipe = pipeParts.length > 1 ? pipeParts.slice(1).join(" | ").trim() : "";

  let currentTitle = String(c.currentTitle ?? c.title ?? c.jobTitle ?? c.headline ?? "").trim();
  if (!currentTitle && rightOfPipe) currentTitle = rightOfPipe.slice(0, 300);

  let fullName = sanitizeCvFullName(leftOfPipe);
  if (!fullName && rawFull) {
    const merged = rawFull.replace(/\s*[|｜]\s*/g, " ");
    const again = findBestTitleCaseNameRun(merged);
    if (again && isReasonableFullName(again)) fullName = again.slice(0, 80);
  }
  if (!fullName && rawFull) {
    const words = rawFull.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5 && rawFull.length <= 80 && !isSentenceLikeBlob(rawFull)) {
      fullName = rawFull.slice(0, 80);
    }
  }

  base.candidate = {
    fullName,
    email: String(c.email ?? "").trim(),
    phone: String(c.phone ?? c.mobile ?? c.telephone ?? "").trim(),
    location: String(c.location ?? c.address ?? c.city ?? "").trim(),
    currentTitle,
  };

  const eduRows = coalesceEducationArray(o);
  let education = eduRows
    .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
    .map((e) => normalizeEducationRow(e))
    .filter((row) => row.qualification || row.institution || row.startDate || row.endDate);
  if (education.length === 0) {
    education = bestEducationFromTree(raw);
  }
  base.education = education;

  const expRows = coalesceExperienceArray(o);
  let experience = expRows
    .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
    .filter((e) => !isLikelyEducationRecord(e))
    .map((e) => normalizeExperienceRow(e))
    .filter((row) => row.company || row.role || row.startDate || row.endDate);
  if (experience.length === 0) {
    experience = bestExperienceFromTree(raw);
  }
  base.experience = experience;
  return base;
}
