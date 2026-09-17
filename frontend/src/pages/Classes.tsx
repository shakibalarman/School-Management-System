import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronDown, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { listClasses, createSchoolClass, listSections, createSection } from "../services/classes";
import type { SchoolClass, Section } from "../types";

const classSchema = z.object({ name: z.string().min(1, "Required") });
type ClassForm = z.infer<typeof classSchema>;

const sectionSchema = z.object({ name: z.string().min(1, "Required"), capacity: z.number().int().positive().optional() });
type SectionForm = z.infer<typeof sectionSchema>;

export function ClassesPage() {
  const qc = useQueryClient();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [addSectionTo, setAddSectionTo] = useState<string | null>(null);

  const { data: classes, isLoading } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const { data: allSections } = useQuery({ queryKey: ["sections"], queryFn: () => listSections() });

  const createClassMut = useMutation({
    mutationFn: (data: { name: string }) => {
      const yearId = classes?.[0]?.academic_year_id;
      if (!yearId) throw new Error("No academic year");
      return createSchoolClass({ ...data, academic_year_id: yearId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });

  const createSectionMut = useMutation({
    mutationFn: createSection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sections"] }); setAddSectionTo(null); },
  });

  const classForm = useForm<ClassForm>({ resolver: zodResolver(classSchema) });
  const sectionForm = useForm<SectionForm>({ resolver: zodResolver(sectionSchema) });

  function getSectionsForClass(classId: string): Section[] {
    return allSections?.filter((s: Section) => s.class_id === classId) ?? [];
  }

  function onAddClass(values: ClassForm) {
    createClassMut.mutate(values);
    classForm.reset({ name: "" });
  }

  function onAddSection(classId: string, values: SectionForm) {
    createSectionMut.mutate({ ...values, class_id: classId });
    sectionForm.reset({ name: "", capacity: undefined });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Classes & Sections</h1>
        <p className="text-sm text-slate-500 mt-1">Manage class structure and sections</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Class</h3>
        <form onSubmit={classForm.handleSubmit(onAddClass)} className="flex gap-3 items-end">
          <div className="flex-1 max-w-sm">
            <label className="block text-xs font-medium text-slate-600 mb-1">Class Name *</label>
            <input {...classForm.register("name")} placeholder="e.g. Class 11" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {classForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{classForm.formState.errors.name.message}</p>}
          </div>
          <button type="submit" disabled={createClassMut.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {createClassMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Class
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : (
          classes?.map((cls: SchoolClass) => {
            const sections = getSectionsForClass(cls.id);
            const isExpanded = expandedClass === cls.id;
            return (
              <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  <BookOpen size={18} className="text-indigo-500" />
                  <span className="font-medium text-slate-800">{cls.name}</span>
                  <span className="text-xs text-slate-500 ml-1">({sections.length} sections)</span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100">
                    <div className="mt-3 space-y-2">
                      {sections.map((sec: Section) => (
                        <div key={sec.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-700">Section {sec.name}</span>
                          {sec.capacity && <span className="text-xs text-slate-500">Capacity: {sec.capacity}</span>}
                        </div>
                      ))}
                      {sections.length === 0 && <p className="text-sm text-slate-500 px-3 py-2">No sections yet.</p>}
                    </div>
                    {addSectionTo === cls.id ? (
                      <form onSubmit={sectionForm.handleSubmit((v) => onAddSection(cls.id, v))} className="mt-3 flex gap-2 items-end">
                        <div className="w-24">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                          <input {...sectionForm.register("name")} placeholder="A" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="w-28">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Capacity</label>
                          <input {...sectionForm.register("capacity", { valueAsNumber: true })} type="number" placeholder="40" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Add</button>
                        <button type="button" onClick={() => setAddSectionTo(null)} className="px-3 py-2 text-sm border rounded-lg hover:bg-slate-50">Cancel</button>
                      </form>
                    ) : (
                      <button onClick={() => setAddSectionTo(cls.id)} className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <Plus size={14} /> Add Section
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
