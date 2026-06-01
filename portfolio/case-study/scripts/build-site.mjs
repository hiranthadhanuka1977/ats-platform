/**
 * Build TalentHub case study static site from portfolio markdown sources.
 * Run: npm install && npm run build  (from portfolio/case-study/)
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "fs";
import { join, dirname, relative, basename } from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, "..");
const PORTFOLIO_ROOT = join(SITE_ROOT, "..");
const REPO_ROOT = join(PORTFOLIO_ROOT, "..");

marked.setOptions({ gfm: true, breaks: false });

/** @type {Array<{ id: string, title: string, group: string, src: string, out: string }>} */
const DOC_PAGES = [
  { id: "netnography", title: "Netnographic research", group: "Research", src: "portfolio/product-designer-ats-backoffice/17-netnographic-ats-research.md", out: "netnographic-research.html" },
  { id: "market-summary", title: "Market research summary", group: "Research", src: "portfolio/product-designer-ats-backoffice/18-market-research-summary.md", out: "market-research-summary.html" },
  { id: "deck-slides", title: "Research deck slides", group: "Research", src: "portfolio/product-designer-ats-backoffice/19-netnographic-deck-slides.md", out: "research-deck-slides.html" },
  { id: "problem-framing", title: "Problem framing & role", group: "Research", src: "portfolio/product-designer-ats-backoffice/01-problem-framing-and-role.md", out: "problem-framing.html" },
  { id: "user-stories", title: "User stories & JTBD", group: "Design", src: "portfolio/product-designer-ats-backoffice/02-user-stories-and-jtbd.md", out: "user-stories.html" },
  { id: "platform-ia-notes", title: "Platform IA notes", group: "Design", src: "portfolio/product-designer-ats-backoffice/04-information-architecture.md", out: "platform-ia-notes.html" },
  { id: "backoffice-ia", title: "Backoffice navigation map", group: "Design", src: "portfolio/information-architecture/backoffice-navigation-map.md", out: "backoffice-ia.html" },
  { id: "platform-ia-doc", title: "Information architecture (full)", group: "Design", src: "docs/information-architecture.md", out: "information-architecture.html" },
  { id: "task-flows", title: "Task flows", group: "Design", src: "portfolio/product-designer-ats-backoffice/05-task-flows.md", out: "task-flows.html" },
  { id: "wireframes", title: "Wireframes & states", group: "Design", src: "portfolio/product-designer-ats-backoffice/06-wireframes-and-states.md", out: "wireframes-states.html" },
  { id: "interaction-spec", title: "Interaction spec", group: "Design", src: "portfolio/product-designer-ats-backoffice/07-interaction-spec-handoff.md", out: "interaction-spec.html" },
  { id: "content-model", title: "Content model", group: "Design", src: "portfolio/product-designer-ats-backoffice/08-content-model.md", out: "content-model.html" },
  { id: "usability", title: "Usability test plan", group: "Validation", src: "portfolio/product-designer-ats-backoffice/09-usability-test-plan.md", out: "usability-test-plan.html" },
  { id: "reflection", title: "Reflection & tradeoffs", group: "Outcomes", src: "portfolio/product-designer-ats-backoffice/11-reflection-tradeoffs.md", out: "reflection.html" },
  { id: "ai-workflow", title: "Human vs AI workflow", group: "Process", src: "portfolio/product-designer-ats-backoffice/15-ai-workflow-design-and-development.md", out: "ai-workflow.html" },
  { id: "process-diagrams", title: "Process diagram sources", group: "Process", src: "portfolio/product-designer-ats-backoffice/16-ai-workflow-process-diagram.md", out: "process-diagram-sources.html" },
  { id: "process-5stage", title: "5-stage development process", group: "Process", src: "portfolio/process-diagrams/ats-ai-development-process.md", out: "process-5-stage.html" },
  { id: "wireframes-readme", title: "Wireframe index", group: "Design", src: "portfolio/wireframes/README.md", out: "wireframes-index.html" },
  { id: "prd", title: "Product requirements (PRD)", group: "Specifications", src: "docs/specification/PRD.md", out: "prd.html" },
  { id: "backlog", title: "Feature backlog", group: "Specifications", src: "docs/specification/FEATURE_BACKLOG.md", out: "feature-backlog.html" },
  { id: "user-stories-backlog", title: "User stories (TH codes)", group: "Specifications", src: "docs/specification/FEATURE_BACKLOG_CURSOR_PROMPTS.md", out: "user-stories-backlog.html" },
  { id: "app-state", title: "Application state spec", group: "Specifications", src: "docs/specification/ATS_Application_State_UI_API_Requirements.md", out: "application-state-spec.html" },
  { id: "api-apps", title: "Backoffice applications API", group: "Specifications", src: "docs/specification/api/backoffice-applications.md", out: "backoffice-applications-api.html" },
  { id: "wcag", title: "WCAG 2.2 audit", group: "Compliance", src: "docs/reports/wcag22-audit.md", out: "wcag-audit.html" },
  { id: "pdpa", title: "GDPR / PDPA audit", group: "Compliance", src: "docs/reports/pdpa-gdpr-audit.md", out: "pdpa-gdpr-audit.html" },
  { id: "alignment", title: "Implementation alignment", group: "Compliance", src: "docs/reports/implementation-alignment-2026.md", out: "implementation-alignment.html" },
];

