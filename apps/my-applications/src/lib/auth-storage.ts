export const AUTH_STORAGE_KEY = "candidate-auth-session";

export type CandidateAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    type: "candidate";
  };
};

export function saveCandidateSession(session: CandidateAuthSession, remember: boolean) {
  const serialized = JSON.stringify(session);
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
    return JSON.parse(raw) as CandidateAuthSession;
  } catch {
    return null;
  }
}

export function clearCandidateSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
