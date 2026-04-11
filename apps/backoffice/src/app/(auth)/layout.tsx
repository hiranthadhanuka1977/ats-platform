import type { ReactNode } from "react";
import "@/styles/login.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="bo-login-page">{children}</div>;
}
