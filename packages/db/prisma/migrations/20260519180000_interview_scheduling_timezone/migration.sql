-- Interview scheduling timezone + optional candidate profile timezone
ALTER TABLE "application_interviews"
ADD COLUMN "scheduling_time_zone" VARCHAR(64) NOT NULL DEFAULT 'UTC';

ALTER TABLE "candidate_profiles"
ADD COLUMN "time_zone" VARCHAR(64);
