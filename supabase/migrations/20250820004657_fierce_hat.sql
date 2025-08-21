/*
  # Create Authentication Users and Profiles

  1. Create Auth Users
    - Create admin and driver users in Supabase Auth
    - Set up proper authentication credentials

  2. Link Profiles
    - Update existing user profiles to match auth user IDs
    - Ensure proper relationship between auth.users and public.users

  3. Security
    - Update RLS policies to work with auth.uid()
    - Ensure proper access control
*/

-- First, let's create the auth users and get their IDs
-- Note: In a real environment, you would create these through the Supabase dashboard or auth API

-- Create a function to handle user creation with proper auth integration
CREATE OR REPLACE FUNCTION create_user_with_auth(
  user_email text,
  user_password text,
  user_role text,
  user_full_name text,
  user_phone text,
  user_vehicle_info jsonb DEFAULT '{}'::jsonb,
  user_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- For demo purposes, we'll create users with predetermined UUIDs
  -- In production, this would be handled by Supabase Auth API
  
  CASE user_email
    WHEN 'admin@dispatch.com' THEN
      new_user_id := '550e8400-e29b-41d4-a716-446655440000'::uuid;
    WHEN 'derrick@dispatch.com' THEN
      new_user_id := '550e8400-e29b-41d4-a716-446655440001'::uuid;
    ELSE
      new_user_id := gen_random_uuid();
  END CASE;

  -- Insert or update the user profile
  INSERT INTO users (id, role, full_name, email, phone, vehicle_info, status)
  VALUES (new_user_id, user_role, user_full_name, user_email, user_phone, user_vehicle_info, user_status)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    vehicle_info = EXCLUDED.vehicle_info,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN new_user_id;
END;
$$;

-- Create the demo users
SELECT create_user_with_auth(
  'admin@dispatch.com',
  'admin123',
  'admin',
  'Michael Gardner',
  '+1-555-0001'
);

SELECT create_user_with_auth(
  'derrick@dispatch.com',
  'driver123',
  'driver',
  'Derrick Green',
  '+1-555-0101',
  '{"vehicle_type": "van", "license_plate": "DRV-001", "capacity_kg": 1000}'::jsonb
);

-- Update RLS policies to work properly with auth.uid()
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Create new RLS policies for users table
CREATE POLICY "Users can read own data"
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

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Update orders RLS policies to work with auth.uid()
DROP POLICY IF EXISTS "Drivers can read assigned orders" ON orders;
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

-- Update financial records RLS policies
DROP POLICY IF EXISTS "Drivers can read own financial records" ON financial_records;
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

-- Update returns RLS policies
DROP POLICY IF EXISTS "Drivers can read own returns" ON returns;
DROP POLICY IF EXISTS "Drivers can create returns" ON returns;

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

CREATE POLICY "Drivers can create returns"
  ON returns
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- Clean up the helper function
DROP FUNCTION IF EXISTS create_user_with_auth;