/**
 * Generates portfolio/case-study/db-schema.html from schema.prisma + db-schema.md content.
 * Run: node portfolio/case-study/scripts/generate-db-schema-html.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const schemaPath = path.resolve(root, "../../packages/db/prisma/schema.prisma");
const outPath = path.join(root, "db-schema.html");

const schema = fs.readFileSync(schemaPath, "utf8");

const ENUMS = {};
for (const m of schema.matchAll(/^enum (\w+) \{([\s\S]*?)^\}/gm)) {
  ENUMS[m[1]] = m[2]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((v) => `<code>${v}</code>`)
    .join(", ");
}

function tableName(modelBlock, modelName) {
  const mapMatch = modelBlock.match(/@@map\("([^"]+)"\)/);
  return mapMatch ? mapMatch[1] : modelName.replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`).replace(/^_/, "");
}

function camelToSnake(s) {
  return s.replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`);
}

function parseDefault(rest) {
  if (rest.includes("@default(dbgenerated(")) return "DEFAULT gen_random_uuid()";
  if (rest.includes("@default(now())")) return "DEFAULT NOW()";
  if (rest.includes("@default(autoincrement())")) return "autoincrement";
  if (rest.includes("@default(true)")) return "DEFAULT true";
  if (rest.includes("@default(false)")) return "DEFAULT false";
  const m = rest.match(/@default\((\w+)\)/);
  return m ? `DEFAULT ${m[1]}` : null;
}

function parseField(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@")) return null;
  if (trimmed.includes("@relation")) return null;

  const match = trimmed.match(/^(\w+)\??\s+(\w+)\??(\[\])?(.*)$/);
  if (!match) return null;
  const [, name, rawType, isArray, rest] = match;
  if (isArray) return null;

  const optional = trimmed.includes(`${rawType}?`) || /\?\s/.test(trimmed.slice(trimmed.indexOf(rawType)));
  const mapMatch = rest.match(/@map\("([^"]+)"\)/);
  const colName = mapMatch ? mapMatch[1] : camelToSnake(name);

  const constraints = [];
  const notes = [];

  if (rest.includes("@id")) constraints.push("PK");
  if (rest.includes("@unique") && !rest.includes("@@unique")) constraints.push("UNIQUE");
  const def = parseDefault(rest);
  if (def) constraints.push(def);
  if (rest.includes("@updatedAt")) constraints.push("@updatedAt");

  if (rest.includes("@db.Uuid")) notes.push("UUID");
  if (optional && !rest.includes("@id")) notes.push("NULL");

  let sqlType = rawType.replace(/\?$/, "");
  const dbMatch = rest.match(/@db\.(\w+)(\([^)]*\))?/);
  if (dbMatch) {
    sqlType = dbMatch[1].toUpperCase() + (dbMatch[2] || "");
  } else if (sqlType === "String") sqlType = "VARCHAR/TEXT";
  else if (sqlType === "Int") sqlType = "INT";
  else if (sqlType === "Boolean") sqlType = "BOOLEAN";
  else if (sqlType === "DateTime") sqlType = "TIMESTAMPTZ";
  else if (sqlType === "Decimal") sqlType = "DECIMAL";
  else if (sqlType === "Json") sqlType = "JSONB";
  else if (ENUMS[sqlType]) {
    notes.unshift(`enum: ${ENUMS[sqlType]}`);
  }

  return {
    name: colName,
    type: sqlType,
    constraints: constraints.length ? constraints.join(", ") : optional ? "NULL" : "NOT NULL",
    notes: notes.length ? notes.join("; ") : "—",
  };
}

function parseModels(text) {
  const models = [];
  for (const m of text.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
    const modelName = m[1];
    const body = m[2];
    const tbl = tableName(body, modelName);
    const fields = body
      .split("\n")
      .map(parseField)
      .filter(Boolean);
    const indexes = [...body.matchAll(/^\s*(@@index\([^\n]+)/gm)].map((x) => x[1].trim());
    const uniques = [...body.matchAll(/^\s*(@@unique\([^\n]+)/gm)].map((x) => x[1].trim());
    const id = [...body.matchAll(/@@id\([^)]*\)/g)].map((x) => x[0]);
    models.push({ modelName, tbl, fields, indexes, uniques, compositeId: id });
  }
  return models;
}

const models = parseModels(schema);

const DOMAIN = {
  companies: "lookups",
  departments: "lookups",
  locations: "lookups",
  employment_types: "lookups",
  experience_types: "lookups",
  experience_levels: "lookups",
  skills: "lookups",
  benefits: "lookups",
  tags: "lookups",
  users: "staff",
  job_postings: "jobs",
  job_responsibilities: "jobs",
  job_qualifications: "jobs",
  job_posting_skills: "jobs",
  job_posting_benefits: "jobs",
  job_posting_tags: "jobs",
  candidate_accounts: "candidates",
  candidate_profiles: "candidates",
  candidate_auth_providers: "candidates",
  candidate_sessions: "candidates",
  candidate_verification_tokens: "candidates",
  candidate_password_reset_tokens: "candidates",
  candidate_cv_parses: "candidates",
  candidate_cv_educations: "candidates",
  candidate_cv_experiences: "candidates",
  candidate_cover_letters: "candidates",
  bookmarks: "engagement",
  applications: "applications",
  application_status_events: "applications",
  application_interviews: "applications",
};

function formatIndex(line) {
  const mapMatch = line.match(/map:\s*"([^"]+)"/);
  const name = mapMatch ? mapMatch[1] : line.replace(/@@index\(\[|\]\).*$/g, "").trim();
  return `<code>${name}</code>`;
}

function formatUnique(line) {
  const mapMatch = line.match(/map:\s*"([^"]+)"/);
  if (mapMatch) return `<code>${mapMatch[1]}</code>`;
  const fields = line.match(/@@unique\(\[([^\]]+)\]/);
  return fields ? `<code>UNIQUE (${fields[1]})</code>` : `<code>${line}</code>`;
}

function renderTable(model) {
  const { tbl, fields, indexes, uniques, compositeId } = model;
  const id = tbl.replace(/_/g, "-");
  let extra = "";
  if (compositeId.length) {
    extra += `<p class="db-table-meta"><strong>Composite PK:</strong> ${compositeId.join(", ")}</p>`;
  }
  if (uniques.length) {
    extra += `<p class="db-table-meta"><strong>Unique:</strong> ${uniques.map(formatUnique).join(", ")}</p>`;
  }
  if (indexes.length) {
    extra += `<p class="db-table-meta"><strong>Indexes:</strong> ${indexes.map(formatIndex).join(", ")}</p>`;
  }

  const rows = fields
    .map(
      (f) =>
        `<tr><td><code>${f.name}</code></td><td>${f.type}</td><td>${f.constraints}</td><td>${f.notes}</td></tr>`
    )
    .join("\n");

  return `
          <section class="db-table-block" id="${id}">
            <h3><code>${tbl}</code></h3>
            ${extra}
            <div class="ia-table-wrap">
              <table class="ia-table db-schema-table">
                <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Notes</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </section>`;
}

const byDomain = {
  lookups: [],
  jobs: [],
  candidates: [],
  applications: [],
  staff: [],
  engagement: [],
};

for (const m of models) {
  const d = DOMAIN[m.tbl] || "other";
  if (byDomain[d]) byDomain[d].push(m);
}

const tocLookups = byDomain.lookups.map((m) => `<li><a href="#${m.tbl.replace(/_/g, "-")}"><code>${m.tbl}</code></a></li>`).join("\n");
const tocJobs = byDomain.jobs.map((m) => `<li><a href="#${m.tbl.replace(/_/g, "-")}"><code>${m.tbl}</code></a></li>`).join("\n");
const tocCandidates = byDomain.candidates.map((m) => `<li><a href="#${m.tbl.replace(/_/g, "-")}"><code>${m.tbl}</code></a></li>`).join("\n");
const tocApps = byDomain.applications.map((m) => `<li><a href="#${m.tbl.replace(/_/g, "-")}"><code>${m.tbl}</code></a></li>`).join("\n");

const enumRows = Object.entries(ENUMS)
  .map(([name, vals]) => `<tr><td><code>${name}</code></td><td>${vals}</td></tr>`)
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Database Schema — TalentHub Case Study</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header scrolled">
    <div class="container header-inner">
      <a href="index.html" class="wordmark">TalentHub <span class="wordmark-sub">Case Study</span></a>
      <nav class="header-nav" aria-label="Page sections">
        <a href="index.html#context">Context</a>
        <a href="index.html#research">Research</a>
        <a href="index.html#approach">Approach</a>
        <a href="index.html#solution">Solution</a>
        <a href="index.html#impact">Impact</a>
        <a href="appendix.html">Artifacts</a>
      </nav>
      <button type="button" class="menu-btn" aria-label="Open menu" aria-expanded="false">Menu</button>
    </div>
  </header>

  <main>
    <div class="page-hero">
      <div class="container">
        <a href="appendix.html" class="back-link">← Back to artifacts</a>
        <h1>Database schema</h1>
        <p>Complete PostgreSQL relational model — ${models.length} tables, generated from <code>packages/db/prisma/schema.prisma</code>.</p>
      </div>
    </div>

    <div class="container ia-doc">
      <div class="ia-doc-layout">
        <nav class="ia-toc ia-toc-wide" aria-label="On this page">
          <h2>On this page</h2>
          <ol>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#er-map">ER map</a></li>
            <li><a href="#inventory">Table inventory</a></li>
            <li><a href="#lookups">Lookups</a>
              <ol>${tocLookups}</ol>
            </li>
            <li><a href="#jobs">Jobs</a>
              <ol>${tocJobs}</ol>
            </li>
            <li><a href="#candidates">Candidates</a>
              <ol>${tocCandidates}</ol>
            </li>
            <li><a href="#applications-domain">Applications</a>
              <ol>${tocApps}</ol>
            </li>
            <li><a href="#users">Staff</a></li>
            <li><a href="#bookmarks">Bookmarks</a></li>
            <li><a href="#enums">Enums</a></li>
            <li><a href="#indexes">Indexes &amp; constraints</a></li>
            <li><a href="#ui-mapping">UI mapping</a></li>
            <li><a href="#queries">Sample queries</a></li>
            <li><a href="#prisma">Prisma notes</a></li>
            <li><a href="#decisions">Design decisions</a></li>
            <li><a href="#related">Related docs</a></li>
          </ol>
        </nav>

        <article>
          <div class="ia-meta">
            <span>db-schema v1.9 · ${models.length} tables</span>
            <span>19 May 2026 · As-built</span>
            <span>@ats-platform/db</span>
          </div>

          <p class="db-intro">Canonical source: <code>packages/db/prisma/schema.prisma</code>. Human-readable companion: <a href="../../docs/specification/db-schema.md">db-schema.md</a>. Interactive ER: <a href="../../docs/specification/er-diagram.html">er-diagram.html</a>. Related: <a href="product-requirements.html">PRD</a> · <a href="api-dictionary.html">API dictionary</a>.</p>

          <section class="ia-section" id="overview">
            <h2>Overview</h2>
            <p>TalentHub persists jobs, candidates, applications, and staff data in <strong>PostgreSQL</strong>. All runtime apps import the shared Prisma client from <code>@ats-platform/db</code>.</p>
            <ul class="research-checklist">
              <li>Migrations: <code>npm run db:migrate</code> from repo root</li>
              <li>JSON API bodies use <strong>camelCase</strong>; columns map to snake_case via Prisma <code>@map</code></li>
              <li>File uploads stored under <code>storage/cvs/{candidateAccountId}/</code> and <code>storage/cover-letters/{candidateAccountId}/</code></li>
              <li>Legacy monolithic <code>candidates</code> table removed — use <code>candidate_accounts</code> + <code>candidate_profiles</code></li>
            </ul>
          </section>

          <section class="ia-section" id="er-map">
            <h2>Entity relationship map</h2>
            <pre class="ia-shell db-er">companies ────────┐
departments ──────┤
locations ────────├──▶ job_postings
employment_types ─┤         │
experience_levels ┘         ├──▶ job_responsibilities / job_qualifications
                            ├──▶ job_posting_skills ──▶ skills
                            ├──▶ job_posting_benefits ──▶ benefits
                            ├──▶ job_posting_tags ──▶ tags
                            ├──▶ applications ◀── candidate_accounts
                            └──▶ bookmarks ◀── candidate_accounts

candidate_accounts ──▶ candidate_profiles
                   ├──▶ auth providers / sessions / tokens
                   ├──▶ candidate_cv_parses ──▶ educations &amp; experience
                   ├──▶ candidate_cover_letters
                   └──▶ applications ──▶ application_status_events
                                      └──▶ application_interviews (1:1)

users ──▶ job_postings (created_by)
      └──▶ status events &amp; interviews (staff actions)</pre>
            <p class="ia-note">Job detail poster: <code>job_postings.banner_image_url</code> + <code>banner_image_alt</code> → <code>.image-banner</code> on job detail.</p>
          </section>

          <section class="ia-section" id="inventory">
            <h2>Table inventory</h2>
            <div class="db-domain-grid">
              <div class="db-domain-card"><h3>Lookups (${byDomain.lookups.length})</h3><p>${byDomain.lookups.map((m) => `<code>${m.tbl}</code>`).join(", ")}</p></div>
              <div class="db-domain-card"><h3>Jobs (${byDomain.jobs.length})</h3><p>${byDomain.jobs.map((m) => `<code>${m.tbl}</code>`).join(", ")}</p></div>
              <div class="db-domain-card"><h3>Candidates (${byDomain.candidates.length})</h3><p>${byDomain.candidates.map((m) => `<code>${m.tbl}</code>`).join(", ")}</p></div>
              <div class="db-domain-card"><h3>Applications (${byDomain.applications.length})</h3><p>${byDomain.applications.map((m) => `<code>${m.tbl}</code>`).join(", ")}</p></div>
              <div class="db-domain-card"><h3>Staff (1)</h3><p><code>users</code></p></div>
              <div class="db-domain-card"><h3>Engagement (1)</h3><p><code>bookmarks</code> — schema ready; end-to-end flow planned</p></div>
            </div>
          </section>

          <section class="ia-section" id="lookups">
            <h2>Lookup / reference tables</h2>
            <p>Administration CRUD in backoffice. SERIAL primary keys unless noted.</p>
            ${byDomain.lookups.map(renderTable).join("\n")}
          </section>

          <section class="ia-section" id="jobs">
            <h2>Job postings</h2>
            <p>Central <code>job_postings</code> with ordered child tables and M:N junctions for skills, benefits, and tags.</p>
            ${byDomain.jobs.map(renderTable).join("\n")}
          </section>

          <section class="ia-section" id="candidates">
            <h2>Candidate domain</h2>
            <p>Split model — auth identity separate from profile, CV parse pipeline, and cover letter library.</p>
            ${byDomain.candidates.map(renderTable).join("\n")}
          </section>

          <section class="ia-section" id="applications-domain">
            <h2>Applications &amp; pipeline</h2>
            <p>Application as unit of work — links candidate, job, screening fields, AI relevance, audit events, and one interview row.</p>
            ${byDomain.applications.map(renderTable).join("\n")}
            <h3>Active pipeline statuses</h3>
            <pre class="ia-shell">Submitted → Under Review → Shortlisted → Interview Scheduled → Interview Completed → Offered → Hired

Terminal: rejected (controlled reopen), withdrawn</pre>
          </section>

          <section class="ia-section" id="users">
            <h2>Staff — <code>users</code></h2>
            <p>Internal backoffice accounts. Phase-1 RBAC via <code>role</code> enum — evolvable to roles/permissions tables later.</p>
            ${byDomain.staff.map(renderTable).join("\n")}
          </section>

          <section class="ia-section" id="bookmarks">
            <h2>Bookmarks</h2>
            ${byDomain.engagement.map(renderTable).join("\n")}
          </section>

          <section class="ia-section" id="enums">
            <h2>Prisma enums</h2>
            <p>PostgreSQL enum types after migrate. JSON API strings match these values.</p>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>Enum</th><th>Values</th></tr></thead>
                <tbody>${enumRows}</tbody>
              </table>
            </div>
          </section>

          <section class="ia-section" id="indexes">
            <h2>Indexes &amp; constraints</h2>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>Topic</th><th>Definition</th></tr></thead>
                <tbody>
                  <tr><td><code>idx_applications_unique</code></td><td>UNIQUE (<code>candidate_account_id</code>, <code>job_posting_id</code>)</td></tr>
                  <tr><td><code>idx_applications_status</code></td><td>INDEX on <code>applications.status</code></td></tr>
                  <tr><td><code>idx_applications_job</code></td><td>INDEX (<code>job_posting_id</code>, <code>applied_at DESC</code>)</td></tr>
                  <tr><td><code>idx_application_status_events_app_time</code></td><td>INDEX (<code>application_id</code>, <code>changed_at DESC</code>)</td></tr>
                  <tr><td><code>application_interviews.application_id</code></td><td>UNIQUE — at most one interview per application</td></tr>
                  <tr><td><code>idx_postings_status_posted</code></td><td>INDEX (<code>status</code>, <code>posted_at DESC</code>)</td></tr>
                  <tr><td><code>idx_postings_fulltext</code></td><td>GIN on title + summary + overview — add via raw SQL migration (not in Prisma file)</td></tr>
                  <tr><td><code>idx_postings_remote</code> / <code>idx_postings_featured</code></td><td>Partial indexes in §5 DDL; Prisma emits full B-tree unless raw SQL added</td></tr>
                  <tr><td><code>chk_salary</code></td><td><code>salary_min &lt;= salary_max</code> — enforce in app or raw migration</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ia-section" id="ui-mapping">
            <h2>UI → schema mapping</h2>
            <h3>Job listing card</h3>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>UI element</th><th>Source</th></tr></thead>
                <tbody>
                  <tr><td>Title, summary, posted date, featured</td><td><code>job_postings</code></td></tr>
                  <tr><td>Department, location, employment, experience</td><td>Lookup joins</td></tr>
                  <tr><td>Tags (badges)</td><td><code>tags</code> via <code>job_posting_tags</code></td></tr>
                  <tr><td>"New" badge</td><td><code>posted_at &gt; NOW() - 7 days</code></td></tr>
                  <tr><td>Bookmark state</td><td><code>bookmarks</code> (if authenticated)</td></tr>
                </tbody>
              </table>
            </div>
            <h3>Job detail page</h3>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>UI section</th><th>Source</th></tr></thead>
                <tbody>
                  <tr><td>Poster banner</td><td><code>banner_image_url</code>, <code>banner_image_alt</code></td></tr>
                  <tr><td>Overview / role summary</td><td><code>overview</code>, <code>role_summary</code></td></tr>
                  <tr><td>Responsibilities</td><td><code>job_responsibilities</code> ordered</td></tr>
                  <tr><td>Qualifications</td><td><code>job_qualifications</code> by <code>type</code></td></tr>
                  <tr><td>Skills, benefits</td><td>Junction tables</td></tr>
                  <tr><td>Apply Now</td><td>Creates <code>applications</code> row</td></tr>
                </tbody>
              </table>
            </div>
            <h3>Backoffice application detail</h3>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>UI section</th><th>Source</th></tr></thead>
                <tbody>
                  <tr><td>Applicant summary</td><td><code>candidate_profiles</code> + account email</td></tr>
                  <tr><td>Screening answers</td><td><code>applications</code> screening columns</td></tr>
                  <tr><td>Documents</td><td><code>resume_url</code>, cover letter; CV library tables</td></tr>
                  <tr><td>Status history</td><td><code>application_status_events</code></td></tr>
                  <tr><td>Interview</td><td><code>application_interviews</code></td></tr>
                  <tr><td>AI relevance</td><td><code>relevance_score</code>, <code>relevance_breakdown</code></td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ia-section" id="queries">
            <h2>Sample queries</h2>
            <h3>Published job listing</h3>
            <pre class="ia-shell db-sql">SELECT jp.id, jp.title, jp.slug, jp.summary, jp.posted_at, jp.is_featured,
       d.name AS department_name,
       l.city || ', ' || l.country AS location_display,
       et.name AS employment_type, el.name AS experience_level
FROM job_postings jp
JOIN departments d ON d.id = jp.department_id
JOIN locations l ON l.id = jp.location_id
JOIN employment_types et ON et.id = jp.employment_type_id
JOIN experience_levels el ON el.id = jp.experience_level_id
WHERE jp.status = 'published'
  AND (jp.expires_at IS NULL OR jp.expires_at &gt; NOW())
ORDER BY jp.is_featured DESC, jp.posted_at DESC
LIMIT 15;</pre>
            <h3>Application packet (staff)</h3>
            <pre class="ia-shell db-sql">SELECT a.*, cp.first_name, cp.last_name, ca.email,
       jp.title AS job_title
FROM applications a
JOIN candidate_accounts ca ON ca.id = a.candidate_account_id
JOIN candidate_profiles cp ON cp.candidate_account_id = ca.id
JOIN job_postings jp ON jp.id = a.job_posting_id
WHERE a.id = :application_id;</pre>
          </section>

          <section class="ia-section" id="prisma">
            <h2>Prisma notes</h2>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>Topic</th><th>Notes</th></tr></thead>
                <tbody>
                  <tr><td>Canonical file</td><td><code>packages/db/prisma/schema.prisma</code></td></tr>
                  <tr><td>Migrate / generate</td><td><code>npm run db:migrate</code>, <code>npm run db:generate</code></td></tr>
                  <tr><td>§5 hand-written DDL</td><td>Reference draft only — may show legacy <code>candidates</code>; prefer Prisma</td></tr>
                  <tr><td>GIN full-text</td><td><code>idx_postings_fulltext</code> — raw SQL migration</td></tr>
                  <tr><td>Partial indexes</td><td>Remote/featured — raw SQL for <code>WHERE</code> parity</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ia-section" id="decisions">
            <h2>Design decisions</h2>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>Decision</th><th>Rationale</th></tr></thead>
                <tbody>
                  <tr><td>UUID for jobs, candidates, applications</td><td>Non-guessable IDs; safe for URLs</td></tr>
                  <tr><td>SERIAL for lookups</td><td>Small cardinality; efficient joins</td></tr>
                  <tr><td><code>companies</code> lookup</td><td>Employer branding on postings</td></tr>
                  <tr><td>Split candidate auth/profile</td><td>OTP, lockout, OAuth without overloading profile</td></tr>
                  <tr><td>CV parse draft → confirmed</td><td>Human review before profile overwrite</td></tr>
                  <tr><td>Junction tables</td><td>Normalised M:N for skills, benefits, tags</td></tr>
                  <tr><td>Status event audit log</td><td>Governed transitions, undo, compliance</td></tr>
                  <tr><td>One interview per application</td><td>Schedule-before-status business rule</td></tr>
                  <tr><td><code>users.role</code> RBAC</td><td>Phase-1 simplicity; evolvable later</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ia-section" id="related">
            <h2>Related documentation</h2>
            <div class="ia-table-wrap">
              <table class="ia-table">
                <thead><tr><th>Document</th><th>Purpose</th></tr></thead>
                <tbody>
                  <tr><td><a href="../../docs/specification/db-schema.md">db-schema.md</a></td><td>Full spec with §5 DDL reference</td></tr>
                  <tr><td><a href="../../docs/specification/er-diagram.html">er-diagram.html</a></td><td>Interactive pannable ER diagram</td></tr>
                  <tr><td><a href="product-requirements.html">Product requirements</a></td><td>Feature scope aligned to schema</td></tr>
                  <tr><td><a href="api-dictionary.html">API dictionary</a></td><td>HTTP endpoints reading/writing these tables</td></tr>
                </tbody>
              </table>
            </div>
            <p class="ia-note"><em>Generated from schema.prisma · db-schema v1.9 · 19 May 2026</em></p>
          </section>
        </article>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <p class="wordmark">TalentHub</p>
        <div class="footer-meta">
          <p class="footer-meta-tagline">TalentHub Case study · May 2026</p>
          <p>Copyright (C) 2026 by Hirantha Dhanuka De Silva (Author)</p>
          <p>Email: <a href="mailto:hiranthadhanuka@gmail.com">hiranthadhanuka@gmail.com</a></p>
        </div>
      </div>
      <nav class="footer-nav">
        <a href="index.html">Case study home</a>
        <a href="appendix.html">All artifacts</a>
        <a href="api-dictionary.html">API dictionary</a>
      </nav>
    </div>
  </footer>

  <script src="site.js"></script>
</body>
</html>
`;

fs.writeFileSync(outPath, html, "utf8");
console.log(`Wrote ${outPath} (${models.length} models)`);
