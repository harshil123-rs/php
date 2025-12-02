import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        reply: "I'm sorry, but I can't connect to my brain right now (Google API Key is missing). Please check the system configuration.",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful health assistant. Keep answers concise and friendly." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help with health-related questions." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      reply: text,
    });
  } catch (err: any) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "AI service error: " + (err.message || "Unknown") },
      { status: 500 }
    );
  }
}
