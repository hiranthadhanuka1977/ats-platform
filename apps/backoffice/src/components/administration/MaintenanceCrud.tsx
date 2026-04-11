"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MAINTENANCE_SECTIONS,
  type MaintenanceSectionId,
} from "./maintenance-config";
import { AdministrationSectionIntro } from "./AdministrationSectionIntro";

type Row = Record<string, unknown>;

const ADD_LABEL: Record<MaintenanceSectionId, string> = {
  departments: "Add department",
  locations: "Add location",
  "employment-types": "Add employment type",
  "experience-levels": "Add experience level",
  skills: "Add skill",
  tags: "Add tag",
  benefits: "Add benefit",
};

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string; code?: string } };
    return j?.error?.message ?? j?.error?.code ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

function getDefaultForm(section: MaintenanceSectionId): Record<string, unknown> {
  switch (section) {
    case "departments":
      return { name: "", slug: "", isActive: true, sortOrder: 0 };
    case "locations":
      return { city: "", country: "", slug: "", isActive: true, sortOrder: 0 };
    case "employment-types":
      return { name: "", slug: "", sortOrder: 0, isActive: true };
    case "experience-levels":
      return { name: "", slug: "", minYears: 0, sortOrder: 0, isActive: true };
    case "skills":
      return { name: "", isActive: true };
    case "tags":
      return { name: "", variant: "primary", sortOrder: 0, isActive: true };
    case "benefits":
      return { description: "", sortOrder: 0, isActive: true };
    default:
      return {};
  }
}

function rowToForm(section: MaintenanceSectionId, row: Row): Record<string, unknown> {
  switch (section) {
    case "departments":
      return {
        name: String(row.name ?? ""),
        slug: String(row.slug ?? ""),
        isActive: Boolean(row.isActive),
        sortOrder: Number(row.sortOrder ?? 0),
      };
    case "locations":
      return {
        city: String(row.city ?? ""),
        country: String(row.country ?? ""),
        slug: String(row.slug ?? ""),
        isActive: Boolean(row.isActive),
        sortOrder: Number(row.sortOrder ?? 0),
      };
    case "employment-types":
      return {
        name: String(row.name ?? ""),
        slug: String(row.slug ?? ""),
        sortOrder: Number(row.sortOrder ?? 0),
        isActive: rowIsActive(row),
      };
    case "experience-levels":
      return {
        name: String(row.name ?? ""),
        slug: String(row.slug ?? ""),
        minYears: Number(row.minYears ?? 0),
        sortOrder: Number(row.sortOrder ?? 0),
        isActive: rowIsActive(row),
      };
    case "skills":
      return { name: String(row.name ?? ""), isActive: rowIsActive(row) };
    case "tags":
      return {
        name: String(row.name ?? ""),
        variant: String(row.variant ?? "primary"),
        sortOrder: Number(row.sortOrder ?? 0),
        isActive: rowIsActive(row),
      };
    case "benefits":
      return {
        description: String(row.description ?? ""),
        sortOrder: Number(row.sortOrder ?? 0),
        isActive: rowIsActive(row),
      };
    default:
      return {};
  }
}

function formToPayload(section: MaintenanceSectionId, form: Record<string, unknown>): Record<string, unknown> {
  switch (section) {
    case "departments":
      return {
        name: String(form.name ?? "").trim(),
        slug: String(form.slug ?? "").trim(),
        isActive: Boolean(form.isActive),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
      };
    case "locations":
      return {
        city: String(form.city ?? "").trim(),
        country: String(form.country ?? "").trim(),
        slug: String(form.slug ?? "").trim(),
        isActive: Boolean(form.isActive),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
      };
    case "employment-types":
      return {
        name: String(form.name ?? "").trim(),
        slug: String(form.slug ?? "").trim(),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
        isActive: Boolean(form.isActive),
      };
    case "experience-levels":
      return {
        name: String(form.name ?? "").trim(),
        slug: String(form.slug ?? "").trim(),
        minYears: Math.max(0, Math.trunc(Number(form.minYears) || 0)),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
        isActive: Boolean(form.isActive),
      };
    case "skills":
      return { name: String(form.name ?? "").trim(), isActive: Boolean(form.isActive) };
    case "tags":
      return {
        name: String(form.name ?? "").trim(),
        variant: String(form.variant ?? "primary"),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
        isActive: Boolean(form.isActive),
      };
    case "benefits":
      return {
        description: String(form.description ?? "").trim(),
        sortOrder: Math.trunc(Number(form.sortOrder) || 0),
        isActive: Boolean(form.isActive),
      };
    default:
      return {};
  }
}

