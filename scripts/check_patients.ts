
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatients() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .ilike('full_name', '%Harshil%');

    if (error) {
        console.error('Error fetching patients:', error);
    } else {
        console.log('Patients found:', data);
    }
}

checkPatients();
