export type StatItem = {
  id: string;
  value: string;
  label: string;
  delta: string;
  deltaVariant: "up" | "down";
};

const defaultStats: StatItem[] = [
  {
    id: "adverts",
    value: "42",
    label: "Active adverts",
    delta: "+3 vs. last week",
    deltaVariant: "up",
  },
  {
    id: "candidates",
    value: "1,284",
    label: "Total candidates",
    delta: "+12% vs. last month",
    deltaVariant: "up",
  },
  {
    id: "pending",
    value: "86",
    label: "Pending applications",
    delta: "−4% vs. last week",
    deltaVariant: "down",
  },
];

type StatRowProps = {
  stats?: StatItem[];
};

export function StatRow({ stats = defaultStats }: StatRowProps) {
  return (
    <div className="bo-span-7">
      <div className="bo-stat-row">
        {stats.map((s) => (
          <div
            key={s.id}
            className="bo-stat"
            role="group"
            aria-labelledby={`stat-val-${s.id} stat-label-${s.id}`}
          >
            <div className="bo-stat-value" id={`stat-val-${s.id}`}>
              {s.value}
            </div>
            <div className="bo-stat-label" id={`stat-label-${s.id}`}>
              {s.label}
            </div>
            <div className={`bo-stat-delta bo-stat-delta--${s.deltaVariant}`}>{s.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
