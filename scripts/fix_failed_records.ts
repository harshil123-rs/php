import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleApiKey = process.env.GOOGLE_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite-preview-09-2025",
    generationConfig: { temperature: 0.0 }
});

async function fixFailedRecords() {
    console.log("🔍 Searching for records with AI errors...");

    // Fetch records where metadata->disease starts with "AI Error"
    // Note: Supabase filtering on JSONB can be tricky, so we'll fetch recent records and filter in JS if needed,
    // or use a text search if possible. For now, let's fetch all and filter.
    // In a production app with many records, we'd want a better query.
    const { data: records, error } = await supabase
        .from("records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching records:", error);
        return;
    }

    const failedRecords = records.filter((r: any) =>
        r.metadata?.disease && typeof r.metadata.disease === 'string' && r.metadata.disease.startsWith("AI Error")
    );

    console.log(`Found ${failedRecords.length} failed records.`);

    for (const record of failedRecords) {
        console.log(`\nProcessing record: ${record.title} (${record.id})`);

        try {
            // 1. Download file
            const { data: fileData, error: downloadError } = await supabase.storage
                .from("records")
                .download(record.file_url.split("/records/")[1]); // Extract path from URL if needed, or just use the path if we stored it. 
            // Actually file_url is public URL. We need the path.
            // The path usually is `userId/filename`.
            // Let's try to parse it from the public URL or just assume we can't easily get the path from the URL without logic.
            // Wait, the upload route constructs path as `${user.id}/${filename}`.
            // But we don't have the path stored directly in the row, only file_url.
            // Let's try to fetch the image from the public URL directly.

            let buffer: Buffer;

            if (downloadError || !fileData) {
                console.log("   Could not download from storage, trying public URL...");
                const response = await fetch(record.file_url);
                if (!response.ok) throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else {
                buffer = Buffer.from(await fileData.arrayBuffer());
            }

            // 2. Run AI
            console.log("   Running AI extraction...");
            const prompt = `Analyze this medical record image. Extract the following fields and return them as a valid JSON object.
            
            - patient_name (string)
            - age (string, e.g. "34 years")
            - blood_group (string)
            - disease (string, diagnosis or main complaint)
            - legality (string, "Valid" if it looks like a real medical document with doctor signature/letterhead, else "Invalid")
            - vitals (object):
                - heart_rate (number, bpm)
                - blood_pressure (string, e.g. "120/80")
                - sugar_level (number, mg/dL)
                - temperature (number, Celsius)
                - weight (number, kg)
            
            Do not include markdown formatting. Just return the raw JSON string.`;

            const mimeType = record.metadata?.mimeType || "application/pdf"; // Fallback to PDF if unknown, or map 'Lab Report' to pdf/image based on extension if possible.
            // For now, let's assume if it's not in metadata, it might be a PDF or Image.
            // Better: check file extension from title or url.
            let finalMimeType = mimeType;
            if (!finalMimeType || finalMimeType === "Lab Report") {
                if (record.title.toLowerCase().endsWith(".png")) finalMimeType = "image/png";
                else if (record.title.toLowerCase().endsWith(".jpg") || record.title.toLowerCase().endsWith(".jpeg")) finalMimeType = "image/jpeg";
                else finalMimeType = "application/pdf";
            }

            const imagePart = {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: finalMimeType,
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const extractedData = JSON.parse(text);

            console.log("   AI Success:", extractedData.disease);

            // 3. Update Record
            const newMetadata = {
                ...record.metadata,
                ...extractedData
            };

            const { error: updateError } = await supabase
                .from("records")
                .update({ metadata: newMetadata })
                .eq("id", record.id);

            if (updateError) {
                console.error("   Failed to update record:", updateError);
            } else {
                console.log("   ✅ Record updated.");
            }

            // 4. Insert Vitals if present
            if (extractedData.vitals) {
                const v = extractedData.vitals;
                let sys = null;
                let dia = null;

                if (v.blood_pressure && typeof v.blood_pressure === 'string' && v.blood_pressure.includes('/')) {
                    const parts = v.blood_pressure.split('/');
                    sys = parseInt(parts[0]);
                    dia = parseInt(parts[1]);
                }

                const { error: vitalsError } = await supabase.from("vitals").insert({
                    patient_id: record.user_id,
                    heart_rate: v.heart_rate || null,
                    systolic_bp: sys,
                    diastolic_bp: dia,
                    blood_sugar: v.sugar_level || null,
                    temperature: v.temperature || null,
                    weight: v.weight || null,
                    recorded_at: new Date().toISOString()
                });

                if (vitalsError) console.error("   Failed to insert vitals:", vitalsError);
                else console.log("   ✅ Vitals inserted.");
            }

        } catch (err: any) {
            console.error(`   ❌ Failed to process record: ${err.message}`);
        }
    }
}

fixFailedRecords();
