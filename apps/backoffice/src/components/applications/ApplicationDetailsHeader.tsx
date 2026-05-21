"use client";

import { useState, type ReactNode } from "react";
import { ActivitySidePanel, type ActivitySidePanelItem } from "@/components/shared/ActivitySidePanel";
import { ApplicationDetailsActionsMenu } from "@/components/applications/ApplicationDetailsActionsMenu";

type Props = {
  applicationId: string;
  status: string;
  hasScheduledInterview?: boolean;
  candidateName: string;
  candidateEmail: string;
  candidateTimeZone?: string | null;
  jobTitle: string;
  title: string;
  subtitle: ReactNode;
  activityItems: ActivitySidePanelItem[];
};

export function ApplicationDetailsHeader({
  applicationId,
  status,
  hasScheduledInterview = false,
  candidateName,
  candidateEmail,
  candidateTimeZone = null,
  jobTitle,
  title,
  subtitle,
  activityItems,
}: Props) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <>
      <div className="bo-page-header-actions">
        <div>
          <h1 className="bo-page-title">{title}</h1>
          <p className="bo-page-sub">{subtitle}</p>
          {actionError ? (
            <p className="bo-login-error" role="alert" style={{ marginTop: "0.5rem" }}>
              {actionError}
            </p>
          ) : null}
          {actionFeedback && !actionError ? (
            <p className="myapps-linkedin-note" role="status" style={{ marginTop: "0.5rem" }}>
              {actionFeedback}
            </p>
          ) : null}
        </div>
        <div className="bo-application-header-toolbar">
          <button
            type="button"
            className="bo-page-actions-trigger bo-candidate-activity-trigger"
            aria-label="Open application status history"
            aria-expanded={activityOpen}
            onClick={() => setActivityOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5v4l5-4-5-4v2Zm-1 5h2v5h4v2h-6V8Z"
              />
            </svg>
          </button>
          <ApplicationDetailsActionsMenu
            applicationId={applicationId}
            status={status}
            hasScheduledInterview={hasScheduledInterview}
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            candidateTimeZone={candidateTimeZone}
            jobTitle={jobTitle}
            onFeedback={setActionFeedback}
            onError={setActionError}
          />
        </div>
      </div>

      <ActivitySidePanel
        open={activityOpen}
        title="Status history"
        ariaLabel="Application status history"
        items={activityItems}
        emptyMessage="No status changes recorded for this application yet."
        onClose={() => setActivityOpen(false)}
      />
    </>
  );
}
