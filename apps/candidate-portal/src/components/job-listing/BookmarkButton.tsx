"use client";

import { useState } from "react";

type Props = {
  jobTitle: string;
  className?: string;
  withLabel?: boolean;
};

export function BookmarkButton({ jobTitle, className, withLabel }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      className={className ?? "icon-btn icon-btn--bookmark"}
      aria-label={`Bookmark ${jobTitle}`}
      aria-pressed={pressed}
      onClick={() => setPressed((p) => !p)}
    >
      <svg width={withLabel ? 18 : 16} height={withLabel ? 18 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {withLabel ? "Bookmark" : null}
    </button>
  );
}
