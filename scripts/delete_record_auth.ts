
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteRecordAuthenticated() {
    console.log("Logging in as patient...");

    // 1. Log in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'harshil_1764821263736@healthvault.com',
        password: 'password123'
    });

    if (authError || !authData.session) {
        console.error("Login failed:", authError?.message);
        return;
    }

    console.log("Login successful. User ID:", authData.user?.id);

    // 2. Find record using authenticated client
    // Note: The 'supabase' client updates its session automatically after signIn

    const { data: records, error: recordError } = await supabase
        .from('records')
        .select('*')
        .eq('title', 'Blood Test Report');

    if (recordError) {
        console.error("Error fetching records:", recordError.message);
        return;
    }

    if (!records || records.length === 0) {
        console.log("No 'Blood Test Report' found for this user.");
        return;
    }

    console.log(`Found ${records.length} record(s). Deleting...`);

    // 3. Delete
    for (const record of records) {
        const { error: deleteError } = await supabase
            .from('records')
            .delete()
            .eq('id', record.id);

        if (deleteError) {
            console.error(`Failed to delete record ${record.id}:`, deleteError.message);
        } else {
            console.log(`Successfully deleted record: ${record.id}`);
        }
    }
}

deleteRecordAuthenticated();
