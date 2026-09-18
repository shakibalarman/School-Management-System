import { api } from "../lib/api";
import type { Subject } from "../types";

export async function listSubjects(): Promise<Subject[]> {
  const { data } = await api.get("/academic/subjects");
  return data;
}

export async function listClassSubjects(classId: string): Promise<Subject[]> {
  const { data } = await api.get(`/academic/classes/${classId}/subjects`);
  return data;
}

export async function createSubject(subject: {
  name: string;
  code: string;
  description?: string;
}): Promise<{ id: string; name: string; code: string }> {
  const { data } = await api.post("/academic/subjects", subject);
  return data;
}

export async function deleteSubject(id: string): Promise<void> {
  await api.delete(`/academic/subjects/${id}`);
}
