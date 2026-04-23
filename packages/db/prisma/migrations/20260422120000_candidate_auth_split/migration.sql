-- Candidate auth long-term split:
-- - candidates -> candidate_accounts (identity + login state)
-- - candidate_profiles (profile data)
-- - candidate_auth_providers (OAuth identities)
-- - candidate_sessions / token tables (session + verification + reset)

-- CreateEnum
CREATE TYPE "CandidateAccountStatus" AS ENUM ('pending_verification', 'active', 'locked', 'disabled');

-- CreateEnum
CREATE TYPE "CandidateAuthProviderType" AS ENUM ('google', 'linkedin');

-- Rename base table for account identity
ALTER TABLE "candidates" RENAME TO "candidate_accounts";

-- Add account lifecycle columns
ALTER TABLE "candidate_accounts"
  ADD COLUMN "email_normalized" VARCHAR(255),
  ADD COLUMN "status" "CandidateAccountStatus" NOT NULL DEFAULT 'pending_verification',
  ADD COLUMN "email_verified_at" TIMESTAMPTZ(6),
  ADD COLUMN "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "locked_until" TIMESTAMPTZ(6);

-- Backfill normalized email and status from legacy is_active
UPDATE "candidate_accounts"
SET
  "email_normalized" = LOWER(TRIM("email")),
  "status" = CASE WHEN "is_active" THEN 'active'::"CandidateAccountStatus" ELSE 'disabled'::"CandidateAccountStatus" END;

ALTER TABLE "candidate_accounts"
  ALTER COLUMN "email_normalized" SET NOT NULL;

-- Create candidate profile table
CREATE TABLE "candidate_profiles" (
  "candidate_account_id" UUID NOT NULL,
  "first_name" VARCHAR(100),
  "last_name" VARCHAR(100),
  "avatar_url" VARCHAR(500),
  "phone" VARCHAR(30),
  "resume_url" VARCHAR(500),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("candidate_account_id")
);

-- Migrate profile data from legacy candidate columns
INSERT INTO "candidate_profiles" (
  "candidate_account_id",
  "first_name",
  "last_name",
  "avatar_url",
  "phone",
  "resume_url",
  "created_at",
  "updated_at"
)
SELECT
  "id",
  "first_name",
  "last_name",
  "avatar_url",
  "phone",
  "resume_url",
  "created_at",
  "updated_at"
FROM "candidate_accounts";

-- Create OAuth provider links
CREATE TABLE "candidate_auth_providers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "candidate_account_id" UUID NOT NULL,
  "provider" "CandidateAuthProviderType" NOT NULL,
  "provider_user_id" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_auth_providers_pkey" PRIMARY KEY ("id")
);

-- Migrate supported provider identities
INSERT INTO "candidate_auth_providers" (
  "candidate_account_id",
  "provider",
  "provider_user_id",
  "created_at"
)
SELECT
  "id",
  "auth_provider"::"CandidateAuthProviderType",
  "auth_provider_id",
  "created_at"
FROM "candidate_accounts"
WHERE "auth_provider" IN ('google', 'linkedin')
  AND "auth_provider_id" IS NOT NULL;

-- Session + token tables
CREATE TABLE "candidate_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "candidate_account_id" UUID NOT NULL,
  "refresh_token_hash" VARCHAR(255) NOT NULL,
  "user_agent" VARCHAR(512),
  "ip_address" VARCHAR(64),
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "candidate_verification_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "candidate_account_id" UUID NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "candidate_password_reset_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "candidate_account_id" UUID NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- Move relation columns from candidate_id -> candidate_account_id
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_candidate_id_fkey";
ALTER TABLE "applications" DROP CONSTRAINT "applications_candidate_id_fkey";

ALTER TABLE "bookmarks" RENAME COLUMN "candidate_id" TO "candidate_account_id";
ALTER TABLE "applications" RENAME COLUMN "candidate_id" TO "candidate_account_id";

DROP INDEX "idx_applications_unique";
CREATE UNIQUE INDEX "idx_applications_unique" ON "applications"("candidate_account_id", "job_posting_id");

-- Remove legacy auth/profile columns from account table
ALTER TABLE "candidate_accounts"
  DROP COLUMN "first_name",
  DROP COLUMN "last_name",
  DROP COLUMN "auth_provider",
  DROP COLUMN "auth_provider_id",
  DROP COLUMN "avatar_url",
  DROP COLUMN "phone",
  DROP COLUMN "resume_url",
  DROP COLUMN "is_active";

-- Drop old indexes and create new ones
DROP INDEX IF EXISTS "candidates_email_key";
DROP INDEX IF EXISTS "candidates_auth_provider_auth_provider_id_idx";

CREATE UNIQUE INDEX "candidate_accounts_email_key" ON "candidate_accounts"("email");
CREATE UNIQUE INDEX "candidate_accounts_email_normalized_key" ON "candidate_accounts"("email_normalized");
CREATE INDEX "idx_candidate_accounts_status" ON "candidate_accounts"("status");
CREATE UNIQUE INDEX "candidate_auth_providers_provider_provider_user_id_key" ON "candidate_auth_providers"("provider", "provider_user_id");
CREATE INDEX "idx_candidate_auth_providers_account" ON "candidate_auth_providers"("candidate_account_id");
CREATE INDEX "idx_candidate_sessions_account_expires" ON "candidate_sessions"("candidate_account_id", "expires_at" DESC);
CREATE INDEX "idx_candidate_verification_tokens_account" ON "candidate_verification_tokens"("candidate_account_id", "expires_at" DESC);
CREATE INDEX "idx_candidate_password_reset_tokens_account" ON "candidate_password_reset_tokens"("candidate_account_id", "expires_at" DESC);

-- Foreign keys
ALTER TABLE "candidate_profiles"
  ADD CONSTRAINT "candidate_profiles_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_auth_providers"
  ADD CONSTRAINT "candidate_auth_providers_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_sessions"
  ADD CONSTRAINT "candidate_sessions_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_verification_tokens"
  ADD CONSTRAINT "candidate_verification_tokens_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_password_reset_tokens"
  ADD CONSTRAINT "candidate_password_reset_tokens_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "applications"
  ADD CONSTRAINT "applications_candidate_account_id_fkey"
  FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
