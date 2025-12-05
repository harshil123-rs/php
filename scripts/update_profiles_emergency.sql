
-- Add emergency fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS conditions TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Sync medical info from records (if available)
-- This takes the latest record's metadata and updates the profile
UPDATE profiles
SET
    blood_group = COALESCE(
        (SELECT metadata->>'blood_group' FROM records WHERE user_id = profiles.id AND metadata->>'blood_group' IS NOT NULL ORDER BY created_at DESC LIMIT 1),
        blood_group
    ),
    conditions = COALESCE(
        (SELECT metadata->>'disease' FROM records WHERE user_id = profiles.id AND metadata->>'disease' IS NOT NULL ORDER BY created_at DESC LIMIT 1),
        conditions
    ),
    -- Allergies might not be in metadata yet, but if we add it to extraction later, this query would work if we updated the key.
    -- For now, let's just set a default if null, or leave it null.
    emergency_contact_name = 'Dr. Sarah Smith (Primary)',
    emergency_contact_phone = '+1 (555) 123-4567'
WHERE role = 'patient';
