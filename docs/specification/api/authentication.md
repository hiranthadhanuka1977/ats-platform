# API — Authenticating users

**Doc version:** 1.2  
**Last updated:** 22 April 2026  
**Implementation source:** `apps/api/src/modules/auth/index.ts`

This document reflects the currently implemented auth routes.

---

## Implemented endpoints

### Login

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/login` |
| **Auth** | None |
| **Notes** | Supports `audience: "candidate"` (default) and `audience: "staff"` |

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "••••••••",
  "audience": "candidate"
}
```

**Candidate login behavior**

- Uses `candidate_accounts.email_normalized` lookup.
- Rejects `pending_verification` with `EMAIL_NOT_VERIFIED`.
- Rejects `disabled` with `ACCOUNT_DISABLED`.
- Rejects locked accounts (`locked_until > now`) with `ACCOUNT_LOCKED`.
- Failed attempts increment `failed_login_attempts`; account locks for 15 minutes after 5 failed attempts.
- On success, resets lock counters and updates `last_login_at`.

**Response `200 OK`**

```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "refreshToken": "<jwt>",
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "type": "candidate"
    }
  }
}
```

**Errors**

| Code | HTTP |
|------|------|
| `VALIDATION_ERROR` | 400 |
| `INVALID_CREDENTIALS` | 401 |
| `EMAIL_NOT_VERIFIED` | 403 |
| `ACCOUNT_DISABLED` | 403 |
| `ACCOUNT_LOCKED` | 403 |

---

### Current principal (`/auth/me`)

| Key | Value |
|-----|--------|
| **Method** | `GET` |
| **Path** | `/api/v1/auth/me` |
| **Auth** | `Authorization: Bearer <access_token>` |

**Candidate response `200 OK`**

```json
{
  "data": {
    "id": "uuid",
    "type": "candidate",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatarUrl": null
  }
}
```

**Staff response `200 OK`**

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

**Errors**

| Code | HTTP |
|------|------|
| `UNAUTHORIZED` | 401 |

---

### Logout

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/logout` |
| **Auth** | None required by current implementation |
| **Response** | `204 No Content` |

---

## Not currently implemented in `authModule`

- `POST /api/v1/auth/refresh`
- OAuth routes (`/auth/oauth/*`)

---

## Data model mapping

| Concept | Table |
|---------|--------|
| Candidate identity | `candidate_accounts` + `candidate_profiles` |
| Staff identity | `users` |
