# API — Registration & sign-in

**Doc version:** 1.2  
**Last updated:** 22 April 2026  
**Implementation source:** `apps/api/src/modules/candidates/index.ts`

Endpoints for candidate registration, OTP verification, resend OTP, and password recovery.

---

## API dictionary

### Register candidate (email + password + profile)

| Key | Value |
|-----|--------|
| **Operation** | Create/update a pending candidate account and issue verification OTP |
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
| `email` | string | Yes | Normalized to lowercase and persisted as both `email` and `emailNormalized` (`candidate_accounts.email_normalized`) for case-insensitive login/lookup. |
| `password` | string | Yes | Enforce policy (length, complexity) server-side |
| `firstName` | string | No | Stored in `candidate_profiles.first_name` |
| `lastName` | string | No | Stored in `candidate_profiles.last_name` |

**Response `202 Accepted`**

```json
{
  "data": {
    "email": "jane@example.com",
    "message": "A 6-digit OTP has been sent to your email."
  }
}
```

In `OTP_DELIVERY_MODE=dummy`, message is `"Use OTP 111111 for testing."`

**Errors**

| Code | HTTP | When |
|------|------|------|
| `EMAIL_ALREADY_EXISTS` | 409 | Existing non-pending account with the same email |
| `VALIDATION_ERROR` | 400 | Invalid email or weak password |
| `EMAIL_SEND_FAILED` | 500 | OTP generation/send failed |

---

### Verify email (OTP)

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/verify-email` |
| **Auth** | None |

**Request body**

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

**Response `200 OK`**

```json
{
  "data": {
    "message": "Email verified successfully."
  }
}
```

**Errors**

| Code | HTTP |
|------|------|
| `VALIDATION_ERROR` | 400 |
| `INVALID_OR_EXPIRED_TOKEN` | 400 |

---

### Resend OTP

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/candidates/resend-otp` |
| **Auth** | None |

**Request body**

```json
{
  "email": "jane@example.com"
}
```

**Response `202 Accepted`**

```json
{
  "data": {
    "message": "A new OTP has been sent to your email."
  }
}
```

**Rate limiting behavior**

- Cooldown: one resend per 60 seconds.
- Hourly cap: max 5 OTP issues per hour.
- On limit hit: `429 RATE_LIMITED` with `data.retryAfterSec`.
- Non-enumerating behavior for non-pending accounts.

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
| `VALIDATION_ERROR` | 400 | Invalid email |

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
| `INVALID_OR_EXPIRED_TOKEN` | 400 | Invalid/expired token |
| `VALIDATION_ERROR` | 400 | Invalid password shape |

---

### Sign in (email + password)

Use `POST /api/v1/auth/login` with `audience: "candidate"` (see [authentication.md](authentication.md)).

---

## UI mapping (`apps/candidate-portal`)

| UI control | API |
|------------|-----|
| Email + password + Log In | `POST /auth/login` |
| Forgot password? | `POST /candidates/forgot-password` |
| Register details form | `POST /candidates/register` |
| Verify OTP step | `POST /candidates/verify-email` |
| Resend OTP | `POST /candidates/resend-otp` |

---

## Data model mapping

| API | Table |
|-----|--------|
| Candidate account | `candidate_accounts` |
| Candidate profile | `candidate_profiles` |
| Email verification OTP | `candidate_verification_tokens` |
| Password reset token | `candidate_password_reset_tokens` |

---

## Related

- [README.md](README.md) — API conventions and endpoint index  
- [authentication.md](authentication.md) — `/auth/login`, `/auth/me`, `/auth/logout`
