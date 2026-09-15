import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutCardProps {
  title: string;
  percentage: number;
  color: string;
  subtitle?: string;
}

export function DonutCard({ title, percentage, color, subtitle }: DonutCardProps) {
  const data = [
    { name: "Value", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-600 mb-3">{title}</p>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={color} />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{percentage}%</span>
          </div>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 text-center mt-2">{subtitle}</p>}
    </div>
  );
}
