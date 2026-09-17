import { api } from "../lib/api";
import type { SchoolClass, Section } from "../types";

export async function listClasses(): Promise<SchoolClass[]> {
  const { data } = await api.get("/academic/classes");
  return data;
}

export async function createSchoolClass(cls: {
  name: string;
  academic_year_id: string;
}): Promise<{ id: string; name: string }> {
  const { data } = await api.post("/academic/classes", cls);
  return data;
}

export async function listSections(classId?: string): Promise<Section[]> {
  const params = classId ? { class_id: classId } : {};
  const { data } = await api.get("/academic/sections", { params });
  return data;
}

export async function createSection(section: {
  name: string;
  class_id: string;
  capacity?: number;
}): Promise<{ id: string; name: string }> {
  const { data } = await api.post("/academic/sections", section);
  return data;
}