function mdToHtml(md, baseForImages = "..") {
  let html = marked.parse(md);
  html = html.replace(/src="(process-diagrams\/[^"]+)"/g, `src="${baseForImages}/$1"`);
  html = html.replace(/src="(information-architecture\/[^"]+)"/g, `src="${baseForImages}/$1"`);
  html = html.replace(/src="(wireframes\/[^"]+)"/g, `src="${baseForImages}/$1"`);
  html = html.replace(/src="(product-designer-ats-backoffice\/diagrams\/[^"]+)"/g, `src="${baseForImages}/$1"`);
  html = html.replace(/href="(pages\/[^"]+\.md)"/g, (_, p) => `href="${p.replace(/\.md$/, ".html")}"`);
  return html;
}

function readRepoFile(relPath) {
  const full = join(REPO_ROOT, relPath.replace(/\//g, "\\"));
  if (!existsSync(full)) {
    console.warn("Missing:", relPath);
    return `# Missing source\n\nCould not find \`${relPath}\`.`;
  }
  return readFileSync(full, "utf8");
}

function buildNav(currentPage = "index") {
  const groups = {};
  for (const doc of DOC_PAGES) {
    if (!groups[doc.group]) groups[doc.group] = [];
    groups[doc.group].push(doc);
  }

  let nav = `<nav class="site-nav" aria-label="Case study">
    <div class="nav-brand">
      <a href="index.html" class="nav-logo"><span class="logo-mark">T</span> TalentHub</a>
      <span class="nav-sub">Case Study</span>
    </div>
    <ul class="nav-sections">
      <li><a href="index.html#overview" class="${currentPage === "index" ? "active" : ""}">Overview</a></li>
      <li><a href="index.html#research">Research</a></li>
      <li><a href="index.html#process">Process</a></li>
      <li><a href="index.html#solution">Solution</a></li>
      <li><a href="index.html#impact">Impact</a></li>
      <li><a href="wireframes.html">Wireframes</a></li>
    </ul>`;

  for (const [group, items] of Object.entries(groups)) {
    nav += `<div class="nav-group"><h3>${group}</h3><ul>`;
    for (const item of items) {
      const href = `pages/${item.out}`;
      const active = currentPage === item.out ? " active" : "";
      nav += `<li><a href="${href}" class="${active}">${item.title}</a></li>`;
    }
    nav += `</ul></div>`;
  }

  nav += `<div class="nav-group"><h3>External</h3><ul>
    <li><a href="../../docs/design-system/index.html" target="_blank" rel="noopener">Design system catalog ↗</a></li>
  </ul></div></nav>`;

  return nav;
}

function pageShell({ title, bodyHtml, currentPage = "index", breadcrumb = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — TalentHub Case Study</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${currentPage === "index" || currentPage.endsWith(".html") && !currentPage.includes("/") ? "styles.css" : "../styles.css"}" />
</head>
<body>
  <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false">☰</button>
  <div class="site-layout">
    ${buildNav(currentPage)}
    <main class="site-main" id="main-content">
      ${breadcrumb ? `<nav class="breadcrumb" aria-label="Breadcrumb">${breadcrumb}</nav>` : ""}
      <article class="prose">${bodyHtml}</article>
    </main>
  </div>
  <script src="${currentPage === "index" || currentPage === "wireframes.html" ? "" : "../"}site.js"></script>
</body>
</html>`;
}

const HREF_TO_PAGE = {
  "../docs/specification/PRD.md": "pages/prd.html",
  "../docs/specification/FEATURE_BACKLOG.md": "pages/feature-backlog.html",
  "../docs/specification/FEATURE_BACKLOG_CURSOR_PROMPTS.md": "pages/user-stories-backlog.html",
  "../docs/information-architecture.md": "pages/information-architecture.html",
  "../docs/reports/wcag22-audit.md": "pages/wcag-audit.html",
  "../docs/reports/pdpa-gdpr-audit.md": "pages/pdpa-gdpr-audit.html",
  "../docs/reports/implementation-alignment-2026.md": "pages/implementation-alignment.html",
  "../docs/specification/ATS_Application_State_UI_API_Requirements.md": "pages/application-state-spec.html",
  "../docs/specification/api/backoffice-applications.md": "pages/backoffice-applications-api.html",
  "../docs/design-system/index.html": "../../docs/design-system/index.html",
  "product-designer-ats-backoffice/17-netnographic-ats-research.md": "pages/netnographic-research.html",
  "product-designer-ats-backoffice/18-market-research-summary.md": "pages/market-research-summary.html",
  "product-designer-ats-backoffice/19-netnographic-deck-slides.md": "pages/research-deck-slides.html",
  "product-designer-ats-backoffice/01-problem-framing-and-role.md": "pages/problem-framing.html",
  "product-designer-ats-backoffice/02-user-stories-and-jtbd.md": "pages/user-stories.html",
  "product-designer-ats-backoffice/04-information-architecture.md": "pages/platform-ia-notes.html",
  "product-designer-ats-backoffice/05-task-flows.md": "pages/task-flows.html",
  "product-designer-ats-backoffice/06-wireframes-and-states.md": "pages/wireframes-states.html",
  "product-designer-ats-backoffice/07-interaction-spec-handoff.md": "pages/interaction-spec.html",
  "product-designer-ats-backoffice/08-content-model.md": "pages/content-model.html",
  "product-designer-ats-backoffice/09-usability-test-plan.md": "pages/usability-test-plan.html",
  "product-designer-ats-backoffice/11-reflection-tradeoffs.md": "pages/reflection.html",
  "product-designer-ats-backoffice/15-ai-workflow-design-and-development.md": "pages/ai-workflow.html",
  "product-designer-ats-backoffice/16-ai-workflow-process-diagram.md": "pages/process-diagram-sources.html",
  "information-architecture/backoffice-navigation-map.md": "pages/backoffice-ia.html",
  "process-diagrams/ats-ai-development-process.md": "pages/process-5-stage.html",
  "process-diagrams/ats-feature-increment-loop.mmd": "pages/process-5-stage.html",
  "wireframes/README.md": "pages/wireframes-index.html",
  "case-study/index.html": "index.html",
};

function rewriteMarkdownLinks(md) {
  return md.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (full, text, href) => {
    const hashIdx = href.indexOf("#");
    const path = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
    const mapped = HREF_TO_PAGE[path];
    if (mapped) return `[${text}](${mapped}${hash})`;
    return full;
  });
}

// --- Build index from final-case-study.md with enhancements ---
let indexMd = readRepoFile("portfolio/final-case-study.md");
indexMd = indexMd.replace(
  /AI-assisted ATS development — 5-stage process\n\n\*Process spec:/,
  `![5-stage AI-assisted development process](../process-diagrams/ats-ai-development-process.png)\n\n*Process spec:`
);
indexMd = indexMd.replace(
  "Backoffice navigation map\n\n`[Screenshot: Design system]`",
  "![Backoffice navigation map](../information-architecture/backoffice-navigation-map.png)\n\n`[Screenshot: Design system]`"
);
indexMd = indexMd.replace(/Feature increment loop\n\nEach feature loop:/, `![Feature increment loop](../process-diagrams/ats-feature-increment-loop.png)\n\nEach feature loop:`);
indexMd = rewriteMarkdownLinks(indexMd);

let indexHtml = mdToHtml(indexMd);
// Add section IDs for in-page nav
indexHtml = indexHtml
  .replace(/<h2>Executive summary<\/h2>/, '<h2 id="overview">Executive summary</h2>')
  .replace(/<h2>Problem &amp; research<\/h2>/, '<h2 id="research">Problem &amp; research</h2>')
  .replace(/<h2>Process: 5-stage AI-assisted lifecycle<\/h2>/, '<h2 id="process">Process: 5-stage AI-assisted lifecycle</h2>')
  .replace(/<h2>Solution — what shipped<\/h2>/, '<h2 id="solution">Solution — what shipped</h2>')
  .replace(/<h2>Impact<\/h2>/, '<h2 id="impact">Impact</h2>')
  .replace(/<h2>Reflection<\/h2>/, '<h2 id="reflection">Reflection</h2>');

writeFileSync(
  join(SITE_ROOT, "index.html"),
  pageShell({ title: "TalentHub ATS", bodyHtml: indexHtml, currentPage: "index" }),
  "utf8"
);

// --- Build doc pages ---
const pagesDir = join(SITE_ROOT, "pages");
mkdirSync(pagesDir, { recursive: true });

for (const doc of DOC_PAGES) {
  let md = readRepoFile(doc.src);
  md = rewriteMarkdownLinks(md);
  md = md.replace(/\]\(\.\.\/\.\.\/docs\//g, "](../../docs/");
  md = md.replace(/\]\(\.\.\/docs\//g, "](../../docs/");
  md = md.replace(/\]\(\.\.\/portfolio\//g, "](../");

  let html = mdToHtml(md, "..");

  const breadcrumb = `<a href="../index.html">Overview</a> <span aria-hidden="true">/</span> <span>${doc.title}</span>`;
  writeFileSync(
    join(pagesDir, doc.out),
    pageShell({
      title: doc.title,
      bodyHtml: html,
      currentPage: doc.out,
      breadcrumb,
    }).replace('href="styles.css"', 'href="../styles.css"').replace('src="site.js"', 'src="../site.js"'),
    "utf8"
  );
  console.log("Built pages/" + doc.out);
}

// --- Wireframes gallery page ---
const wireframeImages = [
  { file: "01-backoffice-dashboard.png", title: "Backoffice dashboard" },
  { file: "02-backoffice-applications-pipeline.png", title: "Applications pipeline" },
  { file: "03-backoffice-application-detail.png", title: "Application detail" },
  { file: "04-candidate-portal-job-listing.png", title: "Candidate portal — job listing" },
  { file: "05-candidate-portal-job-detail.png", title: "Candidate portal — job detail" },
  { file: "06-my-applications-dashboard.png", title: "My Applications dashboard" },
];

const wireframesHtml = `
<h1>Wireframe gallery</h1>
<p class="lead">Lo-fi screens (1440×900) generated from portfolio specs. See also <a href="pages/wireframes-index.html">wireframe index</a> and <a href="pages/wireframes-states.html">states documentation</a>.</p>
<div class="wireframe-grid">
${wireframeImages
  .map(
    (w) => `<figure class="wireframe-card">
  <a href="../wireframes/png/${w.file}" target="_blank" rel="noopener">
    <img src="../wireframes/png/${w.file}" alt="${w.title}" loading="lazy" width="720" height="450" />
  </a>
  <figcaption>${w.title}</figcaption>
</figure>`
  )
  .join("\n")}
</div>`;

writeFileSync(
  join(SITE_ROOT, "wireframes.html"),
  pageShell({ title: "Wireframes", bodyHtml: wireframesHtml, currentPage: "wireframes.html" }),
  "utf8"
);

console.log("Built index.html, wireframes.html, and", DOC_PAGES.length, "doc pages.");
