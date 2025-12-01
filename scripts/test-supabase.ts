import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    console.error('Error: Supabase credentials not found in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing Supabase connection...')

    // Test Auth (SignUp)
    const email = `testuser_${Math.floor(Math.random() * 10000)}@gmail.com`
    const password = 'password123'

    console.log(`Attempting to sign in (check if email format is accepted): ${email}`)
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError) {
        console.log('Login Error (Expected):', loginError.message)
        if (loginError.message.includes('invalid')) {
            console.error('Email format seems to be rejected even for login.')
        }
    }

    console.log(`Attempting to sign up user: ${email}`)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        console.error('Auth Error:', JSON.stringify(authError, null, 2))

        // Try DB connection to see if it's a general connectivity issue
        console.log('Testing DB connection (public access)...')
        const { count, error: dbError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        if (dbError) {
            console.error('DB Connection Error:', JSON.stringify(dbError, null, 2))
        } else {
            console.log('DB Connection Successful. Count:', count)
        }
        return
    }

    console.log('User signed up successfully:', authData.user?.id)

    // Test Database (Insert Record)
    console.log('Attempting to insert a record...')
    // Note: RLS might block this if we are not signed in as the user in this context.
    // The client above is anon. We need to sign in to get a session.

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) {
        console.error('Sign In Error:', signInError.message)
        return
    }

    console.log('User signed in.')

    const { data: recordData, error: recordError } = await supabase
        .from('records')
        .insert({
            user_id: authData.user?.id,
            title: 'Test Record',
            file_type: 'Test'
        })
        .select()

    if (recordError) {
        console.error('Database Insert Error:', recordError.message)
    } else {
        console.log('Record inserted successfully:', recordData)
    }

    console.log('Verification complete!')
}

test()
