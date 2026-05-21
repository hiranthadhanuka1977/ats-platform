# Reflection — tradeoffs and next iteration

*Updated against [PRD §10–§11](../../docs/specification/PRD.md) — May 2026.*

## What I would defend in a design critique

1. **Week-scoped pipeline** answers a real ops rhythm (“this week’s applications”) without a complex filter builder for MVP.
2. **Application detail page** is the correct **anchor object** for adjudication; candidate profile remains the anchor for **person-centric** history.
3. **Disabling future weeks** is better UX than showing an empty future pipeline—avoids “is the system broken?” moments.
4. **`from=applications`** is a minimal, auditable navigation hint—better than overloading browser history for a multi-app system.
5. **Validated status transitions** with audit events trade flexibility for trust—appropriate for hiring compliance.
6. **Interview gate before status** keeps pipeline honest; schedule action lives on the packet page to reduce context switching.

---

## Tradeoffs (be honest in portfolio)

| Tradeoff | Why we accepted it | Future mitigation |
|----------|-------------------|-------------------|
| **UTC weeks** vs local | Consistent with timestamps and simpler cross-timezone engineering | Timezone selector or org locale |
| **Drag + click** same surface | Familiar kanban pattern | Separate drag handle vs click target; user testing |
| **Salary in GBP** in UI copy | Placeholder locale for demo | Configurable currency / locale |
| **500-row cap** | Performance guardrail | Pagination + filters |
| **Staff download endpoints** | Security / session model | Centralised files service with audit log |
| **BFF in Next.js** vs central API | Faster iteration; auth API separate | Extract to Hono when integrations need it (PRD §10) |
| **AI relevance optional** | Depends on OpenAI key | Graceful degradation already in UI |
| **Candidate JWT in localStorage** | Current my-applications pattern | HttpOnly cookies (audit recommendation) |

---

## Shipped since early portfolio drafts

| Capability | PRD ref |
|------------|---------|
| Status audit history on application detail | BO-42 |
| Undo and reopen flows | BO-36, BO-37 |
| Interview schedule + calendar | BO-40, BO-60 |
| Dashboard with pipeline health | BO-10–14 |
| Full jobs CRUD + preview | BO-20–25 |
| Administration lookup CRUD | BO-70–73 |
| HTML design system + layout templates | PRD §8.5 |
| Formal PRD document | [PRD.md](../../docs/specification/PRD.md) |

---

## Collaboration notes (for “how you work” interviews)

- Wrote **acceptance-style** criteria before visual polish so engineers could implement incrementally.
- Paired on **edge cases**: hydration-safe dates, enum normalization, optimistic UI rollback, interview validation.
- Used **shared types** package for **status language** and **transition map**—reduces design drift.
- Maintained **implementation-aligned** docs (PRD, API dictionary, design system) alongside portfolio artefacts.

---

## What I’d do next (roadmap — PRD gaps)

1. **Inline PDF preview** in application detail (reduce tab thrash).
2. **Saved views**: “My open reqs”, “This hiring manager’s roles”.
3. **Email notifications** when `notifyCandidate` is set (field exists; delivery TBD).
4. **Accessibility pass** on horizontal pipeline scroll and modal focus traps (see WCAG audit).
5. **Breadcrumb** component across backoffice (job edit → back to application).
6. **Reports and Settings** — replace placeholders with real surfaces.
7. **Candidate bookmarks** — end-to-end flow (schema exists).
8. **Password reset UI** for my-applications (API exists).

---

## Personal growth (fill in 2 sentences)

- *[What you learned about recruiting domain]*
- *[What you learned about designing for internal power users across a multi-app platform]*
