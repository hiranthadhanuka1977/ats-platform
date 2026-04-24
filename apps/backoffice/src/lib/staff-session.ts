import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecretBytes } from "@/lib/jwt-secret";

const API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";

export type StaffSession = {
  /** JWT `sub` — matches `users.id` (UUID). */
  userId: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Reads `bo_access` cookie and returns staff claims (name, email, role).
 * Tokens issued before `name` was added fall back to email local-part for display name.
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies();
  const token = store.get("bo_access")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    if (payload.typ !== "staff") return null;

    const sub = payload.sub;
    const userId = typeof sub === "string" ? sub : "";
    if (!userId) return null;

    const email = String(payload.email ?? "");
    const role = String(payload.role ?? "");
    const rawName = payload.name;
    const nameFromToken =
      typeof rawName === "string" && rawName.trim() ? rawName.trim() : "";
    const fallbackName = email.split("@")[0] || "User";
    const name = nameFromToken || fallbackName;

    return { userId, email, name, role };
  } catch {
    // Fallback for tokens issued by apps/api when local JWT secret differs.
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as {
        data?: {
          id?: string;
          type?: string;
          email?: string;
          name?: string;
          role?: string;
        };
      };
      if (payload.data?.type !== "staff") return null;
      const userId = payload.data?.id?.trim() ?? "";
      if (!userId) return null;
      const email = payload.data?.email?.trim() ?? "";
      const role = payload.data?.role?.trim() ?? "";
      const nameFromApi = payload.data?.name?.trim() ?? "";
      const fallbackName = email.split("@")[0] || "User";
      const name = nameFromApi || fallbackName;
      return { userId, email, name, role };
    } catch {
      return null;
    }
  }
}

/** Maps Prisma UserRole / API string to a short label for the header. */
export function formatStaffRoleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: "Admin",
    recruiter: "Recruiter",
    hiring_manager: "Hiring manager",
  };
  return (
    map[role] ??
    role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export function getAvatarInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  return (local.slice(0, 2) || "??").toUpperCase();
}
