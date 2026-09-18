import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2, Calendar, Trash2, CheckCircle2 } from "lucide-react";
import { listAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear, type AcademicYear } from "../services/academicYears";

export function AcademicYearsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });

  const { data: years = [], isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: listAcademicYears,
  });

  const createMut = useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["academic-years"] }); setShowModal(false); setForm({ name: "", start_date: "", end_date: "" }); },
  });

  const setCurrentMut = useMutation({
    mutationFn: ({ id }: { id: string }) => updateAcademicYear(id, { is_current: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic-years"] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAcademicYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["academic-years"] }); setDeleteId(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Years</h1>
          <p className="text-sm text-slate-500 mt-1">Manage academic sessions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Year
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
      ) : years.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No academic years created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {years.map((y: AcademicYear) => (
            <div key={y.id} className={`bg-white rounded-2xl border-2 p-5 transition-colors ${y.is_current ? "border-indigo-500" : "border-slate-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{y.name}</h3>
                  {y.is_current && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full mt-1">
                      <CheckCircle2 size={12} /> Current
                    </span>
                  )}
                </div>
                <button onClick={() => setDeleteId(y.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>Start: {new Date(y.start_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p>End: {new Date(y.end_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {!y.is_current && (
                <button onClick={() => setCurrentMut.mutate({ id: y.id })} disabled={setCurrentMut.isPending} className="mt-3 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Set as Current
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">Add Academic Year</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Year Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2026" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date *</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.name || !form.start_date || !form.end_date || createMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {createMut.isPending && <Loader2 size={14} className="animate-spin" />} Create
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Academic Year</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure? This may affect classes linked to this year.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMut.isPending ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
