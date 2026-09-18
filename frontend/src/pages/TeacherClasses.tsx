import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown, ChevronUp, Search } from "lucide-react";
import { api } from "../lib/api";

interface ClassStudent {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  roll_number: number | null;
  status: string;
}

interface ClassSubject {
  id: string;
  name: string;
  code: string;
  is_mine: boolean;
}

interface TeacherClass {
  class_id: string;
  class_name: string;
  section_id: string | null;
  section_name: string | null;
  students: ClassStudent[];
  student_count: number;
  subjects: ClassSubject[];
}

async function getMyClasses(): Promise<TeacherClass[]> {
  const { data } = await api.get("/teacher/classes");
  return data;
}

export function TeacherClassesPage() {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: getMyClasses,
  });
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Classes</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your assigned classes and students.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No classes assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-2xl font-bold text-indigo-600">{classes.length}</p>
              <p className="text-xs text-slate-500">Assigned Classes</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-2xl font-bold text-green-600">
                {classes.reduce((sum, c) => sum + c.student_count, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Students</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-2xl font-bold text-purple-600">
                {classes.reduce((sum, c) => sum + c.subjects.filter((s) => s.is_mine).length, 0)}
              </p>
              <p className="text-xs text-slate-500">My Subjects</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name or code..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Class Cards */}
          {classes.map((cls) => {
            const isExpanded = expandedClass === cls.class_id;
            const filteredStudents = cls.students.filter((s) => {
              if (!search) return true;
              const q = search.toLowerCase();
              return (
                s.first_name.toLowerCase().includes(q) ||
                s.last_name.toLowerCase().includes(q) ||
                s.student_code.toLowerCase().includes(q)
              );
            });
            return (
              <div key={cls.class_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : cls.class_id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-800">{cls.class_name}</h3>
                      <p className="text-xs text-slate-500">
                        {cls.student_count} students • {cls.subjects.filter((s) => s.is_mine).length} my subjects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {cls.subjects.filter((s) => s.is_mine).slice(0, 3).map((s) => (
                        <span key={s.id} className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded">
                          {s.code}
                        </span>
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200">
                    {/* Subjects */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {cls.subjects.map((s) => (
                          <span
                            key={s.id}
                            className={`px-2 py-1 text-xs font-medium rounded-lg ${
                              s.is_mine ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {s.name} {s.is_mine && "✓"}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Roll</th>
                            <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Student</th>
                            <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Code</th>
                            <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Email</th>
                            <th className="text-center px-5 py-2 text-xs font-semibold text-slate-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-4 text-center text-xs text-slate-400">
                                No students found.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-5 py-2 text-slate-600">{s.roll_number ?? "—"}</td>
                                <td className="px-5 py-2 font-medium text-slate-800">{s.first_name} {s.last_name}</td>
                                <td className="px-5 py-2 text-slate-600">{s.student_code}</td>
                                <td className="px-5 py-2 text-slate-500">{s.email}</td>
                                <td className="px-5 py-2 text-center">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                    {s.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
