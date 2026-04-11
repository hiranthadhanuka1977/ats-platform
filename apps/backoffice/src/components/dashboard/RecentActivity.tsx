export type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  icon: "doc" | "calendar" | "check";
};

const defaultActivity: ActivityItem[] = [
  {
    id: "1",
    title: "New application — Senior Product Designer",
    meta: "Alex Morgan · 12 minutes ago",
    icon: "doc",
  },
  {
    id: "2",
    title: "Interview scheduled — Backend Engineer (Round 2)",
    meta: "Samira Patel · 1 hour ago",
    icon: "calendar",
  },
  {
    id: "3",
    title: "Offer accepted — Customer Success Lead",
    meta: "System · Yesterday",
    icon: "check",
  },
];

function ActivityIcon({ type }: { type: ActivityItem["icon"] }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24" as const };
  if (type === "doc") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type RecentActivityProps = {
  items?: ActivityItem[];
};

export function RecentActivity({ items = defaultActivity }: RecentActivityProps) {
  return (
    <section className="bo-card bo-span-6" aria-labelledby="activity-title">
      <h2 id="activity-title" className="bo-card-title">
        Recent activity
      </h2>
      <ul className="bo-activity-list">
        {items.map((item) => (
          <li key={item.id} className="bo-activity-item">
            <div className="bo-activity-icon" aria-hidden>
              <ActivityIcon type={item.icon} />
            </div>
            <div className="bo-activity-body">
              <div className="bo-activity-title">{item.title}</div>
              <div className="bo-activity-meta">{item.meta}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
