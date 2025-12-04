import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const language = formData.get("language") as string || "English";
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Files missing" }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const imageParts = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
          },
        };
      })
    );

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Helper to try multiple models
    const generateWithFallback = async (models: string[], prompt: string, imageParts: any[]) => {
      for (const modelName of models) {
        try {
          console.log(`Attempting verification with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([prompt, ...imageParts]);
          const response = await result.response;
          return response;
        } catch (error: any) {
          console.warn(`Model ${modelName} failed:`, error.message);
          // Continue to next model
        }
      }
      throw new Error("All AI models failed to process the image.");
    };

    const prompt = `Analyze these medicine images (pill bottle, blister pack, or box) and extract detailed information.
    Return a valid JSON object with the following structure.
    IMPORTANT: Translate all string values to ${language}.

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

    // Try user-requested 2.5, then fallbacks
    const response = await generateWithFallback(
      ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"],
      prompt,
      imageParts
    );
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
