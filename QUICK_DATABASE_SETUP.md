# Quick Database Setup - Fix the Error

## The Error
```
ERROR {"code": "PGRST205", "details": null, "hint": null, "message": "Could not find the table 'public.dashboard_stats' in the schema cache"}
```

This means the `dashboard_stats` view doesn't exist in your Supabase database yet.

## Quick Fix - Run This SQL

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/yqpjnjvwfzucbsmrxlag
   - Navigate to **SQL Editor** (left sidebar)

2. **Copy and paste this SQL code:**

```sql
-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create errors table  
CREATE TABLE IF NOT EXISTS errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create dashboard_stats view (this is what the app expects)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM inquiries) as total_inquiries,
  (SELECT COUNT(*) FROM errors) as total_errors;

-- Insert sample data
INSERT INTO inquiries (title, description, status) VALUES
('Sample Inquiry 1', 'This is a test inquiry', 'pending'),
('Sample Inquiry 2', 'Another test inquiry', 'completed'),
('Sample Inquiry 3', 'Third test inquiry', 'pending');

INSERT INTO errors (error_type, message, severity) VALUES
('Database Error', 'Connection timeout', 'high'),
('API Error', 'Invalid response format', 'medium'),
('Validation Error', 'Missing required field', 'low');
```

3. **Click "Run" to execute the SQL**

4. **Enable Real-time (Optional but Recommended)**
   - Go to **Database** > **Replication** 
   - Enable replication for both `inquiries` and `errors` tables

## After Running the SQL

Your app should now work! You should see:
- 3 inquiries in the dashboard
- 3 errors in the dashboard
- No more error messages

## Test the App

1. Go back to your app
2. Pull down to refresh
3. You should see the data load successfully

The error will be resolved once you create these database objects! 🚀
