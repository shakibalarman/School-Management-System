import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOCK_DATA = [
  { day: "Mon", students: 85, teachers: 92 },
  { day: "Tue", students: 88, teachers: 95 },
  { day: "Wed", students: 82, teachers: 90 },
  { day: "Thu", students: 90, teachers: 93 },
  { day: "Fri", students: 87, teachers: 88 },
  { day: "Sat", students: 91, teachers: 96 },
];

export function AttendanceChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-800">Daily Attendance Overview</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Students
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            Teachers
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={MOCK_DATA}>
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="students"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStudents)"
          />
          <Area
            type="monotone"
            dataKey="teachers"
            stroke="#2dd4bf"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTeachers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
