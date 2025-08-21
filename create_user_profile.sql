-- Create a user profile for your authenticated user
-- Current user ID: ec5e6a0e-f230-4f19-8f5b-e015a5f70bac

-- First, let's see what users exist in auth.users
SELECT id, email, created_at FROM auth.users;

-- Let's also see what's in the users table
SELECT id, role, full_name, email FROM users;

-- Now let's create a profile in the users table for the current user
-- Note: password_hash is optional since Supabase Auth handles passwords
INSERT INTO users (
    id,
    role,
    full_name,
    email,
    phone,
    password_hash,  -- Optional: you can leave this NULL
    status
) VALUES (
    '704e3918-3523-433b-8eda-2c012c495330',  -- Current user ID from console
    'admin'::user_role,                        -- Set as admin
    'System Admin',                            -- Full name
    'admin@eth.com',                       -- Email (replace with actual)
    '+1234567890',                             -- Phone (optional)
    NULL,                                       -- Password hash (optional - leave NULL)
    'active'
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    status = EXCLUDED.status;

-- Verify the user was created
SELECT * FROM users WHERE id = '704e3918-3523-433b-8eda-2c012c495330';

-- You can also check what's in auth.users to see the actual authentication data
SELECT id, email, encrypted_password IS NOT NULL as has_password FROM auth.users WHERE id = '704e3918-3523-433b-8eda-2c012c495330';
