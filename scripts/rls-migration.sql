-- ==============================================================================
-- Supabase Row Level Security (RLS) Migration
-- 
-- Description:
-- This script enables RLS on all public tables exposed via PostgREST.
-- Since the application uses Prisma (which connects as the DB owner and 
-- bypasses RLS) for all database operations, and DOES NOT use the Supabase 
-- JS client for database queries (only for Storage), we can safely enable 
-- RLS with NO policies. 
--
-- This completely blocks access to these tables via the public REST API 
-- (using the anon key), securing sensitive data like OAuth tokens in the 
-- `accounts` table.
-- ==============================================================================

-- Enable RLS on all exposed tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "galleries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artworks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_artworks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artwork_reports" ENABLE ROW LEVEL SECURITY;

-- No policies are created. 
-- By default, when RLS is enabled without any policies, the default-deny 
-- behavior blocks all operations (SELECT, INSERT, UPDATE, DELETE) for roles 
-- that do not bypass RLS (like 'anon' and 'authenticated').
