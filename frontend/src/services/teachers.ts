import { api } from "../lib/api";
import type { Teacher } from "../types";

export async function listTeachers(params?: {
  skip?: number;
  limit?: number;
}): Promise<Teacher[]> {
  const { data } = await api.get("/teachers", { params });
  return data;
}

export async function getTeacher(id: string): Promise<Teacher> {
  const { data } = await api.get(`/teachers/${id}`);
  return data;
}

export async function createTeacher(teacher: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  nationality?: string;
  religion?: string;
  department?: string;
  designation?: string;
  joining_date?: string;
  create_login?: boolean;
  password?: string;
}): Promise<Teacher> {
  const { data } = await api.post("/teachers", teacher);
  return data;
}

export async function deactivateTeacher(id: string): Promise<Teacher> {
  const { data } = await api.patch(`/teachers/${id}/deactivate`);
  return data;
}

export async function activateTeacher(id: string): Promise<Teacher> {
  const { data } = await api.patch(`/teachers/${id}/activate`);
  return data;
}
