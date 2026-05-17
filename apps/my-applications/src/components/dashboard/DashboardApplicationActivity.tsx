import Link from "next/link";
import { getApplicationStatusMeta } from "@ats-platform/types";
import { formatShortDate } from "@/lib/format";
import { getApplicationStatusTone } from "@/lib/application-status-tone";

export type DashboardApplicationActivityItem = {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  job: {
    slug: string;
    title: string;
  };
};

type Props = {
  items: DashboardApplicationActivityItem[];
};

export function DashboardApplicationActivity({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="myapps-dashboard-activity-empty">
        <p className="bo-page-sub">No application activity yet.</p>
        <Link href="/job-search" className="btn btn-primary btn-sm">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <ul className="myapps-dashboard-activity-list">
      {items.map((item) => {
        const meta = getApplicationStatusMeta(item.status);
        const tone = getApplicationStatusTone(item.status);
        return (
          <li key={item.id} className={`myapps-dashboard-activity-item myapps-dashboard-activity-item--${tone}`}>
            <div className="myapps-dashboard-activity-body">
              <Link href={`/jobs/${item.job.slug}`} className="myapps-dashboard-activity-title">
                {item.job.title}
              </Link>
              <p className="myapps-dashboard-activity-meta">Updated {formatShortDate(item.updatedAt)}</p>
            </div>
            <div className="myapps-dashboard-activity-status">
              <span className={`myapps-application-status-pill myapps-application-status-pill--${tone}`}>
                {meta.label}
              </span>
              <p className="myapps-dashboard-activity-status-desc">{meta.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
