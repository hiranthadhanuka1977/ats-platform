"use client";

type Props = {
  jobTitle: string;
  path: string;
  className?: string;
  withLabel?: boolean;
};

export function ShareButton({ jobTitle, path, className, withLabel }: Props) {
  return (
    <button
      type="button"
      className={className ?? "icon-btn icon-btn--share"}
      aria-label={`Share ${jobTitle}`}
      onClick={async () => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}${path}`;
        const shareData = {
          title: jobTitle || "Job Opening",
          text: jobTitle ? `Check out this job: ${jobTitle}` : "Check out this job opening",
          url,
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(url);
          }
        } catch {
          /* user cancel or clipboard denied */
        }
      }}
    >
      <svg width={withLabel ? 18 : 16} height={withLabel ? 18 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {withLabel ? "Share" : null}
    </button>
  );
}
