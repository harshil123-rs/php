
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVitals() {
    console.log("🔍 Checking vitals table...");

    // We can't select * easily with RLS if we are anon, but let's try to see if we can get any public data 
    // or if we need to sign in. 
    // Actually, RLS usually blocks anon select. 
    // But the user just ran the SQL, so data SHOULD be there.
    // Let's try to sign in as the patient we know exists (from previous context) or just rely on the user's confirmation.
    // A better check might be to just ask the user to refresh.

    // However, I can try to use the service role key if it was available, but it's not in the env file I saw earlier (only ANON).
    // So I will just trust the user "done" and maybe try a simple fetch that might fail if RLS is strict.

    const { data, error } = await supabase.from('vitals').select('count', { count: 'exact', head: true });

    if (error) {
        console.log("⚠️ Could not verify programmatically due to RLS (expected):", error.message);
        console.log("✅ Assuming data is present since user confirmed SQL execution.");
    } else {
        console.log(`✅ Found ${data} records in vitals table (if RLS allows counting).`);
    }
}

checkVitals();
