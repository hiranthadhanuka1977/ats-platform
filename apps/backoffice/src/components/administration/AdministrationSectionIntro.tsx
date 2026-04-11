"use client";

import ReactMarkdown from "react-markdown";

type AdministrationSectionIntroProps = {
  summary: string;
  bodyMarkdown: string;
};

export function AdministrationSectionIntro({ summary, bodyMarkdown }: AdministrationSectionIntroProps) {
  const s = typeof summary === "string" ? summary : "";
  const b = typeof bodyMarkdown === "string" ? bodyMarkdown : "";
  const hasSummary = s.trim().length > 0;
  const hasBody = b.trim().length > 0;

  if (!hasSummary && !hasBody) {
    return null;
  }

  return (
    <div className="bo-admin-section-intro">
      {hasSummary ? <p className="bo-page-sub">{s}</p> : null}
      {hasBody ? (
        <details className="bo-admin-about">
          <summary>About this list</summary>
          <div className="bo-admin-about-body">
            <ReactMarkdown>{b}</ReactMarkdown>
          </div>
        </details>
      ) : null}
    </div>
  );
}
