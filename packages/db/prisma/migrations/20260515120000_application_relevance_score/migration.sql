-- Persist AI relevance score per application (stable until inputs change).
ALTER TABLE "applications"
  ADD COLUMN "relevance_score" SMALLINT,
  ADD COLUMN "relevance_breakdown" TEXT,
  ADD COLUMN "relevance_scored_at" TIMESTAMPTZ(6),
  ADD COLUMN "relevance_input_hash" VARCHAR(64);
