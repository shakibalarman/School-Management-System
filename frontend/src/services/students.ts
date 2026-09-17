import { api } from "../lib/api";
import type { Student } from "../types";

export async function listStudents(params?: {
  q?: string;
  class_id?: string;
  section_id?: string;
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<Student[]> {
  const { data } = await api.get("/students", { params });
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await api.get(`/students/${id}`);
  return data;
}

export async function createStudent(student: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  nationality?: string;
  religion?: string;
  admission_date?: string;
  class_id?: string;
  section_id?: string;
  roll_number?: number;
  guardian_ids?: string[];
}): Promise<Student> {
  const { data } = await api.post("/students", student);
  return data;
}

export async function updateStudent(
  id: string,
  student: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    nationality: string;
    religion: string;
    class_id: string;
    section_id: string;
    roll_number: number;
    status: string;
  }>
): Promise<Student> {
  const { data } = await api.patch(`/students/${id}`, student);
  return data;
}
