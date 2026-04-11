import type { CSSProperties } from "react";

type EfficiencyScoreCardProps = {
  score?: number;
};

export function EfficiencyScoreCard({ score = 78 }: EfficiencyScoreCardProps) {
  return (
    <section className="bo-card bo-score-card bo-span-5" aria-labelledby="eff-score-title">
      <h2 id="eff-score-title" className="bo-card-title">
        Hiring efficiency score
      </h2>
      <div
        className="bo-score-ring"
        style={{ "--score": score } as CSSProperties}
        role="img"
        aria-label={`Hiring efficiency ${score} percent`}
      >
        <div className="bo-score-ring-inner">
          <span className="bo-score-value">{score}</span>
          <span className="bo-score-label">out of 100</span>
        </div>
      </div>
      <p className="bo-score-hint">
        Based on time-to-fill, offer acceptance, and stage conversion vs. your 90-day baseline.
      </p>
    </section>
  );
}
