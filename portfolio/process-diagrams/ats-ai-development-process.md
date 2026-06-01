# TalentHub ATS — AI-assisted development process

**Use in:** Portfolio case study · Notion · slide deck · LinkedIn featured project  
**Product:** TalentHub (`ats-platform` monorepo)  
**Date:** May 2026

This diagram documents the **end-to-end process** used to design and build an ATS with **AI-assisted implementation** and **human-led product judgment**.

---

## Process overview (5 stages)

| Stage | Name | Mode | Output |
|-------|------|------|--------|
| **1** | Discovery | Human-led | Problem framing, market evidence |
| **2** | Define scope & specification | Human-led + AI-assisted | PRD, specs, design system, IA |
| **3** | Implementation | AI-assisted + human review | Working increment in repo |
| **4** | Validation & updates | Human-led + AI-assisted audit | Audits, docs, PRD status, Git |
| **5** | Ship | Milestone | Feature delivered |

After **Ship**, the cycle returns to **Stage 3** for the next PRD feature until the release scope is complete.

---

## Visual diagrams

### Figure 1 — End-to-end process (portfolio hero)

![ATS AI development process](./ats-ai-development-process.png)

**Source:** [ats-ai-development-process.mmd](./ats-ai-development-process.mmd)

### Figure 2 — Feature increment loop (inset)

![Feature increment loop](./ats-feature-increment-loop.png)

**Source:** [ats-feature-increment-loop.mmd](./ats-feature-increment-loop.mmd)

---

## Stage detail (case study copy)

### 1. Discovery

*Problem framing and use-case identification.*

- **Competitor analysis** — patterns from Greenhouse, Lever, Ashby, SMB tools; what to adopt vs avoid ([03-competitive-and-pattern-notes.md](../product-designer-ats-backoffice/03-competitive-and-pattern-notes.md))
- **Netnographic research** — public discourse on recruiter and candidate pain ([17-netnographic-ats-research.md](../product-designer-ats-backoffice/17-netnographic-ats-research.md))

**Outcome:** Evidence-backed problem statement; SME-first positioning (low cost, good UX, fast setup).

---

### 2. Define scope / specification / context / design

*Establish the contract before code.*

| Workstream | Approach | Artefacts |
|------------|----------|-----------|
| PRD | AI-generated drafts + manual review rounds | [PRD.md](../../docs/specification/PRD.md) |
| Dev stack | AI-assisted research + decision | npm monorepo, Next.js, Hono, Prisma, PostgreSQL |
| Usability & interaction spec | Human-led | Task flows, interaction handoff, state requirements |
| Accessibility spec | Human-led target | WCAG 2.2 AA intent |
| Architecture | Human decision | Monorepo, BFF pattern, shared packages |
| Data protection | Human-led spec | GDPR / PDPA audit criteria |
| Design system & markup | AI-assisted codegen | [design-system](../../docs/design-system/index.html), static markup libraries |
| Prototype & navigation | Human-led IA | [backoffice-navigation-map.md](../information-architecture/backoffice-navigation-map.md) |

**Outcome:** Shared source of truth — specs, tokens, and navigation model — that AI sessions must follow.

---

### 3. Implementation

*Always incremental against the PRD.*

```text
PRD → Pick a feature → Expand specification / compose Cursor prompt → Implement
```

- Features tracked with **TH-** codes ([FEATURE_BACKLOG.md](../../docs/specification/FEATURE_BACKLOG.md))
- Prompts pre-written per feature ([FEATURE_BACKLOG_CURSOR_PROMPTS.md](../../docs/specification/FEATURE_BACKLOG_CURSOR_PROMPTS.md))
- AI generates React, API routes, validators, migrations; **human edits** for business rules and cohesion

---

### 4. Validation & updates

*Compare running product to intent.*

- **WCAG 2.2** audit and remediation ([wcag22-audit.md](../../docs/reports/wcag22-audit.md) — rev 1.1)
- **GDPR & PDPA** audit and remediation ([pdpa-gdpr-audit.md](../../docs/reports/pdpa-gdpr-audit.md) — rev 1.1)
- **Design system** — update catalog when new components ship (continuous AI-assisted / manual audit)
- **Information architecture** — keep navigation docs aligned with routes
- **PRD** — mark Done / Partial / Planned per feature
- **Git** — commit increments; repo as single source of implementation truth

If validation fails → return to **Stage 3** (fix / extend implementation).

---

### 5. Ship — increment complete

Feature is **delivered**: behaviour matches spec, docs updated, code merged.

→ Pick **next PRD feature** and re-enter the increment loop until milestone or release scope is met.

---

## Caption (paste under diagram in portfolio)

> **Figure — AI-assisted ATS delivery process.** Discovery and definition are human-led and evidence-backed (competitor and netnographic research). Implementation is incremental: each PRD feature is expanded into a specification and Cursor prompt before AI-assisted coding. Validation compares the running product to intent—accessibility, privacy, design system, IA, and PRD status—before an increment ships. Product judgment, domain rules, and QA remain explicitly human-owned; AI accelerates specification drafting, codegen, and audit passes.

---

## Related portfolio artefacts

| Document | Role |
|----------|------|
| [15-ai-workflow-design-and-development.md](../product-designer-ats-backoffice/15-ai-workflow-design-and-development.md) | Narrative writeup |
| [16-ai-workflow-process-diagram.md](../product-designer-ats-backoffice/16-ai-workflow-process-diagram.md) | Earlier diagram set |
| [diagrams/](../product-designer-ats-backoffice/diagrams/README.md) | Supplementary PNGs (iteration loop, human vs AI) |

---

## Regenerate PNGs

From repo root:

```bash
npx @mermaid-js/mermaid-cli -i portfolio/process-diagrams/ats-ai-development-process.mmd -o portfolio/process-diagrams/ats-ai-development-process.png -b white -w 3200
npx @mermaid-js/mermaid-cli -i portfolio/process-diagrams/ats-feature-increment-loop.mmd -o portfolio/process-diagrams/ats-feature-increment-loop.png -b white -w 2400
```

---

*Process diagram v1.0 · May 2026*
