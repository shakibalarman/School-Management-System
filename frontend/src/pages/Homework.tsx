import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2, BookOpenCheck, Trash2 } from "lucide-react";
import { listHomework, createHomework, deleteHomework, type Homework } from "../services/homework";
import { listClasses } from "../services/classes";
import { listClassSubjects } from "../services/subjects";
import type { SchoolClass, Subject } from "../types";

export function HomeworkPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ title: "", description: "", class_id: "", subject_id: "", due_date: "" });

  const { data: homework = [], isLoading } = useQuery({
    queryKey: ["homework", filterClass],
    queryFn: () => listHomework(filterClass || undefined),
  });

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const { data: formSubjects = [] } = useQuery({
    queryKey: ["class-subjects-form", form.class_id],
    queryFn: () => listClassSubjects(form.class_id),
    enabled: !!form.class_id,
  });

  const createMut = useMutation({
    mutationFn: createHomework,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); setShowModal(false); setForm({ title: "", description: "", class_id: "", subject_id: "", due_date: "" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteHomework,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homework"] }); setDeleteId(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Homework</h1>
          <p className="text-sm text-slate-500 mt-1">Assignments for students</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      <div className="mb-4">
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-3 py-2 text-sm border rounded-lg">
          <option value="">All Classes</option>
          {classes.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
      ) : homework.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpenCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No homework assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homework.map((hw: Homework) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800">{hw.title}</h3>
                <button onClick={() => setDeleteId(hw.id)} className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
              {hw.description && <p className="text-xs text-slate-600 mb-3 line-clamp-2">{hw.description}</p>}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">{hw.class_name}</span>
                {hw.subject_name && <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">{hw.subject_name}</span>}
                {hw.due_date && <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">Due: {new Date(hw.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">New Assignment</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Class *</label>
                  <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, subject_id: "" })} className="w-full px-3 py-2 text-sm border rounded-lg">
                    <option value="">Select class</option>
                    {classes.map((c: SchoolClass) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                  <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">
                    <option value="">Select subject</option>
                    {formSubjects.map((s: Subject) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.class_id || createMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Assignment</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this assignment?</p>
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
