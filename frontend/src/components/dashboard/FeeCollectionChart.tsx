import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FeeCollectionChartProps {
  collected: number;
  outstanding: number;
}

export function FeeCollectionChart({ collected, outstanding }: FeeCollectionChartProps) {
  const data = [
    { name: "Collection", amount: collected },
    { name: "Outstanding", amount: outstanding },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-sm font-semibold text-slate-800 mb-4">Fee Collection Overview</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
