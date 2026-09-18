import { api } from "../lib/api";

export interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

export async function listAcademicYears(): Promise<AcademicYear[]> {
  const { data } = await api.get("/academic/years");
  return data;
}

export async function createAcademicYear(year: {
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}): Promise<{ id: string; name: string }> {
  const { data } = await api.post("/academic/years", year);
  return data;
}

export async function updateAcademicYear(id: string, year: Partial<AcademicYear>): Promise<{ id: string; name: string; is_current: boolean }> {
  const { data } = await api.patch(`/academic/years/${id}`, year);
  return data;
}

export async function deleteAcademicYear(id: string): Promise<void> {
  await api.delete(`/academic/years/${id}`);
}
