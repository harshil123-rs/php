
-- This script inserts sample vitals for ALL users with the role 'patient'
-- It generates 15 records for each patient, spread over the last 30 days.

DO $$
DECLARE
    patient_record RECORD;
    i INT;
    random_hr INT;
    random_sys INT;
    random_dia INT;
    random_sugar INT;
    random_weight DECIMAL;
    random_temp DECIMAL;
    record_date TIMESTAMP;
BEGIN
    -- Loop through all profiles that are patients
    FOR patient_record IN SELECT id FROM profiles WHERE role = 'patient' LOOP
        
        -- Generate 15 records for this patient
        FOR i IN 0..14 LOOP
            -- Calculate date (every 2 days back)
            record_date := NOW() - (i * INTERVAL '2 days');
            
            -- Generate random realistic values
            random_hr := floor(random() * (90 - 70 + 1) + 70); -- 70-90 bpm
            random_sys := floor(random() * (130 - 110 + 1) + 110); -- 110-130 mmHg
            random_dia := floor(random() * (85 - 70 + 1) + 70); -- 70-85 mmHg
            random_sugar := floor(random() * (120 - 90 + 1) + 90); -- 90-120 mg/dL
            random_weight := 70 + (random() * 2); -- 70-72 kg
            random_temp := 36.5 + (random() * 0.5); -- 36.5-37.0 C

            -- Insert the record
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
                patient_record.id,
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
