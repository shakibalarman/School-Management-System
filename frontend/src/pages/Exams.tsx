import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2, FileText, ClipboardCheck, BarChart3 } from "lucide-react";
import { listExams, createExam, enterMarks, getStudentResult, type Exam } from "../services/exams";
import { listStudents } from "../services/students";
import { listClassSubjects } from "../services/subjects";
import { listClasses } from "../services/classes";
import type { Student, Subject, SchoolClass } from "../types";

const EXAM_TYPES = [
  { value: "midterm", label: "Mid Term" },
  { value: "final", label: "Final" },
  { value: "class_test", label: "Class Test" },
  { value: "monthly_test", label: "Monthly Test" },
];

export function ExamsPage() {
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [examForm, setExamForm] = useState({ name: "", exam_type: "midterm", class_id: "", start_date: "", end_date: "", description: "" });
  const [marks, setMarks] = useState<Record<string, Record<string, string>>>({});

  const { data: exams = [], isLoading } = useQuery({ queryKey: ["exams"], queryFn: listExams });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const { data: allStudents = [] } = useQuery({ queryKey: ["students-all"], queryFn: () => listStudents({ limit: 200 }) });

  const { data: classSubjects = [] } = useQuery({
    queryKey: ["class-subjects", selectedClass],
    queryFn: () => listClassSubjects(selectedClass),
    enabled: !!selectedClass,
  });

  const classStudents = allStudents.filter((s: Student) =>
    selectedClass ? s.class_id === selectedClass && s.status === "active" : false
  );

  const createMut = useMutation({
    mutationFn: createExam,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); setShowCreateModal(false); setExamForm({ name: "", exam_type: "midterm", class_id: "", start_date: "", end_date: "", description: "" }); },
  });

  const marksMut = useMutation({
    mutationFn: ({ examId, entries }: { examId: string; entries: { student_id: string; subject_id: string; marks: number }[] }) =>
      enterMarks(examId, entries),
    onSuccess: () => { setShowMarksModal(null); setMarks({}); },
  });

  function handleCreateExam() {
    const payload: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(examForm)) {
      if (v !== "" && v !== undefined) payload[k] = v;
    }
    createMut.mutate(payload as Parameters<typeof createExam>[0]);
  }

  function handleEnterMarks() {
    if (!showMarksModal) return;
    const entries: { student_id: string; subject_id: string; marks: number }[] = [];
    for (const [studentId, studentMarks] of Object.entries(marks)) {
      for (const [subjectId, markStr] of Object.entries(studentMarks)) {
        const mark = parseFloat(markStr);
        if (!isNaN(mark) && mark >= 0 && mark <= 100) {
          entries.push({ student_id: studentId, subject_id: subjectId, marks: mark });
        }
      }
    }
    if (entries.length > 0) {
      marksMut.mutate({ examId: showMarksModal, entries });
    }
  }

  function openMarksEntry(examId: string) {
    const exam = exams.find((e: Exam) => e.id === examId);
    setSelectedClass(exam?.class_id ?? "");
    setMarks({});
    setShowMarksModal(examId);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exams</h1>
          <p className="text-sm text-slate-500 mt-1">Create exams and enter marks</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Create Exam
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No exams created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam: Exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{exam.name}</h3>
                  <p className="text-xs text-slate-500 capitalize mt-1">
                    {exam.exam_type.replace("_", " ")}
                    {exam.start_date && ` | ${new Date(exam.start_date).toLocaleDateString()}`}
                    {exam.end_date && ` - ${new Date(exam.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openMarksEntry(exam.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                    <ClipboardCheck size={14} /> Enter Marks
                  </button>
                  <button onClick={() => setShowResultModal(exam.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                    <BarChart3 size={14} /> Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">Create Exam</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Exam Name *</label>
                <input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} placeholder="e.g. Mid Term Examination 2026" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Exam Type</label>
                  <select value={examForm.exam_type} onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">
                    {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Class</label>
                  <select value={examForm.class_id} onChange={(e) => setExamForm({ ...examForm, class_id: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">
                    <option value="">All Classes</option>
                    {classes.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={examForm.start_date} onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input type="date" value={examForm.end_date} onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateExam} disabled={!examForm.name || createMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {createMut.isPending && <Loader2 size={14} className="animate-spin" />} Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showMarksModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">Enter Marks</h3>
              <button onClick={() => setShowMarksModal(null)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Select Class</label>
                <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setMarks({}); }} className="w-full max-w-xs px-3 py-2 text-sm border rounded-lg">
                  <option value="">Select a class</option>
                  {classes.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedClass && classStudents.length > 0 && classSubjects.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Student</th>
                        {classSubjects.map((s: Subject) => (
                          <th key={s.id} className="text-left px-3 py-2 text-xs font-semibold text-slate-600">{s.code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student: Student) => (
                        <tr key={student.id} className="border-b border-slate-100">
                          <td className="px-3 py-2 text-sm font-medium text-slate-800">{student.first_name} {student.last_name}</td>
                          {classSubjects.map((subject: Subject) => (
                            <td key={subject.id} className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={marks[student.id]?.[subject.id] ?? ""}
                                onChange={(e) => setMarks({ ...marks, [student.id]: { ...marks[student.id], [subject.id]: e.target.value } })}
                                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedClass && classStudents.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No active students in this class.</p>
              )}
              {selectedClass && classStudents.length > 0 && classSubjects.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No subjects linked to this class. Go to Classes and link subjects first.</p>
              )}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowMarksModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleEnterMarks} disabled={marksMut.isPending} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {marksMut.isPending && <Loader2 size={14} className="animate-spin" />} Save Marks
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <ResultModal examId={showResultModal} classes={classes} students={allStudents} onClose={() => setShowResultModal(null)} />
      )}
    </div>
  );
}

function ResultModal({ examId, classes, students, onClose }: { examId: string; classes: SchoolClass[]; students: Student[]; onClose: () => void }) {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  const filtered = students.filter((s: Student) => classId ? s.class_id === classId : true);

  const { data: result, isLoading } = useQuery({
    queryKey: ["result", studentId, examId],
    queryFn: () => getStudentResult(studentId, examId),
    enabled: !!studentId,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold">Student Results</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Class</label>
              <select value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }} className="w-full px-3 py-2 text-sm border rounded-lg">
                <option value="">Select class</option>
                {classes.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg">
                <option value="">Select student</option>
                {filtered.map((s: Student) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
          </div>
          {isLoading && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>}
          {result && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                <div className="p-2 bg-white rounded-lg"><p className="text-xs text-slate-500">Total</p><p className="text-sm font-bold text-slate-800">{result.total}</p></div>
                <div className="p-2 bg-white rounded-lg"><p className="text-xs text-slate-500">Average</p><p className="text-sm font-bold text-slate-800">{result.average}</p></div>
                <div className="p-2 bg-white rounded-lg"><p className="text-xs text-slate-500">GPA</p><p className="text-sm font-bold text-slate-800">{result.gpa}</p></div>
                <div className="p-2 bg-white rounded-lg"><p className="text-xs text-slate-500">Result</p><p className={`text-sm font-bold ${result.result === "PASS" ? "text-green-600" : "text-red-600"}`}>{result.result}</p></div>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-slate-200"><th className="text-left text-xs font-semibold text-slate-600 py-1">Subject</th><th className="text-left text-xs font-semibold text-slate-600 py-1">Marks</th><th className="text-left text-xs font-semibold text-slate-600 py-1">Grade</th></tr></thead>
                <tbody>
                  {result.rows.map((r: { subject: string; marks: number; grade: string }, i: number) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 text-sm text-slate-800">{r.subject}</td>
                      <td className="py-1.5 text-sm text-slate-600">{r.marks}</td>
                      <td className="py-1.5"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${r.marks >= 50 ? "bg-green-100 text-green-700" : r.marks >= 33 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{r.grade}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {studentId && !isLoading && !result && (
            <p className="text-sm text-slate-500 text-center py-4">No results found for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
}
