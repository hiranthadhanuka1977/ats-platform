"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconMoreVertical } from "@/components/backoffice/nav-icons";
import { useCloseDetailsOnOutsideAndEscape } from "@/hooks/useCloseDetailsOnOutsideAndEscape";

type Props = {
  jobId: string;
  jobTitle: string;
};

export function JobEditActionsMenu({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [deleting, setDeleting] = useState(false);
  useCloseDetailsOnOutsideAndEscape(detailsRef);

  function closeMenu() {
    const el = detailsRef.current;
    if (el) el.open = false;
  }

  async function handleDelete() {
    closeMenu();
    const label = jobTitle.trim() || "this job";
    if (
      !window.confirm(
        `Delete “${label}”? This permanently removes the job listing and cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/backoffice/jobs/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(j?.error?.message ?? res.statusText);
      }
      router.push("/jobs");
      router.refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not delete this job.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <details ref={detailsRef} className="bo-page-actions-menu">
      <summary aria-label="More job actions" aria-haspopup="menu" title="More actions">
        <IconMoreVertical />
      </summary>
      <nav className="bo-page-actions-dropdown" aria-label="Job actions">
        <ul>
          <li>
            <button
              type="button"
              className="bo-page-actions-danger"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? "Deleting…" : "Delete job"}
            </button>
          </li>
        </ul>
      </nav>
    </details>
  );
}
