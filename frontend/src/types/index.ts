export type Role = "admin" | "head_teacher" | "teacher" | "student" | "guardian";

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
  user_id: string | null;
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
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  nationality: string | null;
  religion: string | null;
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
  student?: { first_name: string; last_name: string; student_code: string } | null;
  class?: { name: string } | null;
  section?: { name: string } | null;
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

export interface StudentAttendanceSummary {
  student_id: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  records: { id: string; date: string; status: string }[];
}

export type DayOfWeek = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export interface ScheduleEntry {
  id: string;
  teacher_id: string;
  class_id: string;
  section_id: string | null;
  subject_id: string;
  day_of_week: DayOfWeek;
  period_number: number;
  start_time: string;
  end_time: string;
  school_class: { id: string; name: string };
  section: { id: string; name: string } | null;
  subject: { id: string; name: string; code: string };
  teacher?: { id: string; first_name: string; last_name: string };
}

export interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  class_id: string | null;
  academic_year_id: string | null;
  description: string | null;
  class_name: string | null;
}
