-- Database setup for Automation Dashboard
-- Run these commands in your Supabase SQL editor

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
