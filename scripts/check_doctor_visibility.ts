
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctorsVisibility() {
    console.log("Attempting to fetch doctors with Anon Key...");
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, specialization')
        .eq('role', 'doctor');

    if (error) {
        console.error('Error fetching doctors:', error);
    } else {
        console.log(`Found ${data.length} doctors.`);
        console.log(data);
    }
}

checkDoctorsVisibility();
