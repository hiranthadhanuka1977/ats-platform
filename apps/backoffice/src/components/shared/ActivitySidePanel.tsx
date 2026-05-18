"use client";

import { useEffect } from "react";

export type ActivitySidePanelItem = {
  id: string;
  title: string;
  meta: string;
};

type Props = {
  open: boolean;
  title: string;
  ariaLabel: string;
  items: ActivitySidePanelItem[];
  emptyMessage?: string;
  onClose: () => void;
};

export function ActivitySidePanel({
  open,
  title,
  ariaLabel,
  items,
  emptyMessage = "No activity recorded yet.",
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bo-candidate-activity-overlay" onClick={onClose}>
      <aside
        className="bo-candidate-activity-panel"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bo-candidate-activity-head">
          <h2 className="bo-candidate-activity-title">{title}</h2>
          <button
            type="button"
            className="bo-candidate-activity-close"
            aria-label={`Close ${title.toLowerCase()} panel`}
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="m18.3 5.71-1.41-1.42L12 9.17 7.11 4.29 5.7 5.71 10.59 10.6 5.7 15.49l1.41 1.42L12 12l4.89 4.91 1.41-1.42-4.88-4.89 4.88-4.89Z"
              />
            </svg>
          </button>
        </div>
        <div className="bo-candidate-activity-body">
          {items.length === 0 ? (
            <p className="bo-admin-muted">{emptyMessage}</p>
          ) : (
            <ul className="bo-candidate-activity-list">
              {items.map((item) => (
                <li key={item.id}>
                  <p className="bo-candidate-activity-item-title">{item.title}</p>
                  <p className="bo-candidate-activity-item-meta">{item.meta}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
