// Supabase configuration
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  // Replace these with your actual Supabase project details
  url: 'https://yqpjnjvwfzucbsmrxlag.supabase.co', // e.g., 'https://your-project.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcGpuanZ3Znp1Y2JzbXJ4bGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDQ5NjgsImV4cCI6MjA3Mzg4MDk2OH0.8XCo5ReoSSdDcRY197K5gJYdVXeuV8BO0NkCgDyDSkQ', // Your public anon key
  
  // Table names - update these to match your actual table names
  inquiries_summary: {
    total_inquiries: 'total_inquiries', // Replace with your actual inquiries table name
    total_errors: 'total_errors', // Replace with your actual errors table name
  }
};

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Instructions for setup:
// 1. Go to your Supabase project dashboard
// 2. Copy your project URL and anon key from Settings > API
// 3. Replace the values above with your actual credentials
// 4. Update the table names to match your database schema
