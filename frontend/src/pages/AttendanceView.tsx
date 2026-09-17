import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { listClasses, listSections } from "../services/classes";
import { listAttendance, updateAttendance } from "../services/attendance";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-yellow-100 text-yellow-700",
  excused: "bg-blue-100 text-blue-700",
};

const ALL_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface AttendanceRow {
  id: string;
  student_id: string;
  class_id: string;
  section_id: string | null;
  date: string;
  status: AttendanceStatus;
  marked_by: string | null;
  created_at: string;
  student?: { first_name: string; last_name: string; student_code: string } | null;
  class?: { name: string } | null;
  section?: { name: string } | null;
}

export function AttendanceViewPage() {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayString());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: listClasses,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections", classId],
    queryFn: () => listSections(classId),
    enabled: !!classId,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance", classId, sectionId, date],
    queryFn: () =>
      listAttendance({
        class_id: classId || undefined,
        section_id: sectionId || undefined,
        date: date || undefined,
        limit: 500,
      }),
    enabled: true,
  });

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    excused: records.filter((r) => r.status === "excused").length,
  };

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateAttendance(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setFeedback({ type: "success", message: "Attendance updated successfully." });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Failed to update attendance." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  function handleStatusChange(id: string, newStatus: AttendanceStatus) {
    setOpenDropdown(null);
    mutation.mutate({ id, status: newStatus });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage attendance records across all classes.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId("");
            }}
            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!classId}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Records</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-slate-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-slate-500 mt-1">Absent</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-slate-500 mt-1">Late</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
          <p className="text-xs text-slate-500 mt-1">Excused</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody>
                {(records as AttendanceRow[]).map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {record.student?.first_name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-800">
                            {record.student?.first_name ?? "Unknown"} {record.student?.last_name ?? ""}
                          </span>
                          {record.student?.student_code && (
                            <p className="text-xs text-slate-500">{record.student.student_code}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{record.class?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{record.section?.name ?? "—"}</td>
                    <td className="px-4 py-3 relative">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === record.id ? null : record.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${STATUS_STYLES[record.status]}`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          <ChevronDown size={12} />
                        </button>
                        {openDropdown === record.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute left-0 mt-1 z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                              {ALL_STATUSES.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(record.id, status)}
                                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                                    record.status === status ? "text-indigo-600 bg-indigo-50" : "text-slate-700"
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].split(" ")[0]}`} />
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{record.marked_by ?? "—"}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">No attendance records found for the selected filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
