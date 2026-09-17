import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { getMySubjects } from "../../services/studentPortal";

export function StudentSchedulePage() {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["student-subjects"],
    queryFn: getMySubjects,
  });

  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Weekly class schedule for your subjects.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No schedule available yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Day</th>
                  {subjects.map((s) => (
                    <th key={s.id} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, i) => (
                  <tr key={day} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{day}</td>
                    {subjects.map((s) => (
                      <td key={s.id} className="px-4 py-3 text-sm text-slate-600">
                        {i < 6 ? `${9 + Math.floor(i * 1.5)}:00` : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500">Schedule is illustrative. Contact admin for the official timetable.</p>
          </div>
        </div>
      )}
    </div>
  );
}
