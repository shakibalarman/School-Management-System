import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { api } from "../lib/api";

interface RoutinePeriod {
  id: string;
  period: number;
  start_time: string;
  end_time: string;
  class: { id: string; name: string };
  section: { id: string; name: string } | null;
  subject: { id: string; name: string; code: string };
}

interface RoutineDay {
  day: string;
  periods: RoutinePeriod[];
}

async function getMyRoutine(): Promise<RoutineDay[]> {
  const { data } = await api.get("/teacher/routine");
  return data;
}

const DAY_LABELS: Record<string, string> = {
  saturday: "Saturday",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

const DAY_COLORS: Record<string, string> = {
  saturday: "border-indigo-200 bg-indigo-50",
  sunday: "border-emerald-200 bg-emerald-50",
  monday: "border-blue-200 bg-blue-50",
  tuesday: "border-amber-200 bg-amber-50",
  wednesday: "border-purple-200 bg-purple-50",
  thursday: "border-rose-200 bg-rose-50",
  friday: "border-slate-200 bg-slate-50",
};

export function TeacherRoutinePage() {
  const { data: routine = [], isLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: getMyRoutine,
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Class Routine</h1>
        <p className="text-sm text-slate-500 mt-1">Your weekly teaching schedule.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : routine.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Clock size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No schedule assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routine.map((day) => {
            const isToday = day.day === today;
            return (
              <div key={day.day} className={`rounded-2xl border-2 overflow-hidden ${isToday ? "border-indigo-400 shadow-md" : DAY_COLORS[day.day] || "border-slate-200 bg-white"}`}>
                <div className={`px-4 py-3 ${isToday ? "bg-indigo-600 text-white" : "bg-white border-b border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${isToday ? "text-white" : "text-slate-800"}`}>
                      {DAY_LABELS[day.day] || day.day}
                    </h3>
                    {isToday && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full">TODAY</span>
                    )}
                  </div>
                  <p className={`text-xs ${isToday ? "text-indigo-200" : "text-slate-400"}`}>
                    {day.periods.length} periods
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {day.periods.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                      <div className="w-10 text-center shrink-0">
                        <p className="text-xs font-bold text-indigo-600">P{p.period}</p>
                        <p className="text-[10px] text-slate-400">{p.start_time}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{p.subject.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.class.name}{p.section ? ` - ${p.section.name}` : ""}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 shrink-0">{p.end_time}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
