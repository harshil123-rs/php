
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctors() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');

    if (error) {
        console.error('Error fetching doctors:', error);
    } else {
        console.log('Doctors found:', data);
    }
}

checkDoctors();
