-- CV parse prototype + profile fields (see schema.prisma)

CREATE TYPE "CandidateCvParseStatus" AS ENUM ('draft', 'confirmed');

ALTER TABLE "candidate_profiles" ADD COLUMN "location" VARCHAR(200);
ALTER TABLE "candidate_profiles" ADD COLUMN "current_title" VARCHAR(200);

CREATE TABLE "candidate_cv_parses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_account_id" UUID NOT NULL,
    "original_filename" VARCHAR(500) NOT NULL,
    "stored_path" VARCHAR(1000) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "extracted_text" TEXT,
    "parsed_json" JSONB,
    "status" "CandidateCvParseStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_cv_parses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_candidate_cv_parses_account" ON "candidate_cv_parses" ("candidate_account_id");

ALTER TABLE "candidate_cv_parses" ADD CONSTRAINT "candidate_cv_parses_candidate_account_id_fkey" FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "candidate_cv_educations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_account_id" UUID NOT NULL,
    "qualification" VARCHAR(400) NOT NULL,
    "institution" VARCHAR(400) NOT NULL,
    "start_date" VARCHAR(80),
    "end_date" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_cv_educations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_candidate_cv_education_account" ON "candidate_cv_educations" ("candidate_account_id");

ALTER TABLE "candidate_cv_educations" ADD CONSTRAINT "candidate_cv_educations_candidate_account_id_fkey" FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "candidate_cv_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_account_id" UUID NOT NULL,
    "company" VARCHAR(300) NOT NULL,
    "role" VARCHAR(300) NOT NULL,
    "start_date" VARCHAR(80),
    "end_date" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_cv_experiences_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_candidate_cv_experience_account" ON "candidate_cv_experiences" ("candidate_account_id");

ALTER TABLE "candidate_cv_experiences" ADD CONSTRAINT "candidate_cv_experiences_candidate_account_id_fkey" FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
