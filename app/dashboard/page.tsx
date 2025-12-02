"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ClipboardList, Pill, Trophy, Upload, Stethoscope, Bot } from "lucide-react";
import { StatCard } from "@/components/cards/StatCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AchievementState {
  points: number;
  streak: number;
  level: number;
  badges: string[];
}

interface RecordItem {
  _id: string;
  filename: string;
  type: string;
  createdAt: string;
}

// Mock data for the chart
const healthData = [
  { date: "Mon", value: 82 },
  { date: "Tue", value: 85 },
  { date: "Wed", value: 83 },
  { date: "Thu", value: 88 },
  { date: "Fri", value: 86 },
  { date: "Sat", value: 90 },
  { date: "Sun", value: 89 },
];

export default function DashboardHome() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementState | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        try {
          await fetch("/api/achievements/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "daily" })
          });
        } catch {
          // ignore gamification errors
        }
        const [ach, rec] = await Promise.all([
          fetch("/api/achievements", { cache: "no-store" }),
          fetch("/api/records", { cache: "no-store" })
        ]);
        if (ach.ok) {
          const data = await ach.json();
          setAchievements(data.achievements);
        }
        if (rec.ok) {
          const data = await rec.json();
          setRecords(data.records.slice(0, 5));
        }
      } catch {
        // ignore for now
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Good evening, welcome back 👋
        </h1>
        <p className="text-slate-400">
          Track your personal health records, medications, and proactive care journey.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            label="Points"
            value={achievements?.points ?? 0}
            sublabel="Earn more by staying active"
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            label="Daily streak"
            value={`${achievements?.streak ?? 0} days`}
            sublabel="Keep your streak for bonus points"
            icon={<Activity className="h-5 w-5 text-emerald-500" />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            label="Level"
            value={`Lv ${achievements?.level ?? 1}`}
            sublabel="Level up every 500 pts"
            icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            label="Badges"
            value={achievements?.badges?.length ?? 0}
            sublabel="Collect rare achievements"
            icon={<Pill className="h-5 w-5 text-purple-500" />}
          />
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Health Activity Score</h3>
              <p className="text-sm text-slate-400">Weekly monitoring based on your inputs</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +2.4% vs last week
              </span>
            </div>
          </div>
          <HealthChart data={healthData} color="#10b981" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 space-y-6"
        >
          <div>
            <h3 className="font-semibold text-lg">Quick Actions</h3>
            <p className="text-sm text-slate-400">Stay on top of your health</p>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-base hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all"
              onClick={() => router.push("/dashboard/records")}
            >
              <Upload className="w-5 h-5" />
              Upload health record
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-base hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              onClick={() => router.push("/dashboard/medicine")}
            >
              <Pill className="w-5 h-5" />
              Verify medicine
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-base hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30 transition-all"
              onClick={() => router.push("/dashboard/ai")}
            >
              <Bot className="w-5 h-5" />
              Ask AI assistant
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-base hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30 transition-all"
              onClick={() => router.push("/dashboard/doctors")}
            >
              <Stethoscope className="w-5 h-5" />
              Find Doctors
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Recent Records</h3>
            <p className="text-sm text-slate-400">Your latest medical uploads</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/records")}>
            View all
          </Button>
        </div>
        <div className="space-y-3">
          {records.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Upload className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No records yet. Upload your first file!</p>
            </div>
          )}
          {records.map((record) => (
            <div
              key={record._id}
              className="flex items-center justify-between border border-white/5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">{record.filename}</p>
                  <p className="text-xs text-slate-400">
                    {record.type} • {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => window.open(`/dashboard/records?highlight=${record._id}`, "_self")}
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}


