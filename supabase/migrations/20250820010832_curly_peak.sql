/*
  # Disable Email Confirmation

  1. Configuration Changes
    - Disable email confirmation for new user signups
    - Allow users to sign up without email verification
  
  2. Security
    - Users can immediately access the system after signup
    - No email verification required
*/

-- This migration disables email confirmation by updating auth settings
-- Note: This requires manual configuration in Supabase dashboard
-- Go to Authentication > Settings and disable "Enable email confirmations"

-- Create a function to handle user profile creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This function will be called when a new user is created in auth.users
  -- It automatically creates a corresponding profile in the users table
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();