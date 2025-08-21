/*
  # Fix RLS Policies for User Profile Creation

  1. Problem
    - Users cannot create their own profiles during signup
    - RLS policy only allows admins to insert users
    - This causes the PGRST116 error when trying to fetch user profile

  2. Solution
    - Add policy for users to insert their own profiles
    - Ensure proper access control while maintaining security
*/

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Create new policy that allows users to insert their own profiles
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy that allows admins to insert any user
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Also ensure users can update their own profiles
DROP POLICY IF EXISTS "Admins can update users" ON users;

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
