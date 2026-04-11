-- Add is_active to lookup tables (archive / hide from new job forms without deleting)

ALTER TABLE "employment_types" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "experience_levels" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "skills" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "benefits" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tags" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
