import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <div className="glass-card p-4 md:p-5 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        {sublabel && (
          <p className="mt-1 text-xs text-muted">{sublabel}</p>
        )}
      </div>
      {icon && (
        <div className="h-10 w-10 rounded-xl bg-slate-900/80 flex items-center justify-center text-emerald-400">
          {icon}
        </div>
      )}
    </div>
  );
}


