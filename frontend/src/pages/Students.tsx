import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Search, X, Loader2 } from "lucide-react";
import { listStudents, createStudent, updateStudent } from "../services/students";
import { listClasses, listSections } from "../services/classes";
import type { Student, SchoolClass, Section } from "../types";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const studentSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  blood_group: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  admission_date: z.string().optional().or(z.literal("")),
  class_id: z.string().optional().or(z.literal("")),
  section_id: z.string().optional().or(z.literal("")),
  roll_number: z.number().int().positive().optional(),
  create_login: z.boolean().optional(),
  password: z.string().optional().or(z.literal("")),
});

type StudentForm = z.infer<typeof studentSchema>;

export function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [skip, setSkip] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const limit = 20;

  const { data: students, isLoading } = useQuery({
    queryKey: ["students", search, filterClass, filterSection, filterStatus, skip],
    queryFn: () => listStudents({ q: search || undefined, class_id: filterClass || undefined, section_id: filterSection || undefined, status: filterStatus || undefined, skip, limit }),
  });

  const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const { data: sections } = useQuery({
    queryKey: ["sections", filterClass],
    queryFn: () => listSections(filterClass || undefined),
  });

  const createMut = useMutation({
    mutationFn: createStudent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); setShowModal(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentForm> }) => updateStudent(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); setShowModal(false); setEditStudent(null); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  function openCreate() {
    setEditStudent(null);
    reset({ first_name: "", last_name: "", email: "", phone: "", date_of_birth: "", gender: "", blood_group: "", nationality: "", religion: "", address: "", admission_date: "", class_id: "", section_id: "", roll_number: undefined, create_login: false, password: "" });
    setShowModal(true);
  }

  function openEdit(s: Student) {
    setEditStudent(s);
    reset({
      first_name: s.first_name, last_name: s.last_name, email: s.email ?? "", phone: s.phone ?? "",
      date_of_birth: s.date_of_birth ?? "", gender: s.gender ?? "", blood_group: s.blood_group ?? "",
      nationality: s.nationality ?? "", religion: s.religion ?? "", address: s.address ?? "",
      admission_date: s.admission_date ?? "", class_id: s.class_id ?? "", section_id: s.section_id ?? "",
      roll_number: s.roll_number ?? undefined,
    });
    setShowModal(true);
  }

  function onSubmit(values: StudentForm) {
    const payload: Record<string, string | number | boolean | undefined> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== "" && v !== undefined && v !== null && !(typeof v === "number" && isNaN(v))) payload[k] = v;
    }
    if (editStudent) {
      updateMut.mutate({ id: editStudent.id, data: payload as unknown as Partial<StudentForm> });
    } else {
      createMut.mutate(payload as unknown as Parameters<typeof createStudent>[0]);
    }
  }

  function getClassName(id: string | null) {
    if (!id) return "-";
    return classes?.find((c: SchoolClass) => c.id === id)?.name ?? "-";
  }

  function getSectionName(id: string | null) {
    if (!id) return "-";
    return sections?.find((s: Section) => s.id === id)?.name ?? "-";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage student accounts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setSkip(0); }} placeholder="Search by name, email, code..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection(""); setSkip(0); }} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="">All Classes</option>
            {classes?.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSection} onChange={(e) => { setFilterSection(e.target.value); setSkip(0); }} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="">All Sections</option>
            {sections?.map((s: Section) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setSkip(0); }} className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Student</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Section</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Login</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s: Student) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{s.first_name.charAt(0)}</div>
                      <span className="text-sm font-medium text-slate-800">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.student_code}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{getClassName(s.class_id)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{getSectionName(s.section_id)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.phone ?? "-"}</td>
                  <td className="px-4 py-3">
                    {s.user_id ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></button>
                  </td>
                </tr>
              ))}
              {students?.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">No students found.</td></tr>}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
          <span className="text-sm text-slate-600">Showing {skip + 1} - {skip + (students?.length ?? 0)}</span>
          <button onClick={() => setSkip(skip + limit)} disabled={(students?.length ?? 0) < limit} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">{editStudent ? "Edit Student" : "Add Student"}</h3>
              <button onClick={() => { setShowModal(false); setEditStudent(null); }} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input {...register("email")} type="email" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Admission Date</label>
                <input {...register("admission_date")} type="date" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Class</label>
                <select {...register("class_id")} className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option value="">Select</option>
                  {classes?.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Section</label>
                <select {...register("section_id")} className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option value="">Select</option>
                  {sections?.map((s: Section) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Roll Number</label>
                <input {...register("roll_number", { valueAsNumber: true })} type="number" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <textarea {...register("address")} rows={2} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {!editStudent && (
                <div className="col-span-2 border-t border-slate-200 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      {...register("create_login")}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Create login account for this student</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email (as username)</label>
                      <input {...register("email")} type="email" placeholder="student@school.com" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                      <input {...register("password")} type="password" placeholder="Min 8 characters" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              )}
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditStudent(null); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {(createMut.isPending || updateMut.isPending) && <Loader2 size={14} className="animate-spin" />}
                  {editStudent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
