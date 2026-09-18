import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Clock, Edit2 } from "lucide-react";
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/schedule";
import { listTeachers } from "../services/teachers";
import { listClasses, listSections } from "../services/classes";
import { listSubjects } from "../services/subjects";
import type { ScheduleEntry, DayOfWeek, Teacher, SchoolClass, Section, Subject } from "../types";

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const scheduleSchema = z.object({
  teacher_id: z.string().min(1, "Select a teacher"),
  class_id: z.string().min(1, "Select a class"),
  section_id: z.string().optional().or(z.literal("")),
  subject_id: z.string().min(1, "Select a subject"),
  day_of_week: z.string().min(1, "Select a day"),
  period_number: z.string().min(1, "Required"),
  start_time: z.string().min(1, "Required"),
  end_time: z.string().min(1, "Required"),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

const DAY_COLORS: Record<string, string> = {
  saturday: "bg-blue-100 text-blue-700",
  sunday: "bg-green-100 text-green-700",
  monday: "bg-purple-100 text-purple-700",
  tuesday: "bg-orange-100 text-orange-700",
  wednesday: "bg-pink-100 text-pink-700",
  thursday: "bg-teal-100 text-teal-700",
  friday: "bg-red-100 text-red-700",
};

export function SchedulePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScheduleEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterDay, setFilterDay] = useState<DayOfWeek | "">("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema) as any,
    defaultValues: {
      period_number: "1",
      day_of_week: "",
    },
  });

  const watchClassId = watch("class_id");

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => listTeachers({ limit: 200 }),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: listClasses,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: listSubjects,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections", watchClassId],
    queryFn: () => listSections(watchClassId || undefined),
    enabled: !!watchClassId,
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", filterTeacher, filterClass, filterDay],
    queryFn: () =>
      listSchedules({
        teacher_id: filterTeacher || undefined,
        class_id: filterClass || undefined,
        day: (filterDay as DayOfWeek) || undefined,
      }),
  });

  type SchedulePayload = {
    teacher_id: string;
    class_id: string;
    section_id: string | null;
    subject_id: string;
    day_of_week: DayOfWeek;
    period_number: number;
    start_time: string;
    end_time: string;
  };

  const createMut = useMutation({
    mutationFn: (values: SchedulePayload) =>
      createSchedule(values.teacher_id, {
        class_id: values.class_id,
        section_id: values.section_id,
        subject_id: values.subject_id,
        day_of_week: values.day_of_week,
        period_number: values.period_number,
        start_time: values.start_time,
        end_time: values.end_time,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      setShowForm(false);
      reset();
    },
  });

  const updateMut = useMutation({
    mutationFn: (values: SchedulePayload & { id: string }) =>
      updateSchedule(values.id, {
        class_id: values.class_id,
        section_id: values.section_id,
        subject_id: values.subject_id,
        day_of_week: values.day_of_week,
        period_number: values.period_number,
        start_time: values.start_time,
        end_time: values.end_time,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      setEditing(null);
      setShowForm(false);
      reset();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      setConfirmDelete(null);
    },
  });

  function formatTime(t: string): string {
    return t.length === 5 ? `${t}:00` : t;
  }

  function onSubmit(values: ScheduleForm) {
    const period = parseInt(values.period_number, 10);
    if (isNaN(period) || period < 1 || period > 20) {
      return;
    }
    const payload = {
      teacher_id: values.teacher_id,
      class_id: values.class_id,
      section_id: values.section_id || null,
      subject_id: values.subject_id,
      day_of_week: values.day_of_week as DayOfWeek,
      period_number: period,
      start_time: formatTime(values.start_time),
      end_time: formatTime(values.end_time),
    };
    if (editing) {
      updateMut.mutate({ ...payload, id: editing.id });
    } else {
      createMut.mutate(payload);
    }
  }

  function openCreate() {
    setEditing(null);
    reset({
      teacher_id: "",
      class_id: "",
      section_id: "",
      subject_id: "",
      day_of_week: "",
      period_number: "1",
      start_time: "",
      end_time: "",
    });
    setShowForm(true);
  }

  function openEdit(entry: ScheduleEntry) {
    setEditing(entry);
    reset({
      teacher_id: entry.teacher_id,
      class_id: entry.class_id,
      section_id: entry.section_id || "",
      subject_id: entry.subject_id,
      day_of_week: entry.day_of_week,
      period_number: String(entry.period_number),
      start_time: entry.start_time.slice(0, 5),
      end_time: entry.end_time.slice(0, 5),
    });
    setShowForm(true);
  }

  function getTeacherName(id: string) {
    const t = teachers.find((t: Teacher) => t.id === id);
    return t ? `${t.first_name} ${t.last_name}` : id;
  }

  function getClassName(id: string) {
    const c = classes.find((c: SchoolClass) => c.id === id);
    return c?.name || id;
  }

  function getSubjectName(id: string) {
    const s = subjects.find((s: Subject) => s.id === id);
    return s?.name || id;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Routine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign teachers to classes, subjects, and time slots
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={14} /> Add Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Teacher</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Teachers</option>
              {teachers.map((t: Teacher) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map((c: SchoolClass) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Day</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value as DayOfWeek | "")}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Days</option>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Day</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Period</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Teacher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules?.map((entry: ScheduleEntry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${DAY_COLORS[entry.day_of_week] || "bg-slate-100 text-slate-700"}`}>
                      {entry.day_of_week.charAt(0).toUpperCase() + entry.day_of_week.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">P{entry.period_number}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">{getTeacherName(entry.teacher_id)}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {getClassName(entry.class_id)}
                    {entry.section && ` - ${entry.section.name}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">{getSubjectName(entry.subject_id)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      {confirmDelete === entry.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteMut.mutate(entry.id)}
                            className="text-xs text-red-600 font-medium hover:underline"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs text-slate-500 hover:underline"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(entry.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {schedules?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No schedule entries found. Click "Add Schedule" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {editing ? "Edit Schedule Entry" : "Add Schedule Entry"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Teacher *</label>
                  <select
                    {...register("teacher_id")}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t: Teacher) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.teacher_id && <p className="text-red-500 text-xs mt-1">{errors.teacher_id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Class *</label>
                    <select
                      {...register("class_id")}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c: SchoolClass) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Section</label>
                    <select
                      {...register("section_id")}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No Section</option>
                      {sections.map((s: Section) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Subject *</label>
                  <select
                    {...register("subject_id")}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s: Subject) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                  {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Day *</label>
                    <select
                      {...register("day_of_week")}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Day</option>
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {errors.day_of_week && <p className="text-red-500 text-xs mt-1">{errors.day_of_week.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Period *</label>
                    <input
                      type="number"
                      {...register("period_number")}
                      min={1}
                      max={20}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.period_number && <p className="text-red-500 text-xs mt-1">{errors.period_number.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Time *</label>
                    <input
                      type="time"
                      {...register("start_time")}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Time *</label>
                    <input
                      type="time"
                      {...register("end_time")}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditing(null); }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMut.isPending || updateMut.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createMut.isPending || updateMut.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    {editing ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
