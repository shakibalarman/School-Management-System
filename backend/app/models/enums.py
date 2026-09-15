"""Shared enums — mirrors the specification exactly."""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"
    GUARDIAN = "guardian"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class PersonStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class ExamType(str, enum.Enum):
    MIDTERM = "midterm"
    FINAL = "final"
    CLASS_TEST = "class_test"
    MONTHLY_TEST = "monthly_test"


class FeeType(str, enum.Enum):
    ADMISSION = "admission"
    TUITION = "tuition"
    EXAM = "exam"
    LIBRARY = "library"
    TRANSPORT = "transport"
    OTHER = "other"


class FeeStatus(str, enum.Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
