
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY is missing in .env.local");
    process.exit(1);
}

console.log(`🔑 Testing with API Key: ${apiKey.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
    console.log(`\n🤖 Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Explain how AI works in one sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Success! Response: ${text}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function listAvailableModels() {
    console.log("\n📋 Listing available models...");
    try {
        // Note: listModels is not directly available on genAI instance in some versions, 
        // we might need to use the model manager or just try a different approach.
        // Actually, for google-generative-ai, we can't easily list models via the client instance in this version.
        // Let's try 'gemini-1.0-pro' and 'gemini-pro-vision' which are older but might work.
        // Also, let's try to use the 'models' endpoint via fetch if possible, but let's stick to the SDK first.

        const modelsToTry = [
            "gemini-2.0-flash-exp",
            "gemini-2.5-flash-lite-preview-09-2025",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro-001"
        ];

        for (const model of modelsToTry) {
            await testModel(model);
        }

    } catch (error: any) {
        console.error("Error listing models:", error);
    }
}

listAvailableModels();
