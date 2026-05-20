-- Keep the earliest scheduled interview per application; remove duplicates.
DELETE FROM "application_interviews" AS a
USING "application_interviews" AS b
WHERE a."application_id" = b."application_id"
  AND a."created_at" > b."created_at";

-- Drop non-unique index replaced by unique application_id.
DROP INDEX IF EXISTS "idx_application_interviews_app_time";

-- One interview row per application.
CREATE UNIQUE INDEX "application_interviews_application_id_key" ON "application_interviews"("application_id");

CREATE INDEX "idx_application_interviews_starts_at" ON "application_interviews"("starts_at" DESC);
