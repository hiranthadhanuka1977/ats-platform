import Link from "next/link";

type CuratorInsightProps = {
  stalledInterviewCount: number;
};

export function CuratorInsight({ stalledInterviewCount }: CuratorInsightProps) {
  if (stalledInterviewCount === 0) {
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
          No applications have been stuck in an interview stage for more than 14 days without an update. Your
          pipeline looks current.
        </p>
      </section>
    );
  }

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
        <strong>{stalledInterviewCount} application{stalledInterviewCount === 1 ? "" : "s"}</strong> have been in
        an <strong>interview</strong> stage for over 14 days without a status update. Consider nudging hiring
        managers or closing stale loops.
      </p>
      <div className="bo-curator-actions">
        <Link href="/applications" className="btn btn-primary btn-sm">
          Review applications
        </Link>
      </div>
    </section>
  );
}
