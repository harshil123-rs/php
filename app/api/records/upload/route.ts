import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string | null) || "Other";

  const language = (formData.get("language") as string | null) || "English";

  if (!file) {
    return NextResponse.json({ message: "File missing" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Upload to Supabase Storage
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const filePath = `${user.id}/${filename}`;

  const { error: uploadError } = await supabase
    .storage
    .from('records')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('records')
    .getPublicUrl(filePath);

  // 2. AI Extraction (if API key exists)
  interface ExtractedData {
    patient_name: string;
    age: string;
    blood_group: string;
    disease: string;
    legality: string;
    vitals?: {
      heart_rate?: number;
      blood_pressure?: string;
      sugar_level?: number;
      temperature?: number;
      weight?: number;
    };
  }

  let extractedData: ExtractedData = {
    patient_name: "Unknown",
    age: "Unknown",
    blood_group: "Unknown",
    disease: "Unknown",
    legality: "Unverified"
  };

  if (process.env.GOOGLE_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite-preview-09-2025",
        generationConfig: { temperature: 0.0 }
      });

      const prompt = `Analyze this medical record image. Extract the following fields and return them as a valid JSON object.
      IMPORTANT: Translate all string values to ${language}.

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
      
      Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.`;

      const imagePart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();

      // Clean up potential markdown code blocks
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(text);
      extractedData = { ...extractedData, ...parsed };

    } catch (error: any) {
      console.error("AI Extraction Failed:", error);
      extractedData.disease = "AI Error: " + error.message;
    }
  }

  // 3. Save to Database
  const { data: doc, error: insertError } = await supabase
    .from("records")
    .insert({
      user_id: user.id,
      title: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: type,
      metadata: {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        ...extractedData
      }
    })
    .select()
    .single();

  // 4. If vitals were extracted, save them to the vitals table
  if (doc && extractedData.vitals) {
    const v = extractedData.vitals;
    let sys = null;
    let dia = null;

    if (v.blood_pressure && typeof v.blood_pressure === 'string' && v.blood_pressure.includes('/')) {
      const parts = v.blood_pressure.split('/');
      sys = parseInt(parts[0]);
      dia = parseInt(parts[1]);
    }

    await supabase.from("vitals").insert({
      patient_id: user.id,
      heart_rate: v.heart_rate || null,
      systolic_bp: sys,
      diastolic_bp: dia,
      blood_sugar: v.sugar_level || null,
      temperature: v.temperature || null,
      weight: v.weight || null,
      recorded_at: new Date().toISOString() // Use current time or extract from doc if possible
    });
  }

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    record: { ...doc, url: doc.file_url }
  });
}
