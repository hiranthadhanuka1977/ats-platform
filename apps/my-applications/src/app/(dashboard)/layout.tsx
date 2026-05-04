import type { ReactNode } from "react";
import "../../../../backoffice/src/styles/backoffice.css";
import { DashboardRouteLayout } from "@/components/portal/DashboardRouteLayout";

export default function DashboardGroupLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DashboardRouteLayout>{children}</DashboardRouteLayout>;
}
