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
          const model = genAI.getGenerativeModel({
            model: modelName,
            // Set temperature to 0 for deterministic (consistent) results
            generationConfig: { temperature: 0.0 }
          });
          const result = await model.generateContent([prompt, ...imageParts]);
          const response = await result.response;
          return { response, modelName };
        } catch (error: any) {
          console.warn(`Model ${modelName} failed:`, error.message);
          // Continue to next model
        }
      }
      throw new Error("All AI models failed to process the image.");
    };

    const prompt = `Act as a Pharmaceutical Forensic Expert and AI Vision System.
    Analyze these medicine images (pill bottle, blister pack, or box) with extreme precision.
    
    Your Goal: Extract exact text via OCR, identify the medicine, and detect any signs of counterfeiting or damage.

    Instructions:
    1. **OCR & Identification**: Read the exact Medicine Name, Dosage, and Manufacturer from the image. Do not guess.
    2. **Authenticity Check**: Look for high-quality printing, correct logos, and batch numbers. If the text is blurry, misspelled, or the packaging looks cheap, mark as "Suspicious".
    3. **Consistency**: If you analyze this same image again, you MUST produce the exact same result.
    4. **Translation**: Translate all output values to ${language}.

    Return a valid JSON object with this EXACT structure:

    {
      "identity": {
        "medicine_name": "string (Exact name from label)",
        "brand_name": "string",
        "generic_name": "string (Active ingredient)",
        "manufacturer": "string",
        "batch_number": "string (Extract exact alphanumeric code or 'Not visible')"
      },
      "authenticity": {
        "status": "Valid" | "Invalid" | "Suspicious",
        "reason": "string (Detailed forensic explanation, e.g., 'Hologram visible', 'Text alignment correct')",
        "counterfeit_probability": "Low" | "Medium" | "High"
      },
      "composition": {
        "ingredients": "string (List active ingredients and strengths)"
      },
      "usage": {
        "purpose": "string (Medical condition treated)",
        "standard_dosage": "string (Standard dosage guidelines)",
        "age_restrictions": "string"
      },
      "safety": {
        "side_effects": "string (Common side effects)",
        "drug_interactions": "string (Major interactions)",
        "allergy_warning": "string",
        "pregnancy_safety": "string"
      },
      "storage": {
        "instructions": "string (e.g., 'Store below 25°C')"
      },
      "expiry": {
        "manufacturing_date": "string (YYYY-MM-DD or 'Not visible')",
        "expiry_date": "string (YYYY-MM-DD or 'Not visible')",
        "status": "Safe" | "Near Expiry" | "Expired" | "Unknown"
      },
      "summary": {
        "verdict": "Safe" | "Unsafe" | "Caution",
        "message": "string (Clear, actionable advice for the patient)"
      }
    }

    Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.`;

    // Prioritize working models based on available list
    // User requested real data, so we remove the simulated fallback.
    // TESTED: gemini-2.5-flash-lite-preview-09-2025 works. gemini-2.0-flash-exp exists but might be rate limited.
    const { response, modelName } = await generateWithFallback(
      [
        
        "gemini-2.5-flash-lite-preview-09-2025"
      ],
      prompt,
      imageParts
    );
    let text = response.text();

    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(text);

    // Add the model used to the response
    data.used_model = modelName;

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Medicine Verification Error:", error);
    return NextResponse.json(
      { error: "Verification failed: " + error.message },
      { status: 500 }
    );
  }
}
