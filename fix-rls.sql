-- =====================================================
-- Supabase RLS Fix - Run this in SQL Editor
-- This disables RLS to allow service role full access
-- =====================================================

-- Disable Row Level Security on all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exports DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might cause issues
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "user_settings_policy" ON user_settings;
DROP POLICY IF EXISTS "conversations_policy" ON conversations;
DROP POLICY IF EXISTS "messages_policy" ON messages;
DROP POLICY IF EXISTS "exports_policy" ON exports;

-- Grant full permissions to service role (for server-side access)
GRANT ALL PRIVILEGES ON users TO service_role;
GRANT ALL PRIVILEGES ON user_settings TO service_role;
GRANT ALL PRIVILEGES ON conversations TO service_role;
GRANT ALL PRIVILEGES ON messages TO service_role;
GRANT ALL PRIVILEGES ON exports TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also grant to anon for potential public access
GRANT SELECT ON users TO anon;
