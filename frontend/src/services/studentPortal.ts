import { api } from "../lib/api";

export interface StudentProfile {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  nationality: string | null;
  religion: string | null;
  admission_date: string | null;
  roll_number: number | null;
  status: string;
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
}

export interface StudentDashboard {
  attendance: { total: number; present: number; absent: number; percentage: number };
  fees: { total: number; paid: number; pending: number };
  marks_count: number;
  upcoming_exams: number;
}

export interface StudentSubject {
  id: string;
  name: string;
  code: string;
}

export interface StudentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  records: { id: string; date: string; status: string }[];
}

export interface StudentExam {
  exam_id: string;
  exam_name: string;
  exam_type: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  marks: number;
  start_date: string | null;
  end_date: string | null;
}

export interface FeePayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  transaction_ref: string | null;
}

export interface StudentFee {
  id: string;
  category: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  due_date: string | null;
  payments: FeePayment[];
}

export interface StudentNotice {
  id: string;
  title: string;
  content: string;
  target_role: string;
  created_at: string | null;
}

export interface StudentHomework {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  due_date: string | null;
  created_at: string | null;
}

export async function getMyProfile(): Promise<StudentProfile> {
  const { data } = await api.get("/student/me");
  return data;
}

export async function getMyDashboard(): Promise<StudentDashboard> {
  const { data } = await api.get("/student/dashboard");
  return data;
}

export async function getMySubjects(): Promise<StudentSubject[]> {
  const { data } = await api.get("/student/subjects");
  return data;
}

export async function getMyAttendance(month?: number, year?: number): Promise<StudentAttendanceSummary> {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await api.get("/student/attendance", { params });
  return data;
}

export async function getMyExams(): Promise<StudentExam[]> {
  const { data } = await api.get("/student/exams");
  return data;
}

export async function getMyFees(): Promise<StudentFee[]> {
  const { data } = await api.get("/student/fees");
  return data;
}

export async function getMyNotices(): Promise<StudentNotice[]> {
  const { data } = await api.get("/student/notices");
  return data;
}

export async function getMyHomework(): Promise<StudentHomework[]> {
  const { data } = await api.get("/student/homework");
  return data;
}
