"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Activity,
    FileSignature,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const doctorRoutes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/doctor/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Appointments",
        icon: Calendar,
        href: "/doctor/dashboard/appointments",
        color: "text-violet-500",
    },
    {
        label: "Prescriptions",
        icon: FileText,
        href: "/doctor/dashboard/prescriptions",
        color: "text-pink-700",
    },

    {
        label: "Certificates",
        icon: FileSignature,
        href: "/doctor/dashboard/certificates",
        color: "text-emerald-500",
    },
    {
        label: "Analytics",
        icon: Activity,
        href: "/doctor/dashboard/analytics",
        color: "text-green-700",
    },
];

export function DoctorSidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
            <div className="px-3 py-2 flex-1">
                <Link href="/doctor/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-50"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white text-lg">D</span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold">
                        Doctor<span className="text-blue-400">Portal</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {doctorRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <button
                    onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/auth/login";
                    }}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Logout
                    </div>
                </button>
            </div>
        </div>
    );
}
