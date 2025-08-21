/*
  # Fix User Role Enum - Alternative Approach

  This migration provides a simpler approach if the previous one fails.
  It handles the case where the user_role enum doesn't exist.
*/

-- Step 1: Check if user_role enum exists, if not create it
DO $$ 
BEGIN
    -- Check if the enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the enum type
        CREATE TYPE user_role AS ENUM ('admin', 'driver', 'supplier');
        RAISE NOTICE 'Created user_role enum type';
    ELSE
        RAISE NOTICE 'user_role enum type already exists';
    END IF;
END $$;

-- Step 2: Check if the users table has a role column
DO $$ 
BEGIN
    -- Check if role column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'role') THEN
        
        -- Check if the column is already the right type
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role') != 'USER-DEFINED' THEN
            
            -- Alter the column to use the enum type
            ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;
            RAISE NOTICE 'Updated users.role column to use user_role enum';
        ELSE
            RAISE NOTICE 'users.role column already uses user_role enum';
        END IF;
    ELSE
        RAISE NOTICE 'users table does not have a role column';
    END IF;
END $$;

-- Step 3: Create RLS policies for suppliers
DO $$ 
BEGIN
    -- Create policy for suppliers to view their own orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can view own orders') THEN
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
        RAISE NOTICE 'Created policy: Suppliers can view own orders';
    ELSE
        RAISE NOTICE 'Policy "Suppliers can view own orders" already exists';
    END IF;
END $$;

-- Step 4: Ensure suppliers can manage their own profile
DO $$ 
BEGIN
    -- Create policy for suppliers to update their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can update own profile') THEN
        CREATE POLICY "Suppliers can update own profile"
          ON users
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Created policy: Suppliers can update own profile';
    ELSE
        RAISE NOTICE 'Policy "Suppliers can update own profile" already exists';
    END IF;
END $$;

-- Step 5: Ensure only admins can create users
DO $$ 
BEGIN
    -- Drop existing insert policy if it exists
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Only admins can create users" ON users;
    
    -- Create new policy that only allows admins to create users
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
    RAISE NOTICE 'Created policy: Only admins can create users';
END $$;
