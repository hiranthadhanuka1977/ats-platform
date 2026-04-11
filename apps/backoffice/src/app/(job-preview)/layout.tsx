import type { ReactNode } from "react";
import "@/styles/backoffice.css";

/**
 * Job posting preview only — no sidebar, top bar, or app chrome (opens in new tab from jobs list).
 */
export default function JobPreviewRootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="bo-app bo-job-preview-standalone">
      <div className="bo-job-preview-standalone-inner">{children}</div>
    </div>
  );
}
