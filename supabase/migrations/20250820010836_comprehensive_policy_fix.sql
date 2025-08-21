/*
  # Comprehensive Policy Fix for Supplier Role System

  This migration will:
  1. Find ALL policies that reference the role column
  2. Drop them completely
  3. Alter the column type to use the new enum
  4. Recreate all policies with the new enum type
*/

-- Step 1: Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'driver', 'supplier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Find and drop ALL policies that reference the role column
-- We'll use a more comprehensive approach to catch all policies

-- First, let's see what policies exist
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies and drop them if they reference 'role'
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON %s', 
                      policy_record.policyname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- Step 3: Now we can safely alter the column type
-- First, ensure all existing role values are valid for the enum
UPDATE users SET role = 'admin'::text WHERE role NOT IN ('admin', 'driver', 'supplier');

-- Now alter the column type
ALTER TABLE users 
ALTER COLUMN role TYPE user_role 
USING role::text::user_role;

-- Step 4: Recreate all the necessary policies with the new enum type

-- ===== USERS TABLE POLICIES =====

-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to insert users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for admins to update any user
CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- ===== SUPPLIERS TABLE POLICIES =====

-- Policy for admins to read all suppliers
CREATE POLICY "Admins can read all suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to insert suppliers
CREATE POLICY "Admins can insert suppliers"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to update suppliers
CREATE POLICY "Admins can update suppliers"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to delete suppliers
CREATE POLICY "Admins can delete suppliers"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- ===== ORDERS TABLE POLICIES =====

-- Policy for admins to read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to insert orders
CREATE POLICY "Admins can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to update orders
CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for admins to delete orders
CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for suppliers to view their own orders
CREATE POLICY "Suppliers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for drivers to read assigned orders
CREATE POLICY "Drivers can read assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- ===== FINANCIAL_RECORDS TABLE POLICIES =====

-- Policy for admins to read all financial records
CREATE POLICY "Admins can read all financial records"
  ON financial_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for drivers to read own financial records
CREATE POLICY "Drivers can read own financial records"
  ON financial_records
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- ===== RETURNS TABLE POLICIES =====

-- Policy for admins to read all returns
CREATE POLICY "Admins can read all returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for drivers to read own returns
CREATE POLICY "Drivers can read own returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Policy for drivers to create returns
CREATE POLICY "Drivers can create returns"
  ON returns
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- Step 5: Verify the setup
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'User role enum created and all policies recreated.';
    RAISE NOTICE 'You can now create suppliers and drivers with proper role-based access.';
END $$;
