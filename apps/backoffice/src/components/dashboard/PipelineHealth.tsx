import type { CSSProperties } from "react";

export type PipelineStage = {
  name: string;
  pct: number;
  barStyle?: CSSProperties;
};

const defaultStages: PipelineStage[] = [
  { name: "Sourcing", pct: 32 },
  { name: "Screening", pct: 24 },
  { name: "Interviewing", pct: 18 },
  { name: "Offered", pct: 12 },
  { name: "Hired", pct: 8 },
  {
    name: "Withdrawn",
    pct: 6,
    barStyle: { width: "6%", background: "linear-gradient(90deg, #94a3b8, #cbd5e1)" },
  },
];

type PipelineHealthProps = {
  stages?: PipelineStage[];
};

export function PipelineHealth({ stages = defaultStages }: PipelineHealthProps) {
  return (
    <section className="bo-card bo-span-6" aria-labelledby="pipeline-title">
      <h2 id="pipeline-title" className="bo-card-title">
        Pipeline health
      </h2>
      <p
        className="bo-page-sub"
        style={{ margin: "-0.5rem 0 1rem", fontSize: "var(--text-xs)" }}
      >
        Share of open applications by stage (illustrative)
      </p>
      <div className="bo-pipeline-stages">
        {stages.map((row) => (
          <div key={row.name} className="bo-pipeline-row">
            <span className="bo-pipeline-name">{row.name}</span>
            <div className="bo-pipeline-bar-wrap" aria-hidden>
              <div
                className="bo-pipeline-bar"
                style={row.barStyle ?? { width: `${row.pct}%` }}
              />
            </div>
            <span className="bo-pipeline-pct">{row.pct}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
