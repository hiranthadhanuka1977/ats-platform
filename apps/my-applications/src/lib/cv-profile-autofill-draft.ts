import type { ParsedCvPayload } from "@/types/cv-parse";

const STORAGE_KEY = "myapps-cv-profile-autofill";
const PENDING_PARSE_ID_KEY = "myapps-cv-pending-parse-id";

export type CvProfileAutofillDraft = {
  parseId: string;
  fileName: string;
  payload: ParsedCvPayload;
};

export function saveCvProfileAutofillDraft(draft: CvProfileAutofillDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function loadCvProfileAutofillDraft(): CvProfileAutofillDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CvProfileAutofillDraft;
    if (!parsed?.parseId || !parsed?.payload?.candidate) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCvProfileAutofillDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Keeps CV parseId available for save until profile is confirmed (survives URL cleanup / remounts). */
export function savePendingCvParseId(parseId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_PARSE_ID_KEY, parseId);
  } catch {
    /* ignore */
  }
}

export function loadPendingCvParseId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(PENDING_PARSE_ID_KEY)?.trim();
    return id || null;
  } catch {
    return null;
  }
}

export function clearPendingCvParseId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_PARSE_ID_KEY);
  } catch {
    /* ignore */
  }
}
