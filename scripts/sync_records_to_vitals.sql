
-- Sync extracted vitals from Records to the Vitals table
-- This allows the Analytics dashboard to reflect real data from uploaded medical reports.

INSERT INTO vitals (
    patient_id, 
    heart_rate, 
    systolic_bp, 
    diastolic_bp, 
    blood_sugar, 
    temperature, 
    weight, 
    recorded_at
)
SELECT
    user_id,
    -- Try to find heart rate in metadata (handle both nested 'vitals' object and top-level)
    COALESCE(
        (metadata->'vitals'->>'heart_rate')::int, 
        (metadata->>'heart_rate')::int
    ),
    -- Parse Blood Pressure (e.g., "120/80")
    CASE 
        WHEN metadata->'vitals'->>'blood_pressure' LIKE '%/%' THEN split_part(metadata->'vitals'->>'blood_pressure', '/', 1)::int
        WHEN metadata->>'blood_pressure' LIKE '%/%' THEN split_part(metadata->>'blood_pressure', '/', 1)::int
        ELSE NULL
    END,
    CASE 
        WHEN metadata->'vitals'->>'blood_pressure' LIKE '%/%' THEN split_part(metadata->'vitals'->>'blood_pressure', '/', 2)::int
        WHEN metadata->>'blood_pressure' LIKE '%/%' THEN split_part(metadata->>'blood_pressure', '/', 2)::int
        ELSE NULL
    END,
    -- Sugar
    COALESCE(
        (metadata->'vitals'->>'sugar_level')::int, 
        (metadata->>'sugar_level')::int
    ),
    -- Temperature
    COALESCE(
        (metadata->'vitals'->>'temperature')::decimal, 
        (metadata->>'temperature')::decimal
    ),
    -- Weight
    COALESCE(
        (metadata->'vitals'->>'weight')::decimal, 
        (metadata->>'weight')::decimal
    ),
    -- Use record creation time
    created_at
FROM records
WHERE 
    -- Only insert if we found at least one vital sign
    (metadata->'vitals'->>'heart_rate' IS NOT NULL OR metadata->>'heart_rate' IS NOT NULL)
    OR (metadata->'vitals'->>'blood_pressure' IS NOT NULL OR metadata->>'blood_pressure' IS NOT NULL);

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Synced vitals from records table.';
END $$;
