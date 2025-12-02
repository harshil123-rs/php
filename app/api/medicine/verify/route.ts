import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this medicine image (pill bottle, blister pack, or box) and extract detailed information.
    Return a valid JSON object with the following structure:

    {
      "identity": {
        "medicine_name": "string",
        "brand_name": "string",
        "generic_name": "string",
        "manufacturer": "string",
        "batch_number": "string (or 'Not visible')"
      },
      "authenticity": {
        "status": "Valid" | "Invalid" | "Suspicious",
        "reason": "string (e.g., 'Batch number matches format', 'Packaging looks authentic')",
        "counterfeit_probability": "Low" | "Medium" | "High"
      },
      "composition": {
        "ingredients": "string (e.g., 'Paracetamol 500mg, Caffeine 30mg')"
      },
      "usage": {
        "purpose": "string",
        "standard_dosage": "string",
        "age_restrictions": "string"
      },
      "safety": {
        "side_effects": "string",
        "drug_interactions": "string",
        "allergy_warning": "string",
        "pregnancy_safety": "string"
      },
      "storage": {
        "instructions": "string"
      },
      "expiry": {
        "manufacturing_date": "string (or 'Not visible')",
        "expiry_date": "string (or 'Not visible')",
        "status": "Safe" | "Near Expiry" | "Expired" | "Unknown"
      },
      "summary": {
        "verdict": "Safe" | "Unsafe" | "Caution",
        "message": "string (e.g., 'Medicine is Authentic & Safe to Use')"
      }
    }

    Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
    If specific details are not visible in the image, use "Not visible" or reasonable inference based on the identified medicine type (e.g., for standard dosage/usage of a known drug).`;

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

    const data = JSON.parse(text);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Medicine Verification Error:", error);
    return NextResponse.json(
      { error: "Verification failed: " + error.message },
      { status: 500 }
    );
  }
}
