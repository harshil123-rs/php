-- Add record_id column to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS record_id UUID REFERENCES records(id);

-- Update RLS policy to allow linking records
-- (Existing policies should already cover this if records are accessible)
