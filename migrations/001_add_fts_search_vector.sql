-- Migration: Add Full-Text Search to summaries table
-- This migration adds a tsvector column for fast full-text search
-- Run this migration manually against your PostgreSQL database

-- Step 1: Add the search_vector column to summaries table
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create the trigger function to auto-update search_vector
CREATE OR REPLACE FUNCTION summaries_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS summaries_search_trigger ON summaries;
CREATE TRIGGER summaries_search_trigger
BEFORE INSERT OR UPDATE OF title, summary ON summaries
FOR EACH ROW EXECUTE FUNCTION summaries_search_update();

-- Step 4: Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS summaries_search_idx ON summaries USING GIN(search_vector);

-- Step 5: Backfill existing data (this may take a moment for large datasets)
UPDATE summaries SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(summary, '')), 'B')
WHERE search_vector IS NULL;

-- Step 6: Create additional indexes for performance
CREATE INDEX IF NOT EXISTS summaries_category_idx ON summaries(category_id);
CREATE INDEX IF NOT EXISTS messages_timestamp_idx ON messages(timestamp DESC);

-- Verify the migration
SELECT
  COUNT(*) as total_summaries,
  COUNT(search_vector) as with_search_vector
FROM summaries;
