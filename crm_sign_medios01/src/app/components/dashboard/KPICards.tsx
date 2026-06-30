import { TrendingUp } from "lucide-react";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: "blue" | "emerald" | "amber" | "slate" | "gray";
}

export function KPICard({ icon, label, value, trend, color }: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
    gray: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="mt-0.5 text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

// In the new architecture, we might want a dynamic KPICards that takes data as props
// but for now let's just make it exportable and usable.
