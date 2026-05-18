import { getApplicationStatusMeta } from "@ats-platform/types";
import { formatActivityTime } from "@/lib/format-activity-time";

export type ApplicationStatusActivityItem = {
  id: string;
  title: string;
  meta: string;
};

export type ApplicationStatusEventRow = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: Date | string;
  changedByStaff: { name: string } | null;
};

function normalizeStatusKey(status: string): string {
  return status === "interview" ? "interview_scheduled" : status;
}

export function toApplicationStatusActivityItems(
  events: ApplicationStatusEventRow[],
): ApplicationStatusActivityItem[] {
  return events.map((event) => {
    const toMeta = getApplicationStatusMeta(normalizeStatusKey(event.toStatus));
    const actor = event.changedByStaff?.name?.trim();
    const timeLabel = formatActivityTime(event.changedAt);
    const meta = actor ? `${actor} · ${timeLabel}` : timeLabel;

    if (!event.fromStatus) {
      return {
        id: event.id,
        title: `Application submitted — ${toMeta.label}`,
        meta,
      };
    }

    const fromMeta = getApplicationStatusMeta(normalizeStatusKey(event.fromStatus));
    return {
      id: event.id,
      title: `Status changed from ${fromMeta.label} to ${toMeta.label}`,
      meta,
    };
  });
}
