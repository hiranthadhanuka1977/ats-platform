-- CreateTable
CREATE TABLE "application_interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "notify_candidate_email" BOOLEAN NOT NULL DEFAULT true,
    "notification_sent_at" TIMESTAMPTZ(6),
    "scheduled_by_staff_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_application_interviews_app_time" ON "application_interviews"("application_id", "starts_at" DESC);

-- AddForeignKey
ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_scheduled_by_staff_id_fkey" FOREIGN KEY ("scheduled_by_staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
