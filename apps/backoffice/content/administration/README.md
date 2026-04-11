# Administration copy

Each **`.md`** file matches a maintenance section id (`departments`, `locations`, etc.).

## Frontmatter

- **`summary`** (string): Short line shown directly under the section title.

## Body (optional)

Markdown below the frontmatter appears inside **“About this list”** (expandable). Omit the body or leave it empty if you only need the summary line.

Example:

```markdown
---
summary: "One-line explainer for staff."
---

## When to edit

Longer guidance in **Markdown**—lists, emphasis, and links are supported.

- Use bullets for tips
- Call out **slugs** and field names when helpful

```

## File names

Must match the route segment exactly, e.g. `employment-types.md` for `/administration/employment-types`.
