-- AlterTable
ALTER TABLE "application_status_events" ADD COLUMN "reason" TEXT,
ADD COLUMN "note" TEXT,
ADD COLUMN "change_source" VARCHAR(50);
