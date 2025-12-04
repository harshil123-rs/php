-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    medicines JSONB NOT NULL, -- Array of { name, dosage, frequency, duration }
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
    type TEXT DEFAULT 'general', -- general, follow-up, emergency
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medical Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT CHECK (type IN ('sick_leave', 'fitness', 'diagnosis')) NOT NULL,
    details JSONB NOT NULL, -- { reason, from_date, to_date, remarks }
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vitals Table (for Analytics)
CREATE TABLE IF NOT EXISTS vitals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    heart_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    blood_sugar INTEGER,
    temperature DECIMAL(4,1),
    weight DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Row Level Security)
-- Enable RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

-- Policies for Prescriptions
CREATE POLICY "Doctors can view prescriptions they created" ON prescriptions
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- Policies for Appointments
CREATE POLICY "Users can view their own appointments (doctor or patient)" ON appointments
    FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Patients can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update appointments (approve/reject)" ON appointments
    FOR UPDATE USING (auth.uid() = doctor_id);

-- Policies for Certificates
CREATE POLICY "Doctors can view/create certificates" ON certificates
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their certificates" ON certificates
    FOR SELECT USING (auth.uid() = patient_id);

-- Policies for Vitals
CREATE POLICY "Doctors can view all vitals" ON vitals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

CREATE POLICY "Patients can view/insert their own vitals" ON vitals
    FOR ALL USING (auth.uid() = patient_id);
