
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://prwmmzwjsukpslpvccum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd21tendqc3VrcHNscHZjY3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjU4ODEsImV4cCI6MjA4MDAwMTg4MX0.FK89rBDQEg2MV0TAdAFhlvsgYh5Mc47pFwRP6-VXj5s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
    console.log("Starting seed process...");

    // 1. Create Doctor
    console.log("\n--- Creating Doctor ---");
    const doctorEmail = `doctor_${Date.now()}@healthvault.com`;
    const password = 'password123';

    const { data: docData, error: docError } = await supabase.auth.signUp({
        email: doctorEmail,
        password: password,
        options: {
            data: {
                full_name: 'Dr. A.I. Smith',
                role: 'doctor',
                specialization: 'General Physician'
            }
        }
    });

    if (docError) {
        console.error("Error creating doctor:", docError.message);
    } else {
        console.log(`Doctor created! Email: ${doctorEmail}, ID: ${docData.user?.id}`);
        if (docData.session) {
            console.log("Doctor session active.");
        } else {
            console.log("Doctor session NOT active (Email confirmation might be required).");
        }
    }

    // 2. Create Patient
    console.log("\n--- Creating Patient ---");
    const patientEmail = `harshil_${Date.now()}@healthvault.com`;

    const { data: patData, error: patError } = await supabase.auth.signUp({
        email: patientEmail,
        password: password,
        options: {
            data: {
                full_name: 'Harshil Sharma',
                role: 'patient'
            }
        }
    });

    if (patError) {
        console.error("Error creating patient:", patError.message);
        return;
    }

    console.log(`Patient created! Email: ${patientEmail}, ID: ${patData.user?.id}`);

    if (!patData.session) {
        console.log("Patient session NOT active. Cannot insert records. Please confirm email if required.");
        return;
    }

    console.log("Patient session active. Inserting record...");

    // 3. Insert Record for Patient
    // We need to use a client authenticated as the patient to respect RLS (or insert if RLS allows)
    // Since we have the session in patData, we can use it.

    // Note: The 'supabase' client above is anon. We need one with the user's token? 
    // Actually, createClient maintains state if we use it in a browser, but here in a script...
    // We can just use the returned session to make authenticated requests if we re-initialize or set session.
    // But simpler: just use the `supabase` client which might have updated session if it's a singleton? No.

    // Let's create a client for the patient
    const patientClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${patData.session.access_token}`
            }
        }
    });

    const { data: record, error: recordError } = await patientClient
        .from('records')
        .insert({
            user_id: patData.user?.id,
            title: 'Blood Test Report',
            file_type: 'Lab Report',
            file_url: 'https://placehold.co/600x400.png?text=Medical+Record', // Dummy URL
            metadata: {
                patient_name: 'Harshil Sharma',
                age: '28 years',
                blood_group: 'O+',
                disease: 'Routine Checkup',
                legality: 'Valid'
            }
        })
        .select()
        .single();

    if (recordError) {
        console.error("Error inserting record:", recordError.message);
    } else {
        console.log("Record inserted successfully:", record.id);
    }

    console.log("\n--- Seed Complete ---");
    console.log(`Doctor Login: ${doctorEmail} / ${password}`);
    console.log(`Patient Login: ${patientEmail} / ${password}`);
}

seed().catch(console.error);
