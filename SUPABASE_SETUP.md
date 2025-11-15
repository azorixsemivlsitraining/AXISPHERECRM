# Supabase Setup & Troubleshooting

## Step 1: Verify Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query to verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: `salespersons`, `leads`, `companies`

4. Verify the `salespersons` table has these columns:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'salespersons' AND table_schema = 'public';
```

Expected columns: `id`, `auth_id`, `name`, `email`, `phone_number`, `created_at`, `updated_at`

## Step 2: Fix RLS Policies

1. In Supabase, go to **SQL Editor**
2. Copy and paste the entire content from `supabase/fix-rls-policies.sql`
3. Execute the script

This will:

- Drop old restrictive policies
- Create new policies that allow registration
- Allow authenticated users to access their data

## Step 3: Enable Email/Password Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **ENABLED** (toggle should be ON)
4. Check that "Confirm email" is set appropriately (you can turn it OFF for testing)

## Step 4: Verify Environment Variables

Check that these are set in your application:

- `VITE_SUPABASE_URL=https://pdklljdaliaqvudcqdqb.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBka2xsamRhbGlhcXZ1ZGNxZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTQ4NjksImV4cCI6MjA3ODY3MDg2OX0.qXPQ4cH1rBTZVVGEaNw3INasSr3rB-PUnVmB0gFErQ0`

## Step 5: Test Registration

1. Go to the registration page
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com` (use a unique email each time)
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
3. Click "Create Account"

**If you get an error:**

- Check the browser console (F12) for detailed error messages
- Common issues:
  - RLS policies not updated
  - Email already exists
  - Email/password auth not enabled

## Step 6: Test Login

1. If registration succeeded, you'll be logged in automatically
2. If you need to test login separately:
   - Go to login page
   - Use the email and password from registration
   - Click "Login"

## Step 7: Verify Data in Database

If registration worked, verify the record was created:

```sql
SELECT id, auth_id, email, name FROM salespersons ORDER BY created_at DESC LIMIT 5;
```

You should see your test user.

## Troubleshooting

### "Email already registered"

- Use a different email address (email@example.com, email2@example.com, etc.)
- Or delete the user from Supabase Auth and try again

### "RLS policy violation"

- Make sure you ran the fix-rls-policies.sql script
- Check that policies exist:
  ```sql
  SELECT policyname FROM pg_policies
  WHERE tablename = 'salespersons';
  ```

### "Could not fetch user profile"

- Verify the salesperson record was created in the database
- Check that the `auth_id` matches the auth user ID

### "Invalid login credentials"

- Verify the user exists in the database
- Check the email and password are correct
- Make sure email/password auth is enabled in Supabase

## Contact Support

If issues persist:

1. Check the browser console for detailed error logs
2. Verify your Supabase project settings
3. Try using the Supabase dashboard directly to create a test user
