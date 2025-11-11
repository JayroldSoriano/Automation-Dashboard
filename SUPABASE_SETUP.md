# Supabase Setup Instructions

This project uses Supabase for data storage and real-time updates. Follow these steps to set up your Supabase integration:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Create a new project
4. Wait for the project to be fully initialized

## 2. Configure Login Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key for the project that will handle authentication (login-only)
3. Create a `.env` file (or update your build environment) with the following variables:
   ```bash
   EXPO_PUBLIC_SUPABASE_LOGIN_URL="https://your-login-project.supabase.co"
   EXPO_PUBLIC_SUPABASE_LOGIN_ANON_KEY="your-login-project-anon-key"
   ```
4. Restart the Expo dev server after changing environment variables

The application now bootstraps using the login Supabase project exclusively for the `verify_user_password` RPC and fetching the `users` table. Per-tenant credentials are stored securely after sign-in.

### Per-user Project Credentials

Each record in the `public.users` table is expected to include the fields:

- `url` – the Supabase project URL associated with the user or tenant
- `anon_key` – the anon key for that project
- `service_role_key` – optional, if the UI needs elevated access (handled securely; avoid exposing if not required)

These credentials are encrypted with `expo-secure-store` on native platforms (and stored in `localStorage` as a fallback on web) after a successful login.

## 3. Create Database Tables

Run these SQL commands in your Supabase SQL editor:

### Inquiries Table
```sql
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Errors Table
```sql
CREATE TABLE errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
```

## 4. Enable Row Level Security (RLS)

For basic setup, you can disable RLS for now, but for production, enable it:

```sql
-- Enable RLS on both tables
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your use case)
CREATE POLICY "Allow all operations" ON inquiries FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON errors FOR ALL USING (true);
```

## 5. Enable Real-time

1. Go to **Database** > **Replication** in your Supabase dashboard
2. Enable replication for both `inquiries` and `errors` tables
3. This allows real-time updates to work in your app

## 6. Test Your Setup

1. Start your React Native app: `npm start`
2. The app should now connect to Supabase and display data
3. You can add test data directly in the Supabase dashboard to see it appear in your app

## Troubleshooting

- **Connection errors**: Double-check your URL and anon key
- **Table not found**: Make sure you've created the tables with the exact names specified
- **Real-time not working**: Ensure replication is enabled for your tables
- **Permission errors**: Check your RLS policies

## Next Steps

- Customize the table schemas to match your specific needs
- Implement proper authentication if needed
- Add more sophisticated error handling
- Consider implementing data validation on the database level
