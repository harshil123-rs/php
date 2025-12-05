
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { subDays } from 'date-fns';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedVitals() {
    // 1. Get the patient user
    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'patient')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('Error finding patient:', userError);
        return;
    }

    const patientId = users[0].id;
    console.log(`Seeding vitals for patient ID: ${patientId}`);

    // 2. Generate dummy data for the last 30 days
    const vitalsData = [];
    for (let i = 0; i < 15; i++) {
        const date = subDays(new Date(), i * 2); // Every 2 days

        // Randomize slightly
        const heartRate = 70 + Math.floor(Math.random() * 20); // 70-90
        const systolic = 110 + Math.floor(Math.random() * 20); // 110-130
        const diastolic = 70 + Math.floor(Math.random() * 15); // 70-85
        const sugar = 90 + Math.floor(Math.random() * 30); // 90-120
        const weight = 70 + Math.random() * 2; // 70-72 kg
        const temp = 36.5 + Math.random() * 0.5; // 36.5-37.0

        vitalsData.push({
            patient_id: patientId,
            heart_rate: heartRate,
            systolic_bp: systolic,
            diastolic_bp: diastolic,
            blood_sugar: sugar,
            weight: parseFloat(weight.toFixed(1)),
            temperature: parseFloat(temp.toFixed(1)),
            recorded_at: date.toISOString()
        });
    }

    // 3. Insert data
    // Note: RLS might block this if we use anon key and are not logged in as that patient.
    // Ideally we should use service_role key for seeding, but we don't have it in .env.local usually.
    // However, for this environment, let's try. If it fails, I'll provide SQL to run.

    const { error } = await supabase.from('vitals').insert(vitalsData);

    if (error) {
        console.error('Error inserting vitals:', error);
        console.log('RLS likely blocked it. Please run the following SQL manually in Supabase SQL Editor:');

        console.log(`
      INSERT INTO vitals (patient_id, heart_rate, systolic_bp, diastolic_bp, blood_sugar, weight, temperature, recorded_at)
      VALUES 
      ${vitalsData.map(v => `('${v.patient_id}', ${v.heart_rate}, ${v.systolic_bp}, ${v.diastolic_bp}, ${v.blood_sugar}, ${v.weight}, ${v.temperature}, '${v.recorded_at}')`).join(',\n      ')};
    `);
    } else {
        console.log('Successfully seeded vitals!');
    }
}

seedVitals();
