
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteRecord() {
    // 1. Find all patients named 'Harshil Sharma'
    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', 'Harshil Sharma');

    if (userError || !users) {
        console.error('Error finding user:', userError);
        return;
    }

    console.log(`Found ${users.length} user(s) named Harshil Sharma.`);

    for (const user of users) {
        const userId = user.id;
        console.log(`Checking user ID: ${userId}`);

        // 2. Find the record 'Blood Test Report' for this user
        const { data: records, error: recordError } = await supabase
            .from('records')
            .select('id')
            .eq('user_id', userId)
            .eq('title', 'Blood Test Report');

        if (recordError) {
            console.error('Error finding record:', recordError);
            continue;
        }

        if (!records || records.length === 0) {
            console.log('No "Blood Test Report" found for this user.');
            continue;
        }

        console.log(`Found ${records.length} record(s) to delete for user ${userId}.`);

        // 3. Delete the records
        for (const record of records) {
            const { error: deleteError } = await supabase
                .from('records')
                .delete()
                .eq('id', record.id);

            if (deleteError) {
                console.error(`Error deleting record ${record.id}:`, deleteError);
            } else {
                console.log(`Deleted record: ${record.id}`);
            }
        }
    }
}

deleteRecord();
