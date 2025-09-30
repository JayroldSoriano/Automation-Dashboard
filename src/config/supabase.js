// Supabase configuration
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  // Replace these with your actual Supabase project details
  url: 'https://eqxppxrprpqmvyarotzp.supabase.co', // e.g., 'https://your-project.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeHBweHJwcnBxbXZ5YXJvdHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzkyNjUsImV4cCI6MjA2NjIxNTI2NX0.g3lRkXtsFaopoATiwCtXj2EBKCbD6YuS5YbJgIHyzUI', // Your public anon key
  
  appointment_analytics: {
    id: 'id',
    appointment_id: 'appointment_id',
    conversation_id: 'conversation_id',
    patient_name: 'patient_name',
    patient_gender: 'patient_gender',
    patient_age: 'patient_age',
    patient_location: 'patient_location',
    service_name: 'service_name',
    service_category: 'service_category',
    service_price: 'service_price',
    scheduled_date: 'scheduled_date',
    scheduled_time: 'scheduled_time',
    timezone: 'timezone',
    status: 'status',
    cancellation_reason: 'cancellation_reason',
    platform: 'platform',
    booking_channel: 'booking_channel',
    created_at: 'created_at',
    updated_at: 'updated_at',
    successful_scheduling: 'successful_scheduling',
    incomplete_scheduling: 'incomplete_scheduling',
    pkey: 'pkey'
  },
  analytics_dashboard: {
    scheduled_date: 'scheduled_date',
    total_appointments: 'total_appointments',
    confirmed_count: 'confirmed_count',
    completed_count: 'completed_count',
    cancelled_count: 'cancelled_count',
    no_show_count: 'no_show_count',
    platform_a_count: 'platform_a_count',
    platform_b_count: 'platform_b_count',
    platform_c_count: 'platform_c_count',
    avg_price: 'avg_price'
  }
};

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Instructions for setup:
// 1. Go to your Supabase project dashboard
// 2. Copy your project URL and anon key from Settings > API
// 3. Replace the values above with your actual credentials
// 4. Update the table names to match your database schema
