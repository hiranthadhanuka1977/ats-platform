import { getApplicationStatusMeta } from "@ats-platform/types";
import { getApplicationStatusTone } from "@/lib/application-status-tone";

type Props = {
  status: string;
};

export function ApplicationStatusCallout({ status }: Props) {
  const meta = getApplicationStatusMeta(status);
  const tone = getApplicationStatusTone(status);

  return (
    <div
      className={`myapps-application-status myapps-application-status--${tone}`}
      role="status"
      aria-label={`Application status: ${meta.label}. ${meta.description}`}
    >
      <span className={`myapps-application-status-pill myapps-application-status-pill--${tone}`}>
        {meta.label}
      </span>
      <p className="myapps-application-status-desc">{meta.description}</p>
    </div>
  );
}
