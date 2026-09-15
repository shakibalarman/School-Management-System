import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: "blue" | "green" | "orange" | "purple" | "red" | "teal";
  subtitle?: string;
}

const COLOR_MAP = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  orange: "from-orange-400 to-orange-500",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-400 to-red-500",
  teal: "from-teal-400 to-teal-500",
};

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${COLOR_MAP[color]} p-5 text-white shadow-lg overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-6 -translate-y-6">
        {icon}
      </div>
      <div className="relative">
        <p className="text-3xl font-bold mb-1">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-sm font-medium opacity-90">{title}</p>
        {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
