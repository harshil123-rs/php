"use client";

import { useState } from "react";
import { Bell, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    window.location.href = "/auth/login";
  };

  const notifications = [
    { id: 1, title: "Welcome to Vytal", message: "Your health journey starts here.", time: "Just now" },
    { id: 2, title: "Profile Updated", message: "Your profile details have been saved.", time: "2m ago" },
  ];

  return (
    <header className="flex items-center justify-between border-b border-card-border/60 px-4 md:px-8 py-3 bg-slate-950/60 backdrop-blur-xl relative z-50">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
          vytal
        </p>
        <p className="text-sm text-muted">Your personal health command center</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full h-9 w-9 flex items-center justify-center bg-slate-900/80 border border-card-border/60 hover:bg-slate-800/80 transition-colors"
          >
            <Bell className="h-5 w-5 text-muted" />
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 border border-slate-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-card-border rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-card-border/60 bg-slate-900/50">
                <h4 className="font-semibold text-sm">Notifications</h4>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-white/5 border-b border-card-border/30 last:border-0 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-slate-200">{notif.title}</p>
                      <span className="text-[10px] text-slate-500">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-400">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-card-border/60 bg-slate-900/50 text-center">
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard/profile")}
          className="rounded-full h-9 w-9 flex items-center justify-center bg-slate-900/80 border border-card-border/60 hover:bg-slate-800/80 transition-colors"
        >
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


