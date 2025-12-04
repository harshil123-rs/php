import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: "Symptoms required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Act as a medical assistant. Based on the following symptoms/diagnosis: "${symptoms}", suggest a list of common medicines.
    
    Return a valid JSON object with a "medicines" array. Each item should have:
    - name (string)
    - dosage (string, e.g., "500mg")
    - frequency (string, e.g., "1-0-1" or "Twice daily")
    - duration (string, e.g., "5 days")
    - instructions (string, e.g., "After food")

    Example JSON:
    {
      "medicines": [
        { "name": "Paracetamol", "dosage": "500mg", "frequency": "1-1-1", "duration": "3 days", "instructions": "After food" }
      ]
    }

    Do not include markdown formatting. Just raw JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(text);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Suggestion Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
