# Reflection — tradeoffs and next iteration

## What I would defend in a design critique

1. **Week-scoped pipeline** answers a real ops rhythm (“this week’s applications”) without adding a complex filter builder for MVP.  
2. **Application detail page** is the correct **anchor object** for adjudication; candidate profile remains the anchor for **person-centric** history.  
3. **Disabling future weeks** is better UX than showing an empty future pipeline—avoids “is the system broken?” moments.  
4. **`from=applications`** is a minimal, auditable navigation hint—better than overloading browser history for a multi-app system.  

---

## Tradeoffs (be honest in portfolio)

| Tradeoff | Why we accepted it | Future mitigation |
|----------|-------------------|-------------------|
| **UTC weeks** vs local | Consistent with timestamp display and simpler cross-timezone engineering | Timezone selector or “organisation locale” |
| **Drag + click** same surface | Familiar kanban pattern | Separate “…” menu for “Open” vs drag handle; user testing |
| **Salary in GBP** in UI copy | Placeholder locale for demo | Configurable currency / locale |
| **500-row cap** | Performance guardrail | Pagination + filters |
| **Staff download endpoints** | Security / session model | Centralised “files service” with audit log |

---

## Collaboration notes (for “how you work” interviews)

- Wrote **acceptance-style** criteria before visual polish so engineers could implement incrementally.  
- Paired on **edge cases**: hydration-safe dates, enum lag workarounds, optimistic UI rollback.  
- Used **shared types** package for **status language** consistency—reduces design drift.  

---

## What I’d do next (roadmap)

1. **Inline PDF preview** in application detail (reduce tab thrash).  
2. **Status change history** on application detail (audit + trust).  
3. **Saved views**: “My open reqs”, “This hiring manager’s roles”.  
4. **Accessibility pass** on horizontal pipeline scroll (keyboard column focus).  
5. **Breadcrumb** component across backoffice for cross-module jumps (job edit → back to application).  

---

## Personal growth (fill in 2 sentences)

- *[What you learned about recruiting domain]*  
- *[What you learned about designing for internal power users]*  
