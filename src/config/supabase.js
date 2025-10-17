// Supabase configuration
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  // Replace these with your actual Supabase project details
  url: 'https://eqxppxrprpqmvyarotzp.supabase.co', // e.g., 'https://your-project.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeHBweHJwcnBxbXZ5YXJvdHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzkyNjUsImV4cCI6MjA2NjIxNTI2NX0.g3lRkXtsFaopoATiwCtXj2EBKCbD6YuS5YbJgIHyzUI', // Your public anon key
  
    "patients": {
      "id": "id",
      "name": "name",
      "age": "age",
      "gender": "gender",
      "phone": "phone",
      "email": "email",
      "location": "location",
      "created_at": "created_at",
      "sender_id": "sender_id",
      "last_agent": "last_agent",
      "platform": "platform"
    },
    "appointments": {
      "id": "id",
      "patient_id": "patient_id",
      "service_name": "service_name",
      "service_category": "service_category",
      "service_price": "service_price",
      "scheduled_date": "scheduled_date",
      "scheduled_time": "scheduled_time",
      "status": "status",
      "created_at": "created_at"
    },
    "appointment_details": {
      "patient_id": "patient_id",
      "name": "name",
      "age": "age",
      "gender": "gender",
      "phone": "phone",
      "email": "email",
      "location": "location",
      "patient_created_at": "patient_created_at",
      "appointment_id": "appointment_id",
      "service_name": "service_name",
      "service_category": "service_category",
      "service_price": "service_price",
      "scheduled_date": "scheduled_date",
      "scheduled_time": "scheduled_time",
      "status": "status",
      "appointment_created_at": "appointment_created_at"
    }
    
};

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Instructions for setup:
// 1. Go to your Supabase project dashboard
// 2. Copy your project URL and anon key from Settings > API
// 3. Replace the values above with your actual credentials
// 4. Update the table names to match your database schema
