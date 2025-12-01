import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  filename: z.string(),
  size: z.number().optional()
});

// Local, unauthenticated medicine verification endpoint.
// It just simulates verification and does NOT call any external API.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  // Placeholder verification logic
  const verified = Math.random() > 0.3;
  const expiryMonths = Math.floor(Math.random() * 24) + 1;
  const safetyScore = Math.floor(Math.random() * 40) + 60;

  return NextResponse.json({
    verified,
    description: verified
      ? "Medicine label looks authentic based on the uploaded image."
      : "Unable to confidently verify this medicine from the image.",
    expiry: `Estimated expiry in ${expiryMonths} month(s)`,
    safetyScore,
    recommendations: verified
      ? ["Store below 25°C", "Follow dosage on the label", "Consult your doctor if unsure"]
      : ["Avoid usage until a pharmacist or doctor can verify it", "Check packaging and batch number carefully"]
  });
}


