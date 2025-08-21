-- Debug script to check user profiles
-- Run this in Supabase SQL Editor to see what's happening

-- Check what's in auth.users (authentication)
SELECT 
    id, 
    email, 
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check what's in the users table (profiles)
SELECT 
    id, 
    role, 
    full_name, 
    email, 
    status,
    created_at
FROM users 
ORDER BY created_at DESC;

-- Check if your current user ID has a profile
SELECT 
    'Current User Check' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE id = '704e3918-3523-433b-8eda-2c012c495330') 
        THEN 'Profile EXISTS' 
        ELSE 'Profile MISSING' 
    END as profile_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = '704e3918-3523-433b-8eda-2c012c495330') 
        THEN 'Auth EXISTS' 
        ELSE 'Auth MISSING' 
    END as auth_status;

-- Show the specific user if it exists
SELECT * FROM users WHERE id = '704e3918-3523-433b-8eda-2c012c495330';
