import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, CheckCircle, AlertCircle } from "lucide-react";
import { listClasses, listSections } from "../services/classes";
import { listStudents } from "../services/students";
import { takeAttendance } from "../services/attendance";

const schema = z.object({
  class_id: z.string().min(1, "Class is required"),
  section_id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type Form = z.infer<typeof schema>;

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "present", label: "Present", color: "bg-green-100 text-green-700 border-green-300 checked:bg-green-600 checked:border-green-600" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-700 border-red-300 checked:bg-red-600 checked:border-red-600" },
  { value: "late", label: "Late", color: "bg-yellow-100 text-yellow-700 border-yellow-300 checked:bg-yellow-600 checked:border-yellow-600" },
  { value: "excused", label: "Excused", color: "bg-blue-100 text-blue-700 border-blue-300 checked:bg-blue-600 checked:border-blue-600" },
];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TakeAttendancePage() {
  const queryClient = useQueryClient();
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { register, handleSubmit, watch, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { date: todayString(), class_id: "", section_id: "" },
  });

  const selectedClassId = watch("class_id");
  const selectedSectionId = watch("section_id");
  const selectedDate = watch("date");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: listClasses,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections", selectedClassId],
    queryFn: () => listSections(selectedClassId),
    enabled: !!selectedClassId,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selectedClassId, selectedSectionId],
    queryFn: () =>
      listStudents({
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        limit: 200,
      }),
    enabled: !!selectedClassId,
  });

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => (a.roll_number ?? 0) - (b.roll_number ?? 0)),
    [students]
  );

  const mutation = useMutation({
    mutationFn: takeAttendance,
    onSuccess: (result) => {
      setFeedback({ type: "success", message: `Attendance recorded for ${result.count} student${result.count !== 1 ? "s" : ""}.` });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Failed to submit attendance. Please try again." });
      setTimeout(() => setFeedback(null), 5000);
    },
  });

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  }

  function onSubmit(_values: Form) {
    if (students.length === 0) return;
    setFeedback(null);
    const records = students.map((s) => ({
      student_id: s.id,
      status: attendanceMap[s.id] ?? "present",
    }));
    mutation.mutate({
      class_id: selectedClassId,
      section_id: selectedSectionId || undefined,
      date: selectedDate,
      records,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Take Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">Mark attendance for students by class and section.</p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
            <select
              {...register("class_id")}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formState.errors.class_id && (
              <p className="text-red-500 text-xs mt-1">{formState.errors.class_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
            <select
              {...register("section_id")}
              disabled={!selectedClassId}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            {formState.errors.date && (
              <p className="text-red-500 text-xs mt-1">{formState.errors.date.message}</p>
            )}
          </div>
        </div>
      </form>

      {selectedClassId && studentsLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedClassId && !studentsLoading && students.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No students found for the selected class and section.</p>
        </div>
      )}

      {sortedStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {sortedStudents.length} student{sortedStudents.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-500">Default: Present</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Code
                  </th>
                  {STATUS_OPTIONS.map((opt) => (
                    <th
                      key={opt.value}
                      className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      {opt.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, idx) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500">{student.roll_number ?? idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.first_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{student.student_code}</td>
                    {STATUS_OPTIONS.map((opt) => (
                      <td key={opt.value} className="px-4 py-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            checked={(attendanceMap[student.id] ?? "present") === opt.value}
                            onChange={() => handleStatusChange(student.id, opt.value)}
                            className="sr-only"
                          />
                          <span
                            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                              (attendanceMap[student.id] ?? "present") === opt.value
                                ? opt.color
                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {opt.value === "present" && "P"}
                            {opt.value === "absent" && "A"}
                            {opt.value === "late" && "L"}
                            {opt.value === "excused" && "E"}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Attendance"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
