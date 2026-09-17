import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { getMySubjects } from "../../services/studentPortal";

export function StudentSubjectsPage() {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["student-subjects"],
    queryFn: getMySubjects,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Subjects</h1>
        <p className="text-sm text-slate-500 mt-1">Subjects assigned to your class.</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No subjects assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                  ["from-indigo-500 to-purple-600", "from-green-500 to-emerald-600", "from-amber-500 to-orange-600",
                   "from-blue-500 to-indigo-600", "from-pink-500 to-rose-600", "from-teal-500 to-cyan-600"][i % 6]
                }`}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{s.name}</h3>
                  <p className="text-xs text-slate-500">{s.code}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
