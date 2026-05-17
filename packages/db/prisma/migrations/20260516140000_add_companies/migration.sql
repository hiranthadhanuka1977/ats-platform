-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "logo_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- Backfill existing postings with a default company
INSERT INTO "companies" ("name", "is_active", "sort_order") VALUES ('Default company', true, 0);

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN "company_id" INTEGER;

UPDATE "job_postings" SET "company_id" = (SELECT "id" FROM "companies" WHERE "name" = 'Default company' LIMIT 1);

ALTER TABLE "job_postings" ALTER COLUMN "company_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "idx_postings_company" ON "job_postings"("company_id");
