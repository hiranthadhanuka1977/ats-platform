-- CreateTable
CREATE TABLE "application_status_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "from_status" "ApplicationStatus",
    "to_status" "ApplicationStatus" NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by_staff_id" UUID,

    CONSTRAINT "application_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_application_status_events_app_time" ON "application_status_events"("application_id", "changed_at" DESC);

-- AddForeignKey
ALTER TABLE "application_status_events" ADD CONSTRAINT "application_status_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_events" ADD CONSTRAINT "application_status_events_changed_by_staff_id_fkey" FOREIGN KEY ("changed_by_staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: one "submitted" event per existing application at applied_at
INSERT INTO "application_status_events" ("application_id", "from_status", "to_status", "changed_at")
SELECT "id", NULL, "status", "applied_at"
FROM "applications";
