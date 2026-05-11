-- CreateEnum
CREATE TYPE "CandidateCoverLetterMode" AS ENUM ('file', 'text');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "experience_months" INTEGER,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "has_domain_experience" BOOLEAN,
ADD COLUMN     "notice_periods" TEXT,
ADD COLUMN     "salary_expectation_annual" DECIMAL(12,2),
ADD COLUMN     "short_motivation" TEXT,
ADD COLUMN     "willing_to_relocate" BOOLEAN,
ADD COLUMN     "work_mode_preference" VARCHAR(50);

-- AlterTable
ALTER TABLE "candidate_accounts" RENAME CONSTRAINT "candidates_pkey" TO "candidate_accounts_pkey";

-- CreateTable
CREATE TABLE "candidate_cover_letters" (
    "id" UUID NOT NULL,
    "candidate_account_id" UUID NOT NULL,
    "mode" "CandidateCoverLetterMode" NOT NULL,
    "body" TEXT,
    "file_url" VARCHAR(500),
    "file_name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_cover_letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_candidate_cover_letters_candidate_created" ON "candidate_cover_letters"("candidate_account_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "candidate_cover_letters" ADD CONSTRAINT "candidate_cover_letters_candidate_account_id_fkey" FOREIGN KEY ("candidate_account_id") REFERENCES "candidate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
