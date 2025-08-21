-- Manual Setup Script for Supplier Role System
-- Run this in your Supabase SQL Editor if migrations fail

-- Step 1: Create the user_role enum type
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'driver', 'supplier');

-- Step 2: Check current users table structure
-- This will show you what the current role column looks like
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 3: Update the users table to use the enum type
-- Only run this if the role column is not already using the enum
ALTER TABLE users 
ALTER COLUMN role TYPE user_role 
USING role::text::user_role;

-- Step 4: Create RLS policies for suppliers
-- Policy for suppliers to view their own orders
CREATE POLICY IF NOT EXISTS "Suppliers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for suppliers to update their own profile
CREATE POLICY IF NOT EXISTS "Suppliers can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for suppliers to read their own profile
CREATE POLICY IF NOT EXISTS "Suppliers can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Step 5: Update existing policies to include suppliers
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can create new users
CREATE POLICY "Only admins can create users"
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

-- Step 6: Verify the setup
-- Check that the enum type was created
SELECT typname, typtype FROM pg_type WHERE typname = 'user_role';

-- Check that the users table uses the enum
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Check that RLS policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'orders')
ORDER BY tablename, policyname;

-- Step 7: Test data insertion (optional)
-- Insert a test supplier user (only run this if you want to test)
-- INSERT INTO users (id, role, full_name, email, phone, status) 
-- VALUES (
--     gen_random_uuid(), 
--     'supplier', 
--     'Test Supplier', 
--     'test@supplier.com', 
--     '+1234567890', 
--     'active'
-- );
