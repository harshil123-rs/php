
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using anon key, might need service role if RLS blocks
// Actually, let's use the service role key if available, or just try anon and see. 
// Wait, I don't have service role key in .env.local usually. 
// I'll try with anon key. If RLS blocks, I might need to sign in or use a different approach.
// For now, let's just try to select count.

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVitals() {
    const { count, error } = await supabase
        .from('vitals')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error checking vitals:', error);
    } else {
        console.log('Total vitals records:', count);
    }
}

checkVitals();
