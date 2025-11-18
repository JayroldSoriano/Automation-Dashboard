-- Database setup for Automation Dashboard
-- Run these commands in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table and triggers
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  subscription_tier TEXT NOT NULL DEFAULT 'Standard',
  subscription_expiration DATE NULL,
  status TEXT NOT NULL DEFAULT 'active',
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin', 'user'])),
  CONSTRAINT users_status_check CHECK (status = ANY (ARRAY['active', 'inactive'])),
  CONSTRAINT users_subscription_tier_check CHECK (
    subscription_tier = ANY (ARRAY['Standard', 'Premium', 'Enterprise'])
  )
);

-- Helper trigger functions
CREATE OR REPLACE FUNCTION public.hash_user_password()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.password IS DISTINCT FROM OLD.password THEN
    NEW.password = crypt(NEW.password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.subscription_expiration IS NOT NULL AND NEW.subscription_expiration < CURRENT_DATE THEN
    NEW.status = 'inactive';
  ELSIF NEW.status IS NULL THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER trigger_hash_password
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.hash_user_password();

CREATE TRIGGER users_check_subscription
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_user_status();

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ensure patients and appointments reference businesses
ALTER TABLE IF EXISTS public.patients
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.users(id);

ALTER TABLE IF EXISTS public.appointments
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_patients_business_id ON public.patients(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON public.appointments(business_id);

-- Verify user password via RPC for Supabase client
create or replace function public.verify_user_password(p_email text, p_password text)
returns setof public.users
language sql
security definer
stable
as $$
  select u.*
  from public.users u
  where u.email = p_email
    and u.password = crypt(p_password, u.password)
  limit 1;
$$;

grant execute on function public.verify_user_password(text, text) to anon, authenticated;

-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create errors table
CREATE TABLE IF NOT EXISTS errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create dashboard_stats view (this is what the app expects)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM inquiries) as total_inquiries,
  (SELECT COUNT(*) FROM errors) as total_errors;

-- 4. Insert some sample data for testing
INSERT INTO inquiries (title, description, status) VALUES
('Sample Inquiry 1', 'This is a test inquiry', 'pending'),
('Sample Inquiry 2', 'Another test inquiry', 'completed'),
('Sample Inquiry 3', 'Third test inquiry', 'pending');

INSERT INTO errors (error_type, message, severity) VALUES
('Database Error', 'Connection timeout', 'high'),
('API Error', 'Invalid response format', 'medium'),
('Validation Error', 'Missing required field', 'low');

-- 5. Enable Row Level Security (optional, for production)
-- ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

-- 6. Create policies (optional, for production)
-- CREATE POLICY "Allow all operations" ON inquiries FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON errors FOR ALL USING (true);

-- 7. Enable real-time for the tables
-- Go to Database > Replication in Supabase dashboard and enable for:
-- - inquiries table
-- - errors table
