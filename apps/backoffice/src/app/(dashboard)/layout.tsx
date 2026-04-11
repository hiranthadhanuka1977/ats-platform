import type { ReactNode } from "react";
import "@/styles/backoffice.css";
import { BackOfficeShell } from "@/components/backoffice/BackOfficeShell";
import {
  formatStaffRoleLabel,
  getAvatarInitials,
  getStaffSession,
} from "@/lib/staff-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getStaffSession();
  const userDisplay = session
    ? {
        userName: session.name,
        userRole: formatStaffRoleLabel(session.role),
        avatarInitials: getAvatarInitials(session.name, session.email),
      }
    : {
        userName: "User",
        userRole: "",
        avatarInitials: "?",
      };

  return <BackOfficeShell userDisplay={userDisplay}>{children}</BackOfficeShell>;
}
