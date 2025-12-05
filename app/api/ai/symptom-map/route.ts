
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const { symptoms, language = "en" } = await req.json();

        if (!symptoms) {
            return NextResponse.json({ error: "Symptoms are required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

        const prompt = `
        Analyze the following symptoms and identify the affected human body parts.
        Symptoms: "${symptoms}"

        Return a JSON object with:
        1. "affected_parts": Array of strings from this specific list: 
           ["head", "neck", "chest", "stomach", "left_arm", "right_arm", "left_leg", "right_leg", "lungs", "heart", "liver", "kidneys", "intestines", "brain"].
           Map the symptoms to the most relevant parts. If a symptom is general (e.g., "fever"), map to "head" or "body" if applicable, but prefer specific organs/parts.
        2. "description": A short explanation of why these parts are highlighted (in ${language}).
        3. "severity": "Low", "Medium", or "High" based on the symptoms.

        Example output:
        {
            "affected_parts": ["lungs", "chest"],
            "description": "Cough and chest pain suggest respiratory issues affecting the lungs.",
            "severity": "Medium"
        }
        
        Return ONLY valid JSON.
        `;

        let text = "";
        const models = ["gemini-2.5-flash-lite-preview-09-2025", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];
        let modelSuccess = false;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                modelSuccess = true;
                break; // Exit loop on success
            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error);
                // Continue to next model
            }
        }

        if (!modelSuccess) {
            console.error("All AI models failed, using local fallback.");
            // Local Fallback based on keywords
            const lowerSymptoms = symptoms.toLowerCase();
            const fallbackResponse = {
                affected_parts: [] as string[],
                description: "AI service is currently busy. Showing estimated affected areas based on keywords.",
                severity: "Low"
            };

            if (lowerSymptoms.includes("chest") || lowerSymptoms.includes("heart") || lowerSymptoms.includes("breath")) {
                fallbackResponse.affected_parts.push("chest", "heart", "lungs");
                fallbackResponse.severity = "High";
            }
            if (lowerSymptoms.includes("head") || lowerSymptoms.includes("dizzy") || lowerSymptoms.includes("migraine")) {
                fallbackResponse.affected_parts.push("head", "brain");
                fallbackResponse.severity = "Medium";
            }
            if (lowerSymptoms.includes("stomach") || lowerSymptoms.includes("belly") || lowerSymptoms.includes("digest") || lowerSymptoms.includes("pain")) {
                fallbackResponse.affected_parts.push("stomach", "intestines");
                fallbackResponse.severity = "Medium";
            }
            if (lowerSymptoms.includes("arm")) fallbackResponse.affected_parts.push("left_arm", "right_arm");
            if (lowerSymptoms.includes("leg")) fallbackResponse.affected_parts.push("left_leg", "right_leg");

            // Default if nothing matches
            if (fallbackResponse.affected_parts.length === 0) {
                fallbackResponse.affected_parts.push("chest");
                fallbackResponse.description = "Could not identify specific areas. Highlighting general torso.";
            }

            return NextResponse.json(fallbackResponse);
        }

        // Clean markdown
        const jsonString = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("AI Symptom Map Error:", error);
        // Final safety net
        return NextResponse.json({
            affected_parts: ["chest"],
            description: "An unexpected error occurred. Defaulting to chest view.",
            severity: "Low"
        });
    }
}
