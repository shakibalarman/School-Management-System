import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Search, BarChart3, Users, TrendingUp, Trophy } from "lucide-react";
import { listExams, type Exam } from "../services/exams";
import { listClasses } from "../services/classes";
import { getAllResults, getTeacherResults, getOverallResults, type StudentResult, type OverallResult } from "../services/results";
import { useAuth } from "../auth/AuthContext";
import type { SchoolClass } from "../types";

export function ResultsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "head_teacher";
  const isTeacher = user?.role === "teacher";

  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"overall" | "students">("overall");

  const { data: exams = [] } = useQuery<Exam[]>({ queryKey: ["exams"], queryFn: listExams });
  const { data: classes = [] } = useQuery<SchoolClass[]>({ queryKey: ["classes"], queryFn: listClasses });

  const { data: overall, isLoading: overallLoading } = useQuery<OverallResult>({
    queryKey: ["results-overall", selectedExam],
    queryFn: () => getOverallResults(selectedExam),
    enabled: !!selectedExam && isAdmin,
  });

  const { data: studentResults = [], isLoading: studentsLoading } = useQuery<StudentResult[]>({
    queryKey: ["results", selectedExam, selectedClass, isAdmin, isTeacher],
    queryFn: () => {
      if (!selectedExam) return Promise.resolve([]);
      if (isTeacher) return getTeacherResults(selectedExam);
      return getAllResults(selectedExam, selectedClass || undefined);
    },
    enabled: !!selectedExam,
  });

  const filteredStudents = studentResults.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.student_name.toLowerCase().includes(q) || r.student_code?.toLowerCase().includes(q);
  });

  const isLoading = tab === "overall" ? overallLoading : studentsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Results</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? "View overall and individual student results" : "View results for your assigned subjects"}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Exam *</label>
            <select value={selectedExam} onChange={(e) => { setSelectedExam(e.target.value); setExpandedClass(null); setExpandedStudent(null); }} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select exam</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.exam_type})</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Class (optional)</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Student name..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for admin */}
      {isAdmin && selectedExam && (
        <div className="flex gap-2">
          <button onClick={() => setTab("overall")} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "overall" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <BarChart3 size={16} /> Overall
          </button>
          <button onClick={() => setTab("students")} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "students" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Users size={16} /> Students
          </button>
        </div>
      )}

      {!selectedExam ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Award size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Select an exam to view results.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ===== OVERALL TAB ===== */}
          {tab === "overall" && overall && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-slate-800">{overall.summary.total_students}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-600">{overall.summary.pass_rate}%</p>
                  <p className="text-xs text-slate-400">{overall.summary.passed} passed / {overall.summary.failed} failed</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Average GPA</p>
                  <p className="text-2xl font-bold text-indigo-600">{overall.summary.avg_gpa}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Average Marks</p>
                  <p className="text-2xl font-bold text-amber-600">{overall.summary.avg_marks}</p>
                </div>
              </div>

              {/* Top 5 Toppers */}
              {overall.summary.toppers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                    <Trophy size={18} className="text-amber-500" /> Top 5 Students
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {overall.summary.toppers.map((t, i) => (
                      <div key={t.student_id} className={`p-3 rounded-xl border text-center ${i === 0 ? "border-amber-300 bg-amber-50" : i === 1 ? "border-slate-300 bg-slate-50" : i === 2 ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}>
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-indigo-400"}`}>
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold text-slate-800">{t.student_name}</p>
                        <p className="text-xs text-slate-500">{t.student_code}</p>
                        <p className="text-lg font-bold text-indigo-600 mt-1">{t.gpa.toFixed(2)}</p>
                        <p className="text-xs text-slate-400">Avg: {t.average}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class-wise Results */}
              <div className="space-y-3">
                {overall.classes.map((cls) => (
                  <div key={cls.class_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedClass(expandedClass === cls.class_id ? null : cls.class_id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-800">{cls.class_name}</span>
                        <span className="text-xs text-slate-500">{cls.total_students} students</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-bold text-green-600">{cls.pass_rate}%</p>
                          <p className="text-[10px] text-slate-400">Pass Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-indigo-600">{cls.avg_gpa}</p>
                          <p className="text-[10px] text-slate-400">Avg GPA</p>
                        </div>
                        {cls.topper && (
                          <div className="text-center">
                            <p className="text-sm font-bold text-amber-600">{cls.topper.gpa.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-400">Top GPA</p>
                          </div>
                        )}
                        <TrendingUp size={16} className="text-slate-400" />
                      </div>
                    </button>
                    {expandedClass === cls.class_id && (
                      <div className="border-t border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="text-left px-5 py-2 text-xs font-semibold text-slate-500">Student</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Total</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Average</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">GPA</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cls.students.map((s) => (
                              <tr key={s.student_id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-5 py-2 font-medium text-slate-800">{s.student_name}</td>
                                <td className="px-3 py-2 text-center text-slate-600">{s.student_code}</td>
                                <td className="px-3 py-2 text-center text-slate-700">{s.total}</td>
                                <td className="px-3 py-2 text-center text-slate-700">{s.average}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`font-bold ${s.gpa >= 4.0 ? "text-green-600" : s.gpa >= 3.0 ? "text-blue-600" : s.gpa >= 2.0 ? "text-amber-600" : "text-red-600"}`}>
                                    {s.gpa.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.result === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {s.result}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== STUDENTS TAB ===== */}
          {tab === "students" && (
            filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Award size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No results found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Student</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Code</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Average</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">GPA</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Result</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((r) => (
                        <>
                          <tr key={r.student_id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{r.student_name}</td>
                            <td className="px-4 py-3 text-slate-600">{r.student_code}</td>
                            <td className="px-4 py-3 text-center text-slate-700">{r.total}</td>
                            <td className="px-4 py-3 text-center text-slate-700">{r.average}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-bold ${r.gpa >= 4.0 ? "text-green-600" : r.gpa >= 3.0 ? "text-blue-600" : r.gpa >= 2.0 ? "text-amber-600" : "text-red-600"}`}>
                                {r.gpa.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.result === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {r.result}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setExpandedStudent(expandedStudent === r.student_id ? null : r.student_id)}
                                className="px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              >
                                {expandedStudent === r.student_id ? "Hide" : "View"}
                              </button>
                            </td>
                          </tr>
                          {expandedStudent === r.student_id && (
                            <tr key={`${r.student_id}-detail`}>
                              <td colSpan={7} className="px-4 py-3 bg-slate-50">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr>
                                      <th className="text-left px-3 py-1 text-slate-500">Subject</th>
                                      <th className="text-center px-3 py-1 text-slate-500">Marks</th>
                                      <th className="text-center px-3 py-1 text-slate-500">Grade</th>
                                      <th className="text-center px-3 py-1 text-slate-500">GPA</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {r.rows.map((row, i) => (
                                      <tr key={i} className="border-t border-slate-200">
                                        <td className="px-3 py-1.5 font-medium text-slate-700">{row.subject}</td>
                                        <td className="px-3 py-1.5 text-center text-slate-600">{row.marks}</td>
                                        <td className="px-3 py-1.5 text-center">
                                          <span className={`px-2 py-0.5 rounded-full font-medium ${row.marks >= 80 ? "bg-green-100 text-green-700" : row.marks >= 50 ? "bg-blue-100 text-blue-700" : row.marks >= 33 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                            {row.grade}
                                          </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-center text-slate-600">{row.gpa.toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
