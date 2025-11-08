-- Create generation_quota table for tracking AI article generation usage
-- Migration: 0004_create_generation_quota_table.sql

BEGIN;

-- Create enum for tier types
CREATE TYPE tier_type AS ENUM ('free', 'pro');

-- Create generation_quota table
CREATE TABLE IF NOT EXISTS generation_quota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    tier tier_type NOT NULL DEFAULT 'free',
    generation_count INTEGER NOT NULL DEFAULT 0,
    last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on clerk_user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_generation_quota_clerk_user_id
    ON generation_quota(clerk_user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_generation_quota_updated_at ON generation_quota;
CREATE TRIGGER update_generation_quota_updated_at
    BEFORE UPDATE ON generation_quota
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS (Row Level Security)
ALTER TABLE generation_quota DISABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE generation_quota IS 'Tracks AI article generation quota and usage per user';
COMMENT ON COLUMN generation_quota.clerk_user_id IS 'Clerk user ID (unique identifier)';
COMMENT ON COLUMN generation_quota.tier IS 'User subscription tier (free/pro)';
COMMENT ON COLUMN generation_quota.generation_count IS 'Number of articles generated in current period';
COMMENT ON COLUMN generation_quota.last_reset_at IS 'Timestamp of last quota reset (monthly)';

COMMIT;
