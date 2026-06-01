# AI-assisted design & development — process flow

**Full 5-stage process (Discovery → Ship):** [portfolio/process-diagrams/ats-ai-development-process.md](../process-diagrams/ats-ai-development-process.md)

![AI-assisted ATS development process — 5 stages](../process-diagrams/ats-ai-development-process.png)

**Feature increment loop (inset):** [PNG](../process-diagrams/ats-feature-increment-loop.png)

## PNG downloads

Pre-rendered files are in **`diagrams/`**:

| PNG | Use for |
|-----|---------|
| [diagrams/01-hero-end-to-end.png](./diagrams/01-hero-end-to-end.png) | Portfolio hero / case study header |
| [diagrams/02-iteration-loop.png](./diagrams/02-iteration-loop.png) | Inset: how one increment ships |
| [diagrams/03-human-vs-ai.png](./diagrams/03-human-vs-ai.png) | Human vs AI responsibilities |
| [diagrams/04-product-user-flow.png](./diagrams/04-product-user-flow.png) | Optional: generic user journey |

Copy the Mermaid blocks below into **Notion** (Mermaid block), **GitHub**, **Obsidian**, or re-export from [mermaid.live](https://mermaid.live).

---

## 1. End-to-end process (portfolio hero diagram)

Generic workflow for **any backlog item** — not tied to a single screen or feature.

```mermaid
flowchart LR
  A["① Discover & frame<br/><small>human-led</small><br/>Problem · users · scope · flows"]
  B["② Specify<br/><small>human-led</small><br/>Behaviour · edge cases · acceptance criteria"]
  C["③ Implement<br/><small>AI-assisted</small><br/>Against spec · design system · codebase"]
  D["④ Validate<br/><small>human-led</small><br/>Run product · compare to intent"]
  E["⑤ Ship<br/><small>increment complete</small>"]

  A --> B --> C --> D --> E
  D -->|not ready| C

  style A fill:#f8fafc,stroke:#64748b
  style B fill:#eef2ff,stroke:#4f46e5
  style C fill:#ecfdf5,stroke:#059669
  style D fill:#fffbeb,stroke:#d97706
  style E fill:#f0fdf4,stroke:#16a34a
```

---

## 2. Single iteration loop (how one feature shipped)

Use this under the hero diagram to explain *how you worked day-to-day*.

```mermaid
flowchart LR
  A["📝 Define behaviour<br/><small>spec bullet or acceptance note</small>"] --> B["🤖 AI session<br/><small>Cursor + context files</small>"]
  B --> C["▶️ Test in browser<br/><small>backoffice :3001</small>"]
  C --> D{OK?}
  D -->|No| E["✏️ Fix drift<br/><small>rules · props · CSS</small>"]
  E --> B
  D -->|Yes| F["✅ Increment done"]

  style A fill:#eef2ff,stroke:#4f46e5
  style B fill:#ecfdf5,stroke:#059669
  style C fill:#f8fafc,stroke:#64748b
  style F fill:#f0fdf4,stroke:#16a34a
```

---

## 3. What stayed human vs AI-assisted

```mermaid
flowchart TB
  subgraph HUMAN["Human-owned"]
    H1[Problem framing & scope]
    H2[IA, navigation, week model]
    H3[Transition rules & terminal states]
    H4[Interview business rules]
    H5[Copy, labels, error messages]
    H6[QA, accessibility, polish decisions]
  end

  subgraph AI["AI-accelerated"]
    A1[React / Next.js components]
    A2[CSS against existing tokens]
    A3[API routes & validators]
    A4[Prisma migrations & queries]
    A5[Boilerplate & layout fixes]
  end

  HUMAN -.->|writes spec| AI
  AI -.->|implements| HUMAN

  style HUMAN fill:#eef2ff,stroke:#4f46e5
  style AI fill:#ecfdf5,stroke:#059669
```

---

## 4. Product flow (what recruiters experience — optional second page)

Shows you designed for *users*, not only process.

```mermaid
flowchart TB
  START([Staff opens Applications]) --> VIEW{View mode}
  VIEW -->|Pipeline default| PIPE[Kanban by status · week scope]
  VIEW -->|List| TABLE[Table grouped by candidate]

  PIPE --> ACT{Action}
  TABLE --> DETAIL

  ACT -->|Click card| DETAIL[Application detail<br/>docs · summary · interviews]
  ACT -->|Drag to column| VALID{Valid transition?}
  VALID -->|No| BLOCK[Blocked / invalid drop]
  VALID -->|Yes| MODAL{Needs confirmation?}
  MODAL -->|Reject · Withdraw · Hire| CONFIRM[Modal → API]
  MODAL -->|Interview Scheduled, no interview| SCHED[Prompt: schedule now?]
  SCHED -->|Yes| INTERVIEW[Schedule interview modal]
  SCHED -->|Cancel| PIPE
  MODAL -->|Simple move| API[PATCH status + audit event]
  CONFIRM --> API
  INTERVIEW --> API

  DETAIL --> CAND[Candidate profile<br/>back to Applications]
  API --> PIPE

  style START fill:#f8fafc,stroke:#64748b
  style DETAIL fill:#eef2ff,stroke:#4f46e5
  style API fill:#ecfdf5,stroke:#059669
```

---

## Caption text (paste under the diagram)

**Figure 1 — AI-assisted delivery process (per backlog item).** Discovery and specification stay human-led so behaviour and edge cases are explicit before implementation. AI accelerates build against written requirements and the existing design system; each increment is validated in a running product before ship. The loop applies to every feature the same way—product judgment and QA remain human-owned.

---

## Export tips

| Tool | How |
|------|-----|
| **mermaid.live** | Paste diagram → Export PNG/SVG |
| **Notion** | `/code` → Mermaid → paste block 1 or 2 |
| **Figma** | Export PNG and place on portfolio frame |
| **GitHub README** | Mermaid renders in markdown automatically |
