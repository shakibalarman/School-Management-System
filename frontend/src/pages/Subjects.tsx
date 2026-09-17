import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { listSubjects, createSubject, deleteSubject } from "../services/subjects";
import type { Subject } from "../types";

const subjectSchema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  description: z.string().optional().or(z.literal("")),
});

type SubjectForm = z.infer<typeof subjectSchema>;

export function SubjectsPage() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: listSubjects,
  });

  const createMut = useMutation({
    mutationFn: createSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); setConfirmDelete(null); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
  });

  function onSubmit(values: SubjectForm) {
    createMut.mutate(values as Parameters<typeof createSubject>[0]);
    reset({ name: "", code: "", description: "" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
        <p className="text-sm text-slate-500 mt-1">Manage subjects and curriculum</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Subject</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input {...register("name")} placeholder="e.g. Mathematics" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
            <input {...register("code")} placeholder="e.g. MATH" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <input {...register("description")} placeholder="Optional description" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects?.map((s: Subject) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-mono bg-slate-100 text-slate-700 rounded">{s.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDelete === s.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button onClick={() => deleteMut.mutate(s.id)} className="text-xs text-red-600 font-medium hover:underline">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-500 hover:underline">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {subjects?.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No subjects found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
