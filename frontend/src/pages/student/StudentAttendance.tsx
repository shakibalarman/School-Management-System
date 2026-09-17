import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { getMyAttendance } from "../../services/studentPortal";

const STATUS_STYLES: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-yellow-100 text-yellow-700",
  excused: "bg-blue-100 text-blue-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  present: <CheckCircle size={14} />,
  absent: <XCircle size={14} />,
  late: <Clock size={14} />,
  excused: <AlertCircle size={14} />,
};

export function StudentAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["student-attendance", month, year],
    queryFn: () => getMyAttendance(month, year),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">Track your attendance records.</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{data?.total ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Total Days</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{data?.present ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{data?.absent ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Absent</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{data?.late ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Late</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{data?.percentage ?? 0}%</p>
          <p className="text-xs text-slate-500 mt-1">Attendance</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.records ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[r.status]}`}>
                        {STATUS_ICONS[r.status]}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(data?.records ?? []).length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center">
                      <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">No attendance records for this month.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
