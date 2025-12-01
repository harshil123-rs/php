"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavLinks } from "@/components/dashboard/sidebar";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 border-b border-card-border/60 bg-slate-950/80">
      {dashboardNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded-full text-xs whitespace-nowrap border ${
            pathname === link.href
              ? "border-emerald-400 text-emerald-300"
              : "border-card-border/60 text-muted"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}


