import Link from "next/link";

export type JourneyStep = {
  label: string;
  description: string;
  complete: boolean;
  actionHref: string;
  actionLabel: string;
  external?: boolean;
};

type Props = {
  steps: JourneyStep[];
  completedCount: number;
  percentage: number;
};

function StepMarker({ complete, index }: { complete: boolean; index: number }) {
  if (complete) {
    return (
      <span className="myapps-journey-marker" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.5 8.2 6.4 11l6.1-6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="myapps-journey-marker" aria-hidden>
      {index + 1}
    </span>
  );
}

export function DashboardJourneySteps({ steps, completedCount, percentage }: Props) {
  const currentIndex = steps.findIndex((s) => !s.complete);

  return (
    <div className="myapps-journey">
      <div className="myapps-journey-progress" aria-label="Onboarding progress">
        <div className="myapps-journey-progress-top">
          <span className="myapps-journey-progress-label">Overall progress</span>
          <span className="myapps-journey-progress-value">
            {completedCount} of {steps.length} · {percentage}%
          </span>
        </div>
        <div
          className="myapps-journey-progress-bar"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="myapps-journey-progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <ol className="myapps-journey-track">
        {steps.map((step, index) => {
          const isCurrent = !step.complete && index === currentIndex;
          const state = step.complete ? "complete" : isCurrent ? "current" : "pending";
          return (
            <li
              key={step.label}
              className={`myapps-journey-step myapps-journey-step--${state}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="myapps-journey-step-rail">
                <StepMarker complete={step.complete} index={index} />
                {index < steps.length - 1 ? <span className="myapps-journey-connector" aria-hidden /> : null}
              </div>
              <article className="myapps-journey-step-panel">
                <p className="myapps-journey-step-kicker">
                  Step {index + 1}
                  {step.complete ? " · Done" : isCurrent ? " · Up next" : ""}
                </p>
                <h3 className="myapps-journey-step-title">{step.label}</h3>
                <p className="myapps-journey-step-desc">{step.description}</p>
                {step.external ? (
                  <a
                    className={`btn btn-sm myapps-journey-step-btn ${isCurrent ? "btn-primary" : "btn-secondary"}`}
                    href={step.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {step.actionLabel}
                  </a>
                ) : (
                  <Link
                    className={`btn btn-sm myapps-journey-step-btn ${isCurrent ? "btn-primary" : "btn-secondary"}`}
                    href={step.actionHref}
                  >
                    {step.actionLabel}
                  </Link>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
