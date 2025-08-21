-- Debug script to check users table structure and constraints
-- Run this in Supabase SQL Editor to see what's happening

-- Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check for unique constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users';

-- Check if there are any existing users with the same email
SELECT id, email, role, full_name FROM users WHERE email = 'test@example.com';

-- Check the current user count
SELECT COUNT(*) as total_users FROM users;

-- Check the current driver count
SELECT COUNT(*) as total_drivers FROM users WHERE role = 'driver';

-- Try to insert a test user profile (this will help identify the exact constraint issue)
-- Comment out this section if you don't want to create a test user
/*
INSERT INTO users (
    id,
    role,
    full_name,
    email,
    phone,
    status
) VALUES (
    gen_random_uuid(),
    'driver',
    'Test Driver',
    'testdriver@example.com',
    '+1234567890',
    'active'
);
*/
