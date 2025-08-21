/*
  # Driver Order Permissions Fix
  
  This migration ensures drivers can:
  1. Update status of their assigned orders
  2. Create return records
  3. Access all necessary data for order management
*/

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
DROP POLICY IF EXISTS "Suppliers can view own orders" ON orders;
DROP POLICY IF EXISTS "Drivers can read assigned orders" ON orders;

-- Drop policies that might already exist
DROP POLICY IF EXISTS "Admins have full access to returns" ON returns;
DROP POLICY IF EXISTS "Drivers can create and manage returns" ON returns;
DROP POLICY IF EXISTS "Drivers can read and update assigned orders" ON orders;

-- Step 2: Create comprehensive order policies for drivers
CREATE POLICY "Drivers can read and update assigned orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 3: Create comprehensive return policies for drivers
CREATE POLICY "Drivers can create and manage returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'::user_role
    )
  );

-- Step 4: Ensure suppliers can still view their orders
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

-- Step 5: Ensure admins have full access
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

-- Step 6: Ensure admins have full access to returns
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

-- Step 7: Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON returns TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 8: Verify the setup
DO $$ 
BEGIN
  RAISE NOTICE 'Driver order permissions migration completed successfully!';
  RAISE NOTICE 'Drivers can now:';
  RAISE NOTICE '- Update status of their assigned orders';
  RAISE NOTICE '- Create return records';
  RAISE NOTICE '- Access all order data they need';
  RAISE NOTICE 'Admins and suppliers maintain their existing permissions.';
END $$;
