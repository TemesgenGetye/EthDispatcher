/*
  # Add Supplier Role to Users Table

  1. Problem
     - Current system only supports 'driver' and 'admin' roles
     - Need to add 'supplier' role for supplier authentication
     - Suppliers should be able to login and view their orders

  2. Solution
     - Create user_role enum type if it doesn't exist
     - Drop existing policies that reference the role column
     - Update users table to support 'supplier' role
     - Recreate all policies with the new enum type
     - Add proper RLS policies for suppliers
     - Ensure suppliers can only see their own orders
*/

-- First, check if the user_role enum exists and create it if it doesn't
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'driver', 'supplier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop ALL existing policies that reference the role column
-- This is necessary because we can't alter a column type that's used in policies
-- We'll drop them all and recreate them with the new enum type

-- Drop policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Drop policies on suppliers table
DROP POLICY IF EXISTS "Admins can read all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can delete suppliers" ON suppliers;

-- Drop policies on orders table
DROP POLICY IF EXISTS "Drivers can read assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

-- Drop policies on financial_records table
DROP POLICY IF EXISTS "Drivers can read own financial records" ON financial_records;

-- Drop policies on returns table
DROP POLICY IF EXISTS "Drivers can read own returns" ON returns;
DROP POLICY IF EXISTS "Drivers can create returns" ON returns;

-- Now alter the users table to use the new enum type
ALTER TABLE users 
ALTER COLUMN role TYPE user_role 
USING role::text::user_role;

-- Recreate all the policies with the new enum type
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
      AND users.role = 'admin'
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
      AND users.role = 'admin'
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

-- Policy for admins to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
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
      AND users.role = 'admin'
    )
  );

-- Policy for admins to read all suppliers
CREATE POLICY "Admins can read all suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
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
      AND users.role = 'admin'
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

-- Policy for admins to delete suppliers
CREATE POLICY "Admins can delete suppliers"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for suppliers to read their own profile
CREATE POLICY "Suppliers can read own profile"
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

-- Policy for suppliers to update their own profile
CREATE POLICY "Suppliers can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
      AND users.role = 'admin'
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
      AND users.role = 'admin'
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
      AND users.role = 'admin'
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
      AND users.role = 'admin'
    )
  );

-- Policy for drivers to create returns
CREATE POLICY "Drivers can create returns"
  ON returns
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- Policy for admins to read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
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
      AND users.role = 'admin'
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

-- Policy for admins to delete orders
CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
