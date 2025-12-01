"use client";

import { Bell, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    router.replace("/auth/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-card-border/60 px-4 md:px-8 py-3 bg-slate-950/60 backdrop-blur-xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
          vytal
        </p>
        <p className="text-sm text-muted">Your personal health command center</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full h-9 w-9 flex items-center justify-center bg-slate-900/80 border border-card-border/60 hover:bg-slate-800/80">
          <Bell className="h-5 w-5 text-muted" />
          <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 border border-slate-950" />
        </button>
        <button className="rounded-full h-9 w-9 flex items-center justify-center bg-slate-900/80 border border-card-border/60 hover:bg-slate-800/80">
          <Settings className="h-5 w-5 text-muted" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-card-border/60">
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium">You</span>
            <span className="text-[11px] text-muted">Secure Profile</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-xs font-semibold">
            HV
          </div>
          <Button
            size="sm"
            variant="outline"
            className="hidden md:inline-flex text-xs px-3"
            onClick={handleLogout}
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}


