import { NextResponse } from "next/server";
import { getStaffSession, type StaffSession } from "@/lib/staff-session";

/** Returns session or a 401 JSON response for admin API routes. */
export async function requireStaffSession(): Promise<StaffSession | NextResponse> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }
  return session;
}
