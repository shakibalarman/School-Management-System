import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Loader2, Bell, Trash2, FileText } from "lucide-react";
import { listNotices, createNotice, deleteNotice, type Notice } from "../services/notices";
import { useAuth } from "../auth/AuthContext";

export function NoticesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "head_teacher";
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", target_role: "all" });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: listNotices,
  });

  const createMut = useMutation({
    mutationFn: createNotice,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notices"] }); setShowModal(false); setForm({ title: "", content: "", target_role: "all" }); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notices"] }); setDeleteId(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notices</h1>
          <p className="text-sm text-slate-500 mt-1">Post announcements for students and staff</p>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> New Notice
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Bell size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n: Notice) => (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 mb-1">{n.title}</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full capitalize">{n.target_role}</span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Published</span>
                      <span className="text-xs text-slate-400">{n.created_at ? new Date(n.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</span>
                    </div>
                  </div>
                </div>
        {canManage && (
                  <button onClick={() => setDeleteId(n.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 ml-3"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold">New Notice</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Audience</label>
                <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">
                  <option value="all">Everyone</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.content || createMut.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {createMut.isPending && <Loader2 size={14} className="animate-spin" />} Post
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Notice</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this notice?</p>
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
