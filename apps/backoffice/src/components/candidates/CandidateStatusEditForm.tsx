"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CandidateAccountStatus = "pending_verification" | "active" | "locked" | "disabled";

type CandidateStatusEditFormProps = {
  candidateId: string;
  candidateName: string;
  currentStatus: CandidateAccountStatus;
};

export function CandidateStatusEditForm({ candidateId, candidateName, currentStatus }: CandidateStatusEditFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<CandidateAccountStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/backoffice/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(payload.error?.message ?? "Failed to update candidate status.");
      }
      router.push("/candidates/all");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update candidate status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="bo-card bo-job-create-form" onSubmit={(event) => void onSubmit(event)}>
      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Edit candidate status</h2>
        <p className="bo-page-sub">Update status for {candidateName}.</p>
        {error ? (
          <div className="bo-admin-alert" role="alert">
            {error}
          </div>
        ) : null}
        <div className="bo-admin-form-grid">
          <div className="bo-field" style={{ maxWidth: 360 }}>
            <label className="bo-label" htmlFor="candidate-status">
              Status
            </label>
            <select
              id="candidate-status"
              className="bo-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as CandidateAccountStatus)}
            >
              <option value="pending_verification">New (pending verification)</option>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bo-admin-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? "Saving..." : "Save status"}
        </button>
        <Link href="/candidates/all" className="btn btn-secondary btn-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
