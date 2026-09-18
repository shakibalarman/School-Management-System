import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { getMyExams } from "../../services/studentPortal";

export function StudentExamsPage() {
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["student-exams"],
    queryFn: getMyExams,
  });

  const grouped = exams.reduce<Record<string, typeof exams>>((acc, e) => {
    (acc[e.exam_name] = acc[e.exam_name] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Exams & Results</h1>
        <p className="text-sm text-slate-500 mt-1">View your exam marks and results.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Award size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No exam results available yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([examName, entries]) => (
            <div key={examName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">{examName}</h3>
                <p className="text-xs text-slate-500 capitalize">{entries[0].exam_type.replace("_", " ")}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Marks</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => {
                      const marks = e.marks;
                      let grade = "F";
                      if (marks >= 80) grade = "A+";
                      else if (marks >= 70) grade = "A";
                      else if (marks >= 60) grade = "A-";
                      else if (marks >= 50) grade = "B";
                      else if (marks >= 40) grade = "C";
                      else if (marks >= 33) grade = "D";

                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm font-medium text-slate-800">{e.subject_name}</td>
                          <td className="px-6 py-3 text-sm text-slate-600">{marks}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              marks >= 50 ? "bg-green-100 text-green-700" : marks >= 33 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            }`}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
