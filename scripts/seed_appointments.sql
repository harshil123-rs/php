
-- Seed appointments for the last 7 days to populate Doctor Analytics graphs

DO $$
DECLARE
    doctor_record RECORD;
    patient_record RECORD;
    i INT;
    appt_date DATE;
BEGIN
    -- Get a doctor (limit to 1 for simplicity, or loop if needed)
    SELECT id INTO doctor_record FROM profiles WHERE role = 'doctor' LIMIT 1;
    
    -- Get a patient
    SELECT id INTO patient_record FROM profiles WHERE role = 'patient' LIMIT 1;

    IF doctor_record.id IS NULL OR patient_record.id IS NULL THEN
        RAISE NOTICE 'Missing doctor or patient profile. Skipping seed.';
        RETURN;
    END IF;

    -- Generate appointments for the last 7 days
    FOR i IN 0..6 LOOP
        appt_date := CURRENT_DATE - (i || ' days')::INTERVAL;
        
        -- Insert 1-3 regular appointments per day
        INSERT INTO appointments (doctor_id, patient_id, date, time, status, type)
        SELECT 
            doctor_record.id, 
            patient_record.id, 
            appt_date, 
            '10:00', 
            'approved', 
            'checkup'
        FROM generate_series(1, floor(random() * 3 + 1)::int);

        -- Insert 0-2 emergency appointments per day
        INSERT INTO appointments (doctor_id, patient_id, date, time, status, type)
        SELECT 
            doctor_record.id, 
            patient_record.id, 
            appt_date, 
            '12:00', 
            'approved', 
            'emergency'
        FROM generate_series(1, floor(random() * 2)::int);
        
    END LOOP;
    
    RAISE NOTICE 'Seeded appointments for doctor % and patient %', doctor_record.id, patient_record.id;
END $$;
