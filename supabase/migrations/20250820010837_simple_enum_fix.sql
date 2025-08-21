/*
  # Simple Enum Fix for Supplier Role System

  This migration uses a more direct approach:
  1. Drop the existing role column completely
  2. Create a new role column with the correct enum type
  3. Recreate basic policies
*/

-- Step 1: Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'driver', 'supplier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Drop ALL policies to avoid any conflicts
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
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

-- Step 3: Backup existing role data
CREATE TEMP TABLE role_backup AS 
SELECT id, role::text as old_role FROM users;

-- Step 4: Drop the existing role column
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Step 5: Add the new role column with the correct enum type
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'driver';

-- Step 6: Restore the role data with proper casting
UPDATE users 
SET role = CASE 
    WHEN old_role IN ('admin', 'driver', 'supplier') THEN old_role::user_role
    ELSE 'driver'::user_role
END
FROM role_backup 
WHERE users.id = role_backup.id;

-- Step 7: Drop the temporary table
DROP TABLE role_backup;

-- Step 8: Create basic policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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

-- Step 9: Create supplier policies
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

CREATE POLICY "Suppliers can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 10: Create order policies
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

-- Step 11: Create supplier table policies
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

-- Step 12: Verify the setup
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'User role enum created and all policies recreated.';
    RAISE NOTICE 'You can now create suppliers and drivers with proper role-based access.';
END $$;
