
-- Force seed vitals for ALL profiles to ensure the current user gets data
-- This ignores the 'role' check to be safe.

DO $$
DECLARE
    user_record RECORD;
    i INT;
    random_hr INT;
    random_sys INT;
    random_dia INT;
    random_sugar INT;
    random_weight DECIMAL;
    random_temp DECIMAL;
    record_date TIMESTAMP;
BEGIN
    -- Loop through ALL profiles
    FOR user_record IN SELECT id FROM profiles LOOP
        
        -- Check if data already exists to avoid duplicates (optional, but good practice)
        -- Actually, let's just add more data, it's fine for a demo.
        
        -- Generate 5 records for this user (last 10 days)
        FOR i IN 0..4 LOOP
            record_date := NOW() - (i * INTERVAL '2 days');
            
            random_hr := floor(random() * (90 - 70 + 1) + 70);
            random_sys := floor(random() * (130 - 110 + 1) + 110);
            random_dia := floor(random() * (85 - 70 + 1) + 70);
            random_sugar := floor(random() * (120 - 90 + 1) + 90);
            random_weight := 70 + (random() * 2);
            random_temp := 36.5 + (random() * 0.5);

            INSERT INTO vitals (
                patient_id, 
                heart_rate, 
                systolic_bp, 
                diastolic_bp, 
                blood_sugar, 
                weight, 
                temperature, 
                recorded_at
            ) VALUES (
                user_record.id,
                random_hr,
                random_sys,
                random_dia,
                random_sugar,
                round(random_weight, 1),
                round(random_temp, 1),
                record_date
            );
        END LOOP;
        
    END LOOP;
END $$;