function rowJobPostingCount(row: Row): number {
  const n = row.jobPostingCount;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function rowIsActive(row: Row): boolean {
  return row.isActive !== false;
}

function rowLabel(section: MaintenanceSectionId, row: Row): string {
  switch (section) {
    case "locations": {
      const parts = [row.city, row.country].map((v) => String(v ?? "").trim()).filter(Boolean);
      return parts.join(", ") || `Record #${row.id}`;
    }
    case "departments":
    case "employment-types":
    case "experience-levels":
    case "skills":
    case "tags":
      return String(row.name ?? "").trim() || `Record #${row.id}`;
    case "benefits":
      return String(row.description ?? "").trim() || `Record #${row.id}`;
    default:
      return `Record #${row.id}`;
  }
}

export function MaintenanceCrud({
  section,
  contentSummary,
  bodyMarkdown,
}: {
  section: MaintenanceSectionId;
  contentSummary: string;
  bodyMarkdown: string;
}) {
  const cfg = MAINTENANCE_SECTIONS[section];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  type RowActionKind = "delete" | "archive" | "restore";
  const [pendingRowAction, setPendingRowAction] = useState<{
    kind: RowActionKind;
    id: number;
    label: string;
  } | null>(null);
  const [rowActionSubmitting, setRowActionSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(cfg.apiPath, { credentials: "include" });
      if (!res.ok) throw new Error(await parseError(res));
      const data = (await res.json()) as Row[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [cfg.apiPath]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setMode("idle");
    setEditingId(null);
    setForm({});
    setPendingRowAction(null);
  }, [section]);

  useEffect(() => {
    if (!pendingRowAction) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!rowActionSubmitting) setPendingRowAction(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [pendingRowAction, rowActionSubmitting]);

  function setField(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setMode("create");
    setForm(getDefaultForm(section));
    setError(null);
  }

  function openEdit(row: Row) {
    const id = Number(row.id);
    setEditingId(id);
    setMode("edit");
    setForm(rowToForm(section, row));
    setError(null);
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(section, form);
      if (mode === "create") {
        const res = await fetch(cfg.apiPath, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await parseError(res));
      } else if (mode === "edit" && editingId != null) {
        const res = await fetch(`${cfg.apiPath}/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await parseError(res));
      }
      setMode("idle");
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(row: Row) {
    const id = Number(row.id);
    setPendingRowAction({ kind: "delete", id, label: rowLabel(section, row) });
    setError(null);
  }

  function requestArchive(row: Row) {
    const id = Number(row.id);
    setPendingRowAction({ kind: "archive", id, label: rowLabel(section, row) });
    setError(null);
  }

  function requestRestore(row: Row) {
    const id = Number(row.id);
    setPendingRowAction({ kind: "restore", id, label: rowLabel(section, row) });
    setError(null);
  }

  function cancelRowAction() {
    if (rowActionSubmitting) return;
    setPendingRowAction(null);
  }

  async function confirmRowAction() {
    if (pendingRowAction == null) return;
    const { kind, id } = pendingRowAction;
    setRowActionSubmitting(true);
    setError(null);
    try {
      if (kind === "delete") {
        const res = await fetch(`${cfg.apiPath}/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
      } else {
        const res = await fetch(`${cfg.apiPath}/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: kind === "restore" }),
        });
        if (!res.ok) throw new Error(await parseError(res));
      }
      setPendingRowAction(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setPendingRowAction(null);
    } finally {
      setRowActionSubmitting(false);
    }
  }

  const formBusy = mode !== "idle";

  return (
    <>
      {pendingRowAction && (
        <div className="bo-modal-backdrop" role="presentation" onClick={cancelRowAction}>
          <div
            className="bo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bo-row-action-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="bo-row-action-dialog-title" className="bo-modal-title">
              {pendingRowAction.kind === "delete" && "Delete this record?"}
              {pendingRowAction.kind === "archive" && "Archive this record?"}
              {pendingRowAction.kind === "restore" && "Restore this record?"}
            </h2>
            {pendingRowAction.kind === "delete" ? (
              <p className="bo-modal-warning" role="alert">
                <strong>Warning:</strong> This action cannot be undone. Deletion is only allowed when no job postings
                reference this value.
              </p>
            ) : pendingRowAction.kind === "archive" ? (
              <p className="bo-modal-body">
                This value is used on job postings. It will be hidden from new job forms but existing postings keep
                their data.
              </p>
            ) : (
              <p className="bo-modal-body">This record will be active again and available when creating or editing job postings.</p>
            )}
            <p className="bo-modal-body">
              {pendingRowAction.kind === "delete" && (
                <>
                  Are you sure you want to delete <strong>{pendingRowAction.label}</strong>?
                </>
              )}
              {pendingRowAction.kind === "archive" && (
                <>
                  Archive <strong>{pendingRowAction.label}</strong>?
                </>
              )}
              {pendingRowAction.kind === "restore" && (
                <>
                  Restore <strong>{pendingRowAction.label}</strong>?
                </>
              )}
            </p>
            <div className="bo-modal-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={cancelRowAction} disabled={rowActionSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                className={
                  pendingRowAction.kind === "delete" ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"
                }
                onClick={() => void confirmRowAction()}
                disabled={rowActionSubmitting}
              >
                {rowActionSubmitting
                  ? pendingRowAction.kind === "delete"
                    ? "Deleting…"
                    : "Saving…"
                  : pendingRowAction.kind === "delete"
                    ? "Delete"
                    : pendingRowAction.kind === "archive"
                      ? "Archive"
                      : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bo-admin-header">
        <h1 className="bo-page-title bo-admin-section-heading">{cfg.title}</h1>
        <AdministrationSectionIntro summary={contentSummary} bodyMarkdown={bodyMarkdown} />
      </header>

      {error && (
        <div className="bo-admin-alert" role="alert">
          {error}
        </div>
      )}

      <div className="bo-admin-toolbar">
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate} disabled={formBusy}>
          {ADD_LABEL[section]}
        </button>
      </div>

      {formBusy && (
        <div className="bo-card bo-admin-form-card">
          <h2 className="bo-card-title">{mode === "create" ? "New record" : "Edit record"}</h2>
          <MaintenanceForm section={section} form={form} setField={setField} />
          <div className="bo-admin-form-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void submit()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setMode("idle");
                setEditingId(null);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bo-card bo-admin-table-wrap">
        {loading ? (
          <p className="bo-admin-muted">Loading…</p>
        ) : (
          <MaintenanceTable
            section={section}
            rows={rows}
            onEdit={openEdit}
            onDelete={requestDelete}
            onArchive={requestArchive}
            onRestore={requestRestore}
          />
        )}
      </div>
    </>
  );
}

function MaintenanceForm({
  section,
  form,
  setField,
}: {
  section: MaintenanceSectionId;
  form: Record<string, unknown>;
  setField: (key: string, value: unknown) => void;
}) {
  const input = (id: string, label: string, value: string, type: "text" | "number" = "text") => (
    <div className="bo-field" key={id}>
      <label className="bo-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="bo-input"
        type={type}
        value={value}
        onChange={(e) => {
          if (type === "number") {
            const v = e.target.value;
            setField(id, v === "" ? 0 : Number.parseInt(v, 10) || 0);
          } else {
            setField(id, e.target.value);
          }
        }}
      />
    </div>
  );

  switch (section) {
    case "departments":
      return (
        <div className="bo-admin-form-grid">
          {input("name", "Name", String(form.name ?? ""))}
          {input("slug", "Slug (optional)", String(form.slug ?? ""))}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
        </div>
      );
    case "locations":
      return (
        <div className="bo-admin-form-grid">
          {input("city", "City", String(form.city ?? ""))}
          {input("country", "Country", String(form.country ?? ""))}
          {input("slug", "Slug (optional)", String(form.slug ?? ""))}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
        </div>
      );
    case "employment-types":
      return (
        <div className="bo-admin-form-grid">
          {input("name", "Name", String(form.name ?? ""))}
          {input("slug", "Slug (optional)", String(form.slug ?? ""))}
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      );
    case "experience-levels":
      return (
        <div className="bo-admin-form-grid">
          {input("name", "Name", String(form.name ?? ""))}
          {input("slug", "Slug (optional)", String(form.slug ?? ""))}
          {input("minYears", "Minimum years", String(form.minYears ?? ""), "number")}
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      );
    case "skills":
      return (
        <div className="bo-admin-form-grid">
          {input("name", "Name", String(form.name ?? ""))}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      );
    case "tags":
      return (
        <div className="bo-admin-form-grid">
          {input("name", "Name", String(form.name ?? ""))}
          <div className="bo-field">
            <label className="bo-label" htmlFor="variant">
              Variant
            </label>
            <select
              id="variant"
              className="bo-input"
              value={String(form.variant ?? "primary")}
              onChange={(e) => setField("variant", e.target.value)}
            >
              <option value="primary">primary</option>
              <option value="accent">accent</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
            </select>
          </div>
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      );
    case "benefits":
      return (
        <div className="bo-admin-form-grid">
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="benefit-description">
              Description
            </label>
            <textarea
              id="benefit-description"
              className="bo-input"
              rows={3}
              maxLength={255}
              value={String(form.description ?? "")}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>
          {input("sortOrder", "Sort order", String(form.sortOrder ?? ""), "number")}
          <div className="bo-field">
            <label className="bo-label bo-label--inline">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function MaintenanceTable({
  section,
  rows,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: {
  section: MaintenanceSectionId;
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
  onArchive: (row: Row) => void;
  onRestore: (row: Row) => void;
}) {
  if (rows.length === 0) {
    return <p className="bo-admin-muted">No records yet. Add one to get started.</p>;
  }

  function DestructiveOrArchiveButton({ row }: { row: Row }) {
    const count = rowJobPostingCount(row);
    const active = rowIsActive(row);
    if (count > 0 && active) {
      return (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onArchive(row)}>
          Archive
        </button>
      );
    }
    if (count > 0 && !active) {
      return (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onRestore(row)}>
          Restore
        </button>
      );
    }
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onDelete(row)}>
        Delete
      </button>
    );
  }

  const inUseCell = (row: Row) => <td>{rowJobPostingCount(row) > 0 ? "Yes" : "No"}</td>;

  return (
    <div className="bo-admin-table-scroll">
      <table className="bo-admin-table">
        <thead>
          <tr>
            {section === "departments" && (
              <>
                <th>Name</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Sort</th>
                <th>In use</th>
              </>
            )}
            {section === "locations" && (
              <>
                <th>City</th>
                <th>Country</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Sort</th>
                <th>In use</th>
              </>
            )}
            {section === "employment-types" && (
              <>
                <th>Name</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Active</th>
                <th>In use</th>
              </>
            )}
            {section === "experience-levels" && (
              <>
                <th>Name</th>
                <th>Slug</th>
                <th>Min years</th>
                <th>Sort</th>
                <th>Active</th>
                <th>In use</th>
              </>
            )}
            {section === "skills" && (
              <>
                <th>Name</th>
                <th>Active</th>
                <th>In use</th>
              </>
            )}
            {section === "tags" && (
              <>
                <th>Name</th>
                <th>Variant</th>
                <th>Sort</th>
                <th>Active</th>
                <th>In use</th>
              </>
            )}
            {section === "benefits" && (
              <>
                <th>Description</th>
                <th>Sort</th>
                <th>Active</th>
                <th>In use</th>
              </>
            )}
            <th className="bo-admin-table-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = Number(row.id);
            return (
              <tr key={id}>
                {section === "departments" && (
                  <>
                    <td>{String(row.name ?? "")}</td>
                    <td>
                      <code className="bo-admin-code">{String(row.slug ?? "")}</code>
                    </td>
                    <td>{row.isActive ? "Yes" : "No"}</td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "locations" && (
                  <>
                    <td>{String(row.city ?? "")}</td>
                    <td>{String(row.country ?? "")}</td>
                    <td>
                      <code className="bo-admin-code">{String(row.slug ?? "")}</code>
                    </td>
                    <td>{row.isActive ? "Yes" : "No"}</td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "employment-types" && (
                  <>
                    <td>{String(row.name ?? "")}</td>
                    <td>
                      <code className="bo-admin-code">{String(row.slug ?? "")}</code>
                    </td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    <td>{rowIsActive(row) ? "Yes" : "No"}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "experience-levels" && (
                  <>
                    <td>{String(row.name ?? "")}</td>
                    <td>
                      <code className="bo-admin-code">{String(row.slug ?? "")}</code>
                    </td>
                    <td>{String(row.minYears ?? "")}</td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    <td>{rowIsActive(row) ? "Yes" : "No"}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "skills" && (
                  <>
                    <td>{String(row.name ?? "")}</td>
                    <td>{rowIsActive(row) ? "Yes" : "No"}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "tags" && (
                  <>
                    <td>{String(row.name ?? "")}</td>
                    <td>
                      <span className="bo-admin-pill">{String(row.variant ?? "")}</span>
                    </td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    <td>{rowIsActive(row) ? "Yes" : "No"}</td>
                    {inUseCell(row)}
                  </>
                )}
                {section === "benefits" && (
                  <>
                    <td>{String(row.description ?? "")}</td>
                    <td>{String(row.sortOrder ?? "")}</td>
                    <td>{rowIsActive(row) ? "Yes" : "No"}</td>
                    {inUseCell(row)}
                  </>
                )}
                <td className="bo-admin-table-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(row)}>
                    Edit
                  </button>{" "}
                  <DestructiveOrArchiveButton row={row} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
