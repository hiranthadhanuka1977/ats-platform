export const AUTH_STORAGE_KEY = "candidate-auth-session";

export type CandidateAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  issuedAt?: number;
  lastActivityAt?: number;
  user: {
    id: string;
    email: string;
    type: "candidate";
  };
};

export function saveCandidateSession(session: CandidateAuthSession, remember: boolean) {
  const now = Date.now();
  const normalized: CandidateAuthSession = {
    ...session,
    issuedAt: session.issuedAt || now,
    lastActivityAt: session.lastActivityAt || now,
  };
  const serialized = JSON.stringify(normalized);
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function loadCandidateSession(): CandidateAuthSession | null {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) ?? localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CandidateAuthSession>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.id || !parsed.user?.email) {
      return null;
    }
    const now = Date.now();
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresIn: typeof parsed.expiresIn === "number" ? parsed.expiresIn : 15 * 60,
      issuedAt: typeof parsed.issuedAt === "number" ? parsed.issuedAt : now,
      lastActivityAt: typeof parsed.lastActivityAt === "number" ? parsed.lastActivityAt : now,
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        type: "candidate",
      },
    };
  } catch {
    return null;
  }
}

export function clearCandidateSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function touchCandidateSessionActivity() {
  const s = loadCandidateSession();
  if (!s) return;
  const remember = localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  saveCandidateSession({ ...s, lastActivityAt: Date.now() }, remember);
}

export function updateCandidateSessionTokens(next: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}) {
  const s = loadCandidateSession();
  if (!s) return;
  const remember = localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  saveCandidateSession(
    {
      ...s,
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
      expiresIn: next.expiresIn,
      issuedAt: Date.now(),
      lastActivityAt: Date.now(),
    },
    remember
  );
}
