# API — Registration & sign-in

**Doc version:** 1.1 (aligned with [`candidates`](../../../packages/db/prisma/schema.prisma) model, [`db-schema.md`](../db-schema.md) §3.1, §5, §5.1)

Endpoints for **creating** candidate accounts, **password-based** sign-in flows (aligned with `docs/markup/candidate-portal/login.html`), **OAuth** (Google, LinkedIn), and **password recovery**. Staff registration is usually invite-only and not exposed on the public portal.

---

## API dictionary

### Register candidate (email + password)

| Key | Value |
|-----|--------|
| **Operation** | Create a new candidate account |
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/register` |
| **Auth** | None |

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "••••••••",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `email` | string | Yes | **Normalise to lowercase** before persist; uniqueness matches `candidates.email` (see [db-schema.md](../db-schema.md) §5.1 for `LOWER(email)` vs Prisma `@@unique`). |
| `password` | string | Yes | Enforce policy (length, complexity) server-side |
| `firstName` | string | No | Maps to `candidates.first_name` |
| `lastName` | string | No | Maps to `candidates.last_name` |

**Response `201 Created`**

```json
{
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "message": "Check your email to verify your account"
  }
}
```

Optional: return tokens immediately after register if email verification is deferred.

**Errors**

| Code | HTTP | When |
|------|------|------|
| `EMAIL_ALREADY_EXISTS` | 409 | Violates unique constraint on `candidates.email` (compare case-insensitively if DB uses `LOWER(email)` index) |
| `VALIDATION_ERROR` | 400 | Weak password / invalid email |
| `RATE_LIMITED` | 429 | Too many registrations from IP |

---

### Sign in (email + password)

Same contract as **Issue access + refresh tokens** in [authentication.md](authentication.md) — `POST /api/v1/auth/login` with `audience: "candidate"`.

---

### Forgot password (request reset email)

| Key | Value |
|-----|--------|
| **Operation** | Send password reset link/token to email |
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/forgot-password` |
| **Auth** | None |

**Request body**

```json
{
  "email": "jane@example.com"
}
```

**Response `202 Accepted`** (always same message to prevent email enumeration)

```json
{
  "data": {
    "message": "If an account exists for this email, you will receive reset instructions."
  }
}
```

**Errors**

| Code | HTTP | When |
|------|------|------|
| `RATE_LIMITED` | 429 | Too many requests |

---

### Reset password (complete flow)

| Key | Value |
|-----|--------|
| **Operation** | Set new password using token from email |
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/reset-password` |
| **Auth** | None |

**Request body**

```json
{
  "token": "<signed-reset-token>",
  "newPassword": "••••••••"
}
```

**Response `200 OK`**

```json
{
  "data": {
    "message": "Password updated. You can sign in now."
  }
}
```

**Errors**

| Code | HTTP | When |
|------|------|------|
| `INVALID_OR_EXPIRED_TOKEN` | 400 | Bad token |
| `VALIDATION_ERROR` | 400 | Weak new password |

---

### OAuth — start redirect

| Key | Value |
|-----|--------|
| **Operation** | Begin Google or LinkedIn OAuth |
| **Method** | `GET` |
| **Path** | `/api/v1/auth/oauth/{provider}/start` |
| **Auth** | None |

| Path param | Values |
|------------|--------|
| `provider` | `google` \| `linkedin` |

**Query**

| Param | Required | Description |
|-------|----------|-------------|
| `redirect_uri` | Yes | Front-end URL to return user after OAuth (must be allowlisted) |
| `state` | Recommended | CSRF nonce |

**Response `302`** — redirect to IdP authorization URL.

---

### OAuth — callback

| Key | Value |
|-----|--------|
| **Operation** | Exchange code for tokens; create or link candidate |
| **Method** | `GET` |
| **Path** | `/api/v1/auth/oauth/{provider}/callback` |
| **Auth** | None (uses `code` from IdP) |

**Query**

| Param | Description |
|-------|-------------|
| `code` | Authorization code |
| `state` | Must match `start` step |

**Response `302`** — redirect to `redirect_uri` with tokens in fragment or short-lived `exchange` code:

```
https://portal.example.com/oauth/callback#access_token=…&refresh_token=…
```

Or `302` to:

```
https://portal.example.com/oauth/callback?code=<one-time-exchange-code>
```

Then front-end calls `POST /auth/oauth/exchange` with that code for JSON tokens (more secure for SPAs).

**Alternative: POST exchange**

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/oauth/exchange` |

```json
{ "code": "<one-time-code-from-callback>" }
```

**Response `200`** — same shape as login (`accessToken`, `refreshToken`, `user`).

**Data mapping**

| Field | Table column |
|-------|----------------|
| Provider subject | `candidates.auth_provider` + `candidates.auth_provider_id` |
| Email | `candidates.email` |
| Name / picture | `first_name`, `last_name`, `avatar_url` |

---

### Verify email (optional)

| Key | Value |
|-----|--------|
| **Operation** | Confirm email after registration |
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/verify-email` |

```json
{ "token": "<signed-verification-token>" }
```

**Response `200`** — account marked verified (add `email_verified_at` column if needed; not in current Prisma schema).

---

## UI mapping (`markup/candidate-portal/login.html`)

| UI control | API |
|------------|-----|
| Email + password + Log In | `POST /auth/login` |
| Continue with Google | `GET /auth/oauth/google/start` → callback |
| Continue with LinkedIn | `GET /auth/oauth/linkedin/start` → callback |
| Forgot password? | `POST /candidates/forgot-password` |
| Create one now (sign up) | `POST /candidates/register` (separate page or modal) |

---

## Data model mapping

| API | Table |
|-----|--------|
| Register / OAuth user | `candidates` |
| Password hash | `candidates.password_hash` (null for OAuth-only) |
| OAuth | `auth_provider`, `auth_provider_id` |

---

## Related

- [README.md](README.md) — *Schema alignment*, candidate email uniqueness (§5.1)  
- [authentication.md](authentication.md) — tokens and `/auth/me`  
- [job-detail.md](job-detail.md) — apply after sign-in
