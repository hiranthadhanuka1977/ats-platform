"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduleInterviewModal } from "@/components/applications/ScheduleInterviewModal";
import {
  getApplicationActionsForStatus,
  type ApplicationActionDefinition,
  type ApplicationActionId,
} from "@/config/application-status-actions";

type Props = {
  applicationId: string;
  status: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  onFeedback?: (message: string | null) => void;
  onError?: (message: string | null) => void;
};

function ActionIcon({ actionId }: { actionId: ApplicationActionId }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": true as const };
  if (actionId === "schedule_interview") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 4a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 6Zm2 12h-4v-1h1v-4h-1v-1h3v5h1v1Z"
      />
    </svg>
  );
}

export function ApplicationDetailsActionsMenu({
  applicationId,
  status,
  candidateName,
  candidateEmail,
  jobTitle,
  onFeedback,
  onError,
}: Props) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [busyActionId, setBusyActionId] = useState<ApplicationActionId | null>(null);

  const actions = getApplicationActionsForStatus(status);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function runAction(action: ApplicationActionDefinition) {
    setMenuOpen(false);
    onError?.(null);
    onFeedback?.(null);

    if (action.opensScheduleModal) {
      setScheduleModalOpen(true);
      return;
    }

    setBusyActionId(action.id);

    try {
      if (action.nextStatus) {
        const res = await fetch(`/api/backoffice/applications/${applicationId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action.nextStatus }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        if (!res.ok) {
          onError?.(json.error?.message ?? "Could not update application status.");
          return;
        }
        onFeedback?.(`${action.label} — application status updated.`);
        router.refresh();
        return;
      }

      onFeedback?.(`${action.label} — follow-up noted for this candidate.`);
    } catch {
      onError?.("Something went wrong. Please try again.");
    } finally {
      setBusyActionId(null);
    }
  }

  function handleScheduled(message: string) {
    setScheduleModalOpen(false);
    onFeedback?.(message);
    router.refresh();
  }

  if (actions.length === 0) return null;

  return (
    <>
      <div className="bo-page-actions-menu bo-application-actions-menu" ref={menuRef}>
        <button
          type="button"
          className="bo-page-actions-trigger"
          aria-label="Application actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={busyActionId !== null || scheduleModalOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          </svg>
        </button>
        {menuOpen ? (
          <div className="bo-page-actions-dropdown bo-application-actions-dropdown" role="menu">
            <ul>
              {actions.map((action) => (
                <li key={action.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`bo-candidate-menu-item${action.id === "schedule_interview" ? " bo-candidate-menu-item--primary" : ""}`}
                    disabled={busyActionId !== null}
                    onClick={() => void runAction(action)}
                  >
                    <span className="bo-candidate-menu-icon">
                      <ActionIcon actionId={action.id} />
                    </span>
                    {busyActionId === action.id ? "Working…" : action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        applicationId={applicationId}
        candidateName={candidateName}
        candidateEmail={candidateEmail}
        jobTitle={jobTitle}
        onClose={() => setScheduleModalOpen(false)}
        onScheduled={handleScheduled}
        onError={(message) => onError?.(message)}
      />
    </>
  );
}
