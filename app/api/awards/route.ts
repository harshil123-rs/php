import { NextResponse } from "next/server";

export async function GET() {
  const awards = [
    {
      id: "checkup-pro",
      name: "Checkup Pro",
      description: "Upload 5+ lab records in a week",
      points: 100
    },
    {
      id: "safety-champion",
      name: "Safety Champion",
      description: "Verify medicines 3 times",
      points: 80
    },
    {
      id: "ai-enthusiast",
      name: "AI Enthusiast",
      description: "Consult the AI assistant 10 times",
      points: 120
    }
  ];
  return NextResponse.json({ awards });
}


