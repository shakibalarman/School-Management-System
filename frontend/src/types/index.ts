export type Role = "admin" | "teacher" | "student" | "guardian";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export interface TodayAttendance {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

export interface FeeCollection {
  total_collected: number;
  total_outstanding: number;
  total_due: number;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  today_attendance: TodayAttendance;
  fee_collection: FeeCollection;
}

export interface Student {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  admission_date: string | null;
  class_id: string | null;
  section_id: string | null;
  roll_number: number | null;
  status: "active" | "inactive";
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  teacher_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  academic_year_id: string;
}

export interface Section {
  id: string;
  name: string;
  class_id: string;
  capacity: number | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  section_id: string | null;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_by: string | null;
  created_at: string;
}

export interface FeeInvoice {
  id: string;
  student_id: string;
  total_amount: number;
  paid_amount: number;
  status: "pending" | "partial" | "paid" | "overdue";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}
