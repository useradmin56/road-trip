-- ==================================================================
-- SUPABASE DATABASE SETUP FOR TOUR MANAGEMENT SYSTEM
-- ==================================================================
-- Run this SQL in your Supabase SQL Editor to create the table
-- ==================================================================

-- Create the main table for storing tour management data
CREATE TABLE IF NOT EXISTS tour_management_data (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_tour_management_user_id 
ON tour_management_data(user_id);

-- Create index on updated_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_tour_management_updated_at 
ON tour_management_data(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tour_management_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for testing)
-- Note: In production, you should implement proper authentication
CREATE POLICY "Enable all access for all users" 
ON tour_management_data
FOR ALL 
USING (true)
WITH CHECK (true);

-- Optional: Add a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_tour_management_updated_at 
BEFORE UPDATE ON tour_management_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================
-- VERIFICATION QUERIES (Run these to test)
-- ==================================================================

-- Check if table was created successfully
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tour_management_data';

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tour_management_data';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tour_management_data';

-- ==================================================================
-- SAMPLE QUERIES FOR TESTING
-- ==================================================================

-- View all records
SELECT * FROM tour_management_data;

-- Count total records
SELECT COUNT(*) FROM tour_management_data;

-- Delete all records (if needed to start fresh)
-- TRUNCATE TABLE tour_management_data;

-- Drop table (if needed to recreate)
-- DROP TABLE IF EXISTS tour_management_data CASCADE;

-- ==================================================================
-- NOTES:
-- ==================================================================
-- 1. The 'data' column is JSONB type which stores all tour data
-- 2. Each user can have one record identified by user_id
-- 3. The app automatically creates/updates records
-- 4. RLS is enabled for security (currently allows all access)
-- 5. For production, implement proper authentication and policies
-- ==================================================================

