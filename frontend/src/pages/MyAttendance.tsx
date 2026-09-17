import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getStudentAttendance } from "../services/attendance";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; dot: string }> = {
  present: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  absent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  late: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  excused: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function MyAttendancePage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: summary, isLoading } = useQuery({
    queryKey: ["my-attendance", user?.id, month, year],
    queryFn: () => getStudentAttendance(user!.id, month, year),
    enabled: !!user?.id,
  });

  const attendanceByDate = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    if (summary?.records) {
      for (const rec of summary.records) {
        const dateKey = rec.date.split("T")[0];
        map[dateKey] = rec.status as AttendanceStatus;
      }
    }
    return map;
  }, [summary]);

  const daysInMonth = getDaysInMonth(year, month - 1);
  const firstDay = getFirstDayOfMonth(year, month - 1);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function formatDateKey(d: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const totalDays = summary?.total ?? 0;
  const presentCount = summary?.present ?? 0;
  const absentCount = summary?.absent ?? 0;
  const lateCount = summary?.late ?? 0;
  const excusedCount = summary?.excused ?? 0;
  const percentage = summary?.percentage ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">View your attendance record for the selected month.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{totalDays}</p>
          <p className="text-xs text-slate-500 mt-1">Total Days</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Absent</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
          <p className="text-xs text-slate-500 mt-1">Late</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Excused</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={`text-2xl font-bold ${percentage >= 75 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
            {percentage}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Attendance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
          </div>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map((label) => (
                <div key={label} className="text-center py-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
                </div>
              ))}

              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-14" />;
                }

                const dateKey = formatDateKey(day);
                const status = attendanceByDate[dateKey];
                const colors = status ? STATUS_COLORS[status] : null;
                const isToday =
                  day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

                return (
                  <div
                    key={day}
                    className={`h-14 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${
                      colors
                        ? `${colors.bg} border-transparent`
                        : "border-slate-100 bg-slate-50/50"
                    } ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                  >
                    <span className={`text-sm font-medium ${colors ? colors.text : "text-slate-600"}`}>
                      {day}
                    </span>
                    {status && (
                      <div className={`w-2 h-2 rounded-full ${colors!.dot}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {(Object.entries(STATUS_COLORS) as [AttendanceStatus, typeof STATUS_COLORS.present][]).map(
              ([status, colors]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <span className="text-xs text-slate-600 capitalize">{status}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
