import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const schema = z.object({
  action: z.enum(["upload", "medicine", "ai", "daily"])
});

const actionPoints: Record<string, number> = {
  upload: 50,
  medicine: 40,
  ai: 30,
  daily: 20
};

const badgeThresholds = [
  { points: 200, badge: "Wellness Scout" },
  { points: 500, badge: "Health Guardian" },
  { points: 1000, badge: "Vitality Hero" }
];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  let { data: doc, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    // Should exist if GET was called, but create if not
    const { data: newDoc, error: insertError } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        points: 0,
        streak: 0,
        badges: [],
        last_visit: null,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ message: "Error creating achievements" }, { status: 500 });
    }
    doc = newDoc;
  }

  const pointsGain = actionPoints[parsed.data.action] || 0;
  doc.points += pointsGain;

  if (parsed.data.action === "daily") {
    const today = new Date();
    const lastVisit = doc.last_visit ? new Date(doc.last_visit) : null;
    if (lastVisit) {
      const diffDays = Math.floor(
        (today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        doc.streak += 1;
      } else if (diffDays > 1) {
        doc.streak = 1;
      }
    } else {
      doc.streak = 1;
    }
    doc.last_visit = today.toISOString();
  }

  badgeThresholds.forEach(({ points, badge }) => {
    if (doc.points >= points && !doc.badges.includes(badge)) {
      doc.badges.push(badge);
    }
  });

  doc.level = 1 + Math.floor(doc.points / 500);
  doc.updated_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("achievements")
    .update({
      points: doc.points,
      streak: doc.streak,
      badges: doc.badges,
      last_visit: doc.last_visit,
      level: doc.level,
      updated_at: doc.updated_at
    })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ message: "Error updating achievements" }, { status: 500 });
  }

  return NextResponse.json({ achievements: doc });
}


