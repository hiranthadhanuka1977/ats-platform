import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdministrationNav } from "@/components/administration/AdministrationNav";

export const metadata: Metadata = {
  title: "Administration",
  description: "Maintain reference data for job postings.",
};

export default function AdministrationLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bo-content">
      <p className="bo-admin-kicker">Administration</p>
      <AdministrationNav />
      {children}
    </div>
  );
}
