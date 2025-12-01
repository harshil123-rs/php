import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Return a simulated response if API key is missing, for demo purposes
      // or return a specific error code that the frontend can handle.
      // Let's return a friendly message.
      return NextResponse.json({
        reply: "I'm sorry, but I can't connect to my brain right now (OpenAI API Key is missing). Please check the system configuration.",
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful health assistant.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "AI service error" },
      { status: 500 }
    );
  }
}
