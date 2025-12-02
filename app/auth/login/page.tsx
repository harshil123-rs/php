"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"patient" | "doctor" | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent, type: "patient" | "doctor") => {
    e.preventDefault();
    setLoading(type);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Redirect based on column type
      if (type === "doctor") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* Patient Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 border border-emerald-500/20 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Patient Portal</h2>
            <p className="text-slate-400 text-sm mt-2">Access your personal health records</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => handleLogin(e, "patient")}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="patient@example.com"
                required
                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 transition-colors"
              />
            </div>

            {error && loading === "patient" && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading === "patient"}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {loading === "patient" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In as Patient <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              New here?{" "}
              <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Doctor Login */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-8 border border-blue-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Doctor Portal</h2>
            <p className="text-slate-400 text-sm mt-2">Secure access for medical professionals</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => handleLogin(e, "doctor")}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Work Email</label>
              <Input
                name="email"
                type="email"
                placeholder="doctor@hospital.com"
                required
                className="bg-slate-900/50 border-slate-700 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-slate-900/50 border-slate-700 focus:border-blue-500 transition-colors"
              />
            </div>

            {error && loading === "doctor" && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading === "doctor"}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-blue-500/20"
            >
              {loading === "doctor" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In as Doctor <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 italic">
              Restricted access. Contact admin for credentials.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
