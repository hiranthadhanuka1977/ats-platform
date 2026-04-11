import Link from "next/link";

export function CuratorInsight() {
  return (
    <section className="bo-card bo-curator bo-span-12" aria-labelledby="curator-title">
      <h2 id="curator-title" className="bo-curator-heading">
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M6 14h12v8H6z" />
        </svg>
        Curator insight
      </h2>
      <p className="bo-curator-text">
        <strong>18 candidates</strong> have been in <strong>Interviewing</strong> for over 14 days without a
        next step. Consider nudging hiring managers or closing stale loops — this pattern often correlates with
        a drop in offer acceptance later in the quarter.
      </p>
      <div className="bo-curator-actions">
        <Link href="#" className="btn btn-primary btn-sm">
          View stalled interviews
        </Link>
        <button type="button" className="btn btn-secondary btn-sm">
          Dismiss
        </button>
      </div>
    </section>
  );
}
