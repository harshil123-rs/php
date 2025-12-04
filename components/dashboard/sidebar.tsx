"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  Pill,
  Brain,
  Star,
  MapPin,
  Siren,
  User,
  Calendar
} from "lucide-react";

export const dashboardNavLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/records", label: "Records", icon: FileText },
  { href: "/dashboard/medicine", label: "Medicine", icon: Pill },
  { href: "/dashboard/ai", label: "AI Assistant", icon: Brain },
  { href: "/dashboard/achievements", label: "Achievements", icon: Star },
  { href: "/dashboard/appointments", label: "Book Appointment", icon: Calendar },
  { href: "/dashboard/doctors", label: "Doctors", icon: MapPin },
  { href: "/dashboard/emergency", label: "Emergency", icon: Siren },
  { href: "/dashboard/profile", label: "Profile", icon: User }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-card-border/60 bg-gradient-to-b from-slate-950 to-slate-900/80">
      <div className="flex items-center px-6 py-5 border-b border-card-border/60">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-2">
          <span className="text-emerald-400 font-bold text-lg">HV</span>
        </div>
        <div>
          <p className="font-semibold tracking-tight">VYTAL</p>
          <p className="text-xs text-muted">Personal Health Record</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {dashboardNavLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                active
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                  : "text-muted hover:text-foreground hover:bg-slate-800/70"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/auth/login";
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors mt-4 border border-blue-500/30 w-full text-blue-400 hover:bg-blue-500/10 text-left"
        >
          <User className="h-4 w-4" />
          <span>Doctor Portal</span>
        </button>
      </nav>
    </aside>
  );
}


