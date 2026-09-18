import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, X, Loader2, UserCheck, UserX, Trash2, BookOpen, Users } from "lucide-react";
import {
  listTeachers,
  createTeacher,
  deactivateTeacher,
  activateTeacher,
  deleteTeacher,
  getTeacherClasses,
  getTeacherSubjects,
} from "../services/teachers";
import type { Teacher } from "../types";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const teacherSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  blood_group: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  joining_date: z.string().optional().or(z.literal("")),
  create_login: z.boolean(),
  login_role: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});

type TeacherForm = z.infer<typeof teacherSchema>;

export function TeachersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["teachers", skip],
    queryFn: () => listTeachers({ skip, limit }),
  });

  const { data: teacherClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["teacher-classes", selectedTeacher?.id],
    queryFn: () => getTeacherClasses(selectedTeacher!.id),
    enabled: !!selectedTeacher,
  });

  const { data: teacherSubjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["teacher-subjects", selectedTeacher?.id],
    queryFn: () => getTeacherSubjects(selectedTeacher!.id),
    enabled: !!selectedTeacher,
  });

  const createMut = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); setShowModal(false); },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const activateMut = useMutation({
    mutationFn: activateTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); setDeleteConfirmId(null); },
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { create_login: false },
  });

  const createLogin = watch("create_login");

  function openCreate() {
    reset({ first_name: "", last_name: "", email: "", phone: "", date_of_birth: "", gender: "", blood_group: "", nationality: "", religion: "", department: "", designation: "", joining_date: "", create_login: false, login_role: "", password: "" });
    setShowModal(true);
  }

  function onSubmit(values: TeacherForm) {
    const payload: Record<string, string | boolean | undefined> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== "" && v !== undefined && v !== null) payload[k] = v;
    }
    createMut.mutate(payload as Parameters<typeof createTeacher>[0]);
  }

  const filtered = teachers?.filter((t: Teacher) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.first_name.toLowerCase().includes(q) || t.last_name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.teacher_code.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage teacher accounts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teachers..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Teacher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Designation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((t: Teacher) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedTeacher(t)}
                      className="flex items-center gap-3 hover:bg-slate-50 rounded-lg -mx-2 px-2 py-1 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">{t.first_name.charAt(0)}</div>
                      <span className="text-sm font-medium text-slate-800 hover:text-indigo-600">{t.first_name} {t.last_name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{t.teacher_code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{t.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{t.department ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{t.designation ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {t.status === "active" ? (
                        <button onClick={() => deactivateMut.mutate(t.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate"><UserX size={14} /></button>
                      ) : (
                        <button onClick={() => activateMut.mutate(t.id)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Activate"><UserCheck size={14} /></button>
                      )}
                      <button onClick={() => setDeleteConfirmId(t.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No teachers found.</td></tr>}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-600">Showing {skip + 1} - {skip + (filtered?.length ?? 0)}</span>
          <button onClick={() => setSkip(skip + limit)} disabled={(filtered?.length ?? 0) < limit} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-slate-800">Teacher Details</h3>
              <button onClick={() => setSelectedTeacher(null)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedTeacher.first_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{selectedTeacher.first_name} {selectedTeacher.last_name}</h4>
                  <p className="text-sm text-slate-500">{selectedTeacher.teacher_code} &middot; {selectedTeacher.email}</p>
                  {selectedTeacher.department && <p className="text-sm text-slate-500">{selectedTeacher.department}{selectedTeacher.designation ? ` - ${selectedTeacher.designation}` : ""}</p>}
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="mb-6">
                <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                  <Users size={16} className="text-indigo-500" /> Assigned Classes
                </h5>
                {loadingClasses ? (
                  <Loader2 className="animate-spin text-indigo-500" size={16} />
                ) : teacherClasses.length === 0 ? (
                  <p className="text-sm text-slate-400">No classes assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {teacherClasses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-800">{c.school_class.name}</span>
                        {c.section && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">{c.section.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Subjects */}
              <div>
                <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                  <BookOpen size={16} className="text-purple-500" /> Assigned Subjects
                </h5>
                {loadingSubjects ? (
                  <Loader2 className="animate-spin text-indigo-500" size={16} />
                ) : teacherSubjects.length === 0 ? (
                  <p className="text-sm text-slate-400">No subjects assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {teacherSubjects.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-800">{s.subject.name}</span>
                        <span className="px-2 py-0.5 text-xs font-mono bg-purple-100 text-purple-700 rounded">{s.subject.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">Add Teacher</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">First Name *</label>
                <input {...register("first_name")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last Name *</label>
                <input {...register("last_name")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                <input {...register("email")} type="email" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input {...register("phone")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                <input {...register("date_of_birth")} type="date" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select {...register("gender")} className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Blood Group</label>
                <select {...register("blood_group")} className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nationality</label>
                <input {...register("nationality")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Religion</label>
                <input {...register("religion")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <input {...register("department")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                <input {...register("designation")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Joining Date</label>
                <input {...register("joining_date")} type="date" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("create_login")} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">Create login account for this teacher</span>
                </label>
              </div>
              {createLogin && (
                <>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Login Role</label>
                    <select {...register("login_role")} className="w-full px-3 py-2 text-sm border rounded-lg">
                      <option value="teacher">Teacher</option>
                      <option value="head_teacher">Head Teacher</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
                    <input {...register("password")} type="password" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </>
              )}
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {createMut.isPending && <Loader2 size={14} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Teacher</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this teacher? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteConfirmId)} disabled={deleteMut.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {deleteMut.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
