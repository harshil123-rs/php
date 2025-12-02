import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";


export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <MobileNav />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 space-y-6 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_55%)]">
          {children}
        </main>
      </div>
    </div>
  );
}


