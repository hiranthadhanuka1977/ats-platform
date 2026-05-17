-- CreateEnum
CREATE TYPE "SalaryPeriod" AS ENUM ('annual', 'monthly');

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN "salary_period" "SalaryPeriod" NOT NULL DEFAULT 'annual';
