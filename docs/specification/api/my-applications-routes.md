# My Applications — Next.js route handlers (candidate portal)

**Version:** 1.0  
**Date:** 6 May 2026  
**App:** `apps/my-applications` (dev **port 3002**)  
**Base URL (local):** `http://localhost:3002`

These endpoints are implemented as **Next.js App Router** handlers under `src/app/api/my-applications/`. They are **not** part of the central Hono service (`apps/api`, `/api/v1`). They use the shared database via **`@ats-platform/db`** and validate the candidate JWT issued by **`POST /api/v1/auth/login`** on the central API.

---

## Authentication

All routes below require:

| Header | Value |
|--------|--------|
| `Authorization` | `Bearer <access_token>` |

Tokens are verified with **`JWT_SECRET`** (minimum 16 characters), shared with the signing side used when **`POST /api/v1/auth/login`** returns an access token. Configure this in **`apps/my-applications/.env.local`** for local dev so it matches **`apps/api`** (and any client that mints tokens).

---

## CV import (file upload pipeline)

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/api/my-applications/cv/upload` | Accepts PDF or Word (`.pdf`, `.doc`, `.docx`); stores file and creates a `candidate_cv_parse` row |
| `POST` | `/api/my-applications/cv/parse` | Extracts text from the stored file, runs structured parsing, saves draft `parsedJson` |
| `POST` | `/api/my-applications/cv/save` | Persists edited `ParsedCvPayload` to profile + CV tables; marks parse **confirmed** |
| `GET` | `/api/my-applications/cv/download?id=<parseId>` | Streams the original uploaded file (`Content-Disposition: attachment`) |

### `POST /cv/upload`

- **Body:** `multipart/form-data` with field **`file`**
- **Limits:** 10 MB max; MIME must resolve to PDF or Word (see handler for allowed types)
- **200 JSON:** `{ "data": { "parseId": "<uuid>", "originalFilename": "..." } }`
- **Errors:** `401`, `400`, `413`, `415`

### `POST /cv/parse`

- **Body:** JSON `{ "parseId": "<uuid>" }`
- **200 JSON:** `{ "data": { "parseId": "...", "payload": <ParsedCvPayload> } }`
- **Errors:** `401`, `400`, `404`, `422` (`EXTRACT_FAILED`)

### `POST /cv/save`

- **Body:** JSON `{ "parseId": "<uuid>", "payload": <ParsedCvPayload> }`
- **200:** Updates profile, replaces CV education/experience rows, sets parse status to **confirmed**
- **Errors:** `401`, `400`, `404`

### `ParsedCvPayload` shape

Aligned with `apps/my-applications/src/types/cv-parse.ts`:

```json
{
  "candidate": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "currentTitle": ""
  },
  "education": [
    { "qualification": "", "institution": "", "startDate": "", "endDate": "" }
  ],
  "experience": [
    { "company": "", "role": "", "startDate": "", "endDate": "" }
  ]
}
```

---

## Profile screenshot import (LinkedIn-style prototype)

Uses OpenAI vision + JSON mode to read **Experience** or **Education** from an uploaded image, then optional save into the same CV tables as file import.

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/api/my-applications/screenshot/extract` | Image + section → structured `experience` or `education` rows |
| `POST` | `/api/my-applications/screenshot/save` | Full `ParsedCvPayload` → upserts profile + replaces CV rows (no file attachment) |

### Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes for extract | Server-side OpenAI calls |
| `OPENAI_CV_MODEL` | No | Defaults to `gpt-4o-mini` |

### `POST /screenshot/extract`

- **Body:** `multipart/form-data`
  - **`section`:** `experience` \| `education`
  - **`file`:** image (`image/*`), max **10 MB**
- **200 JSON:** `{ "data": { "section": "...", "experience": [...], "education": [...] } }` (non-matching section arrays empty)
- **Errors:** `401`, `400`, `413`, `415`, `500` (`CONFIG_ERROR` if no API key), `502`, `422`

### `POST /screenshot/save`

- **Body:** JSON `{ "payload": <ParsedCvPayload> }`
- **200:** `{ "data": { "ok": true } }`
- **Errors:** `401`, `400`

---

## Related

- Central REST API: [README.md](README.md), [authentication.md](authentication.md)
- Monorepo layout: [../../PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md)
- DB models: [../db-schema.md](../db-schema.md), `packages/db/prisma/schema.prisma`
