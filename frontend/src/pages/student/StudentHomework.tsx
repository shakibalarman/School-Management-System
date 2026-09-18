import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck } from "lucide-react";
import { getMyHomework, type StudentHomework } from "../../services/studentPortal";

export function StudentHomeworkPage() {
  const { data: homework = [], isLoading } = useQuery({
    queryKey: ["student-homework"],
    queryFn: getMyHomework,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Homework</h1>
        <p className="text-sm text-slate-500 mt-1">View your assignments.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : homework.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpenCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No homework assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homework.map((hw: StudentHomework) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800">{hw.title}</h3>
                {hw.due_date && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
                    Due: {new Date(hw.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {hw.description && <p className="text-sm text-slate-600 mb-2">{hw.description}</p>}
              {hw.subject_name && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">{hw.subject_name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
