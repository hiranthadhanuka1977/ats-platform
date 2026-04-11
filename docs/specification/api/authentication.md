# API — Authenticating users

**Doc version:** 1.1 (aligned with [`schema.prisma`](../../../packages/db/prisma/schema.prisma) `User`, `Candidate`, [`db-schema.md`](../db-schema.md) §4–§5)

Endpoints for **establishing**, **refreshing**, and **ending** authenticated sessions. These apply to **candidates** (portal) and optionally **internal users** (admin/recruiter) if you use the same auth service with different `aud`/`role` claims.

---

## API dictionary

### Issue access + refresh tokens (login)

| Key | Value |
|-----|--------|
| **Operation** | Authenticate with email and password |
| **Method** | `POST` |
| **Path** | `/api/v1/auth/login` |
| **Auth** | None |
| **Description** | Validates credentials and returns short-lived **access token** (JWT) and **refresh token** (opaque string or JWT). Implementation may split **candidate** vs **staff** login with separate paths (`/auth/candidate/login` vs `/auth/staff/login`) if policies differ. |

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "••••••••",
  "audience": "candidate"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `email` | string | Yes | Normalised to lowercase server-side |
| `password` | string | Yes | Plain text over TLS only |
| `audience` | string | No | e.g. `candidate` \| `staff` — default `candidate` for portal |

**Response `200 OK`**

```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "refreshToken": "<opaque>",
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "type": "candidate"
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `expiresIn` | Access token lifetime in **seconds** |
| `user.type` | `candidate` \| `staff` (maps to `candidates` vs `users` tables) |

**Errors**

| Code | HTTP | When |
|------|------|------|
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `ACCOUNT_DISABLED` | 403 | `candidates.is_active` or `users.is_active` is `false` |
| `RATE_LIMITED` | 429 | Too many attempts |

---

### Refresh access token

| Key | Value |
|-----|--------|
| **Operation** | Obtain a new access token without re-entering password |
| **Method** | `POST` |
| **Path** | `/api/v1/auth/refresh` |
| **Auth** | Refresh token (body or cookie — see below) |

**Request (body variant)**

```json
{
  "refreshToken": "<opaque>"
}
```

**Request (cookie variant)**  
`Cookie: refresh_token=<opaque>` — no body.

**Response `200 OK`**

```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

**Errors**

| Code | HTTP | When |
|------|------|------|
| `INVALID_REFRESH_TOKEN` | 401 | Revoked or expired |
| `SESSION_EXPIRED` | 401 | Refresh rotation invalidated old token |

---

### Logout (invalidate refresh)

| Key | Value |
|-----|--------|
| **Operation** | End session server-side |
| **Method** | `POST` |
| **Path** | `/api/v1/auth/logout` |
| **Auth** | Optional refresh token or access token (implementation choice) |

**Response `204 No Content`** — success with no body.

**Errors**

| Code | HTTP | When |
|------|------|------|
| `UNAUTHORIZED` | 401 | If you require a valid token to logout |

---

### Current principal (“who am I”)

| Key | Value |
|-----|--------|
| **Operation** | Return the authenticated user profile |
| **Method** | `GET` |
| **Path** | `/api/v1/auth/me` |
| **Auth** | `Authorization: Bearer <access_token>` |

**Response `200 OK` (candidate)**

```json
{
  "data": {
    "id": "uuid",
    "type": "candidate",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatarUrl": "https://…"
  }
}
```

**Response `200 OK` (staff)**

```json
{
  "data": {
    "id": "uuid",
    "type": "staff",
    "email": "admin@talenthub.com",
    "name": "Admin User",
    "role": "recruiter"
  }
}
```

`role` is the `UserRole` enum from [`schema.prisma`](../../../packages/db/prisma/schema.prisma): `admin` \| `recruiter` \| `hiring_manager` (same strings in API and DB; see [db-schema.md §5.1](../db-schema.md) for DDL vs native enum).

**Errors**

| Code | HTTP | When |
|------|------|------|
| `UNAUTHORIZED` | 401 | Missing/invalid/expired access token |

---

## JWT access token claims (recommended)

Include at minimum:

| Claim | Purpose |
|-------|---------|
| `sub` | User UUID (`candidates.id` or `users.id`) |
| `typ` | `candidate` \| `staff` |
| `email` | For display / audit |
| `exp` | Expiry |
| `iat` | Issued-at |

For staff, include `role` or resolve server-side from DB on each request for stricter RBAC.

---

## Data model mapping

| Concept | Table |
|---------|--------|
| Candidate identity | `candidates` |
| Staff identity | `users` |
| Refresh session | Store server-side or signed cookie; not in Prisma schema by default — add `sessions` / `refresh_tokens` table if you persist |

---

## Related

- [README.md](README.md) — *Schema alignment (Prisma & db-schema.md)*, enum tables, JWT conventions  
- [registration-sign-in.md](registration-sign-in.md) — account creation and OAuth token exchange  
- [job-listing.md](job-listing.md) — public + optional authenticated listing
