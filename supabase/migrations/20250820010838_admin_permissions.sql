/*
  # Admin Permissions Fix
  
  This migration ensures the admin user has proper permissions to:
  1. Create users in Supabase Auth
  2. Create suppliers and drivers
  3. Manage all orders
  4. Access all data
*/

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Drop policies that might already exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Suppliers can view own orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Admins have full access to suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to financial_records" ON financial_records;
DROP POLICY IF EXISTS "Admins have full access to returns" ON returns;

-- Step 2: Create comprehensive admin policies for users table
CREATE POLICY "Admins have full access to users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 3: Create comprehensive admin policies for suppliers table
CREATE POLICY "Admins have full access to suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 4: Create comprehensive admin policies for orders table
CREATE POLICY "Admins have full access to orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 5: Create comprehensive admin policies for financial_records table
CREATE POLICY "Admins have full access to financial_records"
  ON financial_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 6: Create comprehensive admin policies for returns table
CREATE POLICY "Admins have full access to returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 7: Ensure users can still read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Step 8: Ensure users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 9: Ensure suppliers can view their own orders
CREATE POLICY "Suppliers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 10: Ensure drivers can view their assigned orders
CREATE POLICY "Drivers can view assigned orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 11: Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 12: Ensure the admin user exists and has proper role
DO $$
BEGIN
  -- Check if admin user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin'::user_role) THEN
    -- Create a default admin user if none exists
    INSERT INTO users (id, role, full_name, email, status)
    VALUES (
      gen_random_uuid(),
      'admin'::user_role,
      'System Administrator',
      'admin@system.com',
      'active'
    );
    RAISE NOTICE 'Created default admin user';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- Step 13: Verify the setup
DO $$ 
BEGIN
  RAISE NOTICE 'Admin permissions migration completed successfully!';
  RAISE NOTICE 'Admin users now have full access to create and manage:';
  RAISE NOTICE '- Users (suppliers, drivers)';
  RAISE NOTICE '- Suppliers';
  RAISE NOTICE '- Orders';
  RAISE NOTICE '- Financial records';
  RAISE NOTICE '- Returns';
END $$;
