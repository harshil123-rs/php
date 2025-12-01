"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AchievementState {
  points: number;
  streak: number;
  level: number;
  badges: string[];
}

interface Award {
  id: string;
  name: string;
  description: string;
  points: number;
}

const actions = [
  { label: "Uploaded record", action: "upload" },
  { label: "Verified medicine", action: "medicine" },
  { label: "Used AI assistant", action: "ai" },
  { label: "Visited today", action: "daily" }
] as const;

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementState | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);

  const loadData = useCallback(async () => {
    const [achRes, awardsRes] = await Promise.all([
      fetch("/api/achievements", { cache: "no-store" }),
      fetch("/api/awards", { cache: "no-store" })
    ]);
    if (achRes.ok) {
      const data = await achRes.json();
      setAchievements(data.achievements);
    }
    if (awardsRes.ok) {
      const data = await awardsRes.json();
      setAwards(data.awards);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const triggerAction = async (action: (typeof actions)[number]["action"]) => {
    await fetch("/api/achievements/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-title">Achievements & Gamification</p>
        <p className="page-subtitle">
          Earn points for healthy habits and unlock exclusive badges.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted uppercase tracking-[0.3em]">Points</p>
          <p className="mt-2 text-3xl font-semibold">{achievements?.points ?? 0}</p>
          <p className="text-sm text-muted mt-1">Earn 500 points to level up.</p>
          <div className="mt-3 h-2 bg-slate-900 rounded-full">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(100, ((achievements?.points ?? 0) % 500) / 5)}%`
              }}
            />
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted uppercase tracking-[0.3em]">Streak</p>
          <p className="mt-2 text-3xl font-semibold">{achievements?.streak ?? 0} days</p>
          <p className="text-sm text-muted mt-1">Visit daily to earn bonus points.</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted uppercase tracking-[0.3em]">Level</p>
          <p className="mt-2 text-3xl font-semibold">Lv {achievements?.level ?? 1}</p>
          <p className="text-sm text-muted mt-1">
            Higher levels unlock premium insights.
          </p>
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="font-semibold mb-4">Badges unlocked</p>
        <div className="flex flex-wrap gap-3">
          {(achievements?.badges || []).length === 0 && (
            <p className="text-sm text-muted">Earn badges by keeping up your habits.</p>
          )}
          {achievements?.badges?.map((badge) => (
            <div
              key={badge}
              className="px-4 py-2 rounded-full border border-emerald-400/40 text-emerald-300 text-sm"
            >
              {badge}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <p className="font-semibold">Trigger points</p>
        <div className="grid md:grid-cols-4 gap-3">
          {actions.map((item) => (
            <Button
              key={item.action}
              variant="outline"
              onClick={() => triggerAction(item.action)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <p className="font-semibold mb-4">Available awards</p>
        <div className="grid md:grid-cols-3 gap-4">
          {awards.map((award) => (
            <div key={award.id} className="border border-card-border/60 rounded-xl p-4">
              <p className="text-lg font-semibold">{award.name}</p>
              <p className="text-sm text-muted mt-1">{award.description}</p>
              <p className="text-sm text-emerald-300 mt-2">
                +{award.points} points
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


