"""Pydantic v2 schemas."""
import uuid
from datetime import date, time

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import AttendanceStatus, DayOfWeek, ExamType, FeeStatus, FeeType, Gender, PersonStatus, UserRole


# ---------- Auth ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


# ---------- Users ----------
class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole


# ---------- Students ----------
class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    admission_date: date | None = None
    class_id: uuid.UUID | None = None
    section_id: uuid.UUID | None = None
    roll_number: int | None = None
    guardian_ids: list[uuid.UUID] = []
    create_login: bool = False
    password: str | None = Field(default=None, min_length=8, max_length=128)


class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    address: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    class_id: uuid.UUID | None = None
    section_id: uuid.UUID | None = None
    roll_number: int | None = None
    status: PersonStatus | None = None
    profile_photo_url: str | None = None


class StudentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    student_code: str
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    class_id: uuid.UUID | None = None
    section_id: uuid.UUID | None = None
    roll_number: int | None = None
    status: PersonStatus
    admission_date: date | None = None

    model_config = {"from_attributes": True}


# ---------- Teachers ----------
class TeacherCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    department: str | None = None
    designation: str | None = None
    joining_date: date | None = None
    create_login: bool = False
    login_role: str | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class TeacherOut(BaseModel):
    id: uuid.UUID
    teacher_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    department: str | None = None
    designation: str | None = None
    joining_date: date | None = None
    status: PersonStatus

    model_config = {"from_attributes": True}


# ---------- Guardians ----------
class GuardianCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    student_ids: list[uuid.UUID] = []


class GuardianOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None

    model_config = {"from_attributes": True}


# ---------- Academic ----------
class AcademicYearCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False


class SchoolClassCreate(BaseModel):
    name: str
    academic_year_id: uuid.UUID


class SectionCreate(BaseModel):
    name: str
    class_id: uuid.UUID
    capacity: int | None = None


class SubjectCreate(BaseModel):
    name: str
    code: str
    description: str | None = None


# ---------- Attendance ----------
class AttendanceItem(BaseModel):
    student_id: uuid.UUID
    status: AttendanceStatus


class AttendanceTakeIn(BaseModel):
    class_id: uuid.UUID
    section_id: uuid.UUID | None = None
    date: date
    records: list[AttendanceItem]


# ---------- Exams & marks ----------
class ExamCreate(BaseModel):
    name: str
    exam_type: ExamType
    academic_year_id: uuid.UUID | None = None
    class_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class MarkEntry(BaseModel):
    student_id: uuid.UUID
    subject_id: uuid.UUID
    marks: float = Field(ge=0, le=100)


class MarksBulkIn(BaseModel):
    exam_id: uuid.UUID
    entries: list[MarkEntry]


# ---------- Fees ----------
class FeeCategoryCreate(BaseModel):
    name: FeeType
    amount: float = Field(gt=0)
    class_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    description: str | None = None


class FeeCategoryOut(BaseModel):
    id: uuid.UUID
    name: FeeType
    amount: float
    class_id: uuid.UUID | None = None
    academic_year_id: uuid.UUID | None = None
    description: str | None = None
    class_name: str | None = None

    model_config = {"from_attributes": True}


class FeeBulkAssignIn(BaseModel):
    class_id: uuid.UUID
    fee_category_id: uuid.UUID
    due_date: date | None = None


class StudentFeeCreate(BaseModel):
    student_id: uuid.UUID
    fee_category_id: uuid.UUID
    total_amount: float = Field(gt=0)
    due_date: date | None = None


class FeePaymentCreate(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str | None = None
    transaction_ref: str | None = None


class StudentFeeOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    total_amount: float
    paid_amount: float
    status: FeeStatus
    due_date: date | None = None

    model_config = {"from_attributes": True}


# ---------- Teacher Assignments ----------
class SubjectOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str

    model_config = {"from_attributes": True}


class TeacherSubjectAssignmentOut(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    subject: SubjectOut

    model_config = {"from_attributes": True}


class ClassOut(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class SectionOut(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class TeacherClassAssignmentOut(BaseModel):
    id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID | None = None
    school_class: ClassOut
    section: SectionOut | None = None

    model_config = {"from_attributes": True}


# ---------- Teacher Schedule ----------
class TeacherScheduleCreate(BaseModel):
    class_id: uuid.UUID
    section_id: uuid.UUID | None = None
    subject_id: uuid.UUID
    day_of_week: DayOfWeek
    period_number: int = Field(ge=1, le=20)
    start_time: time
    end_time: time


class TeacherScheduleOut(BaseModel):
    id: uuid.UUID
    teacher_id: uuid.UUID
    class_id: uuid.UUID
    section_id: uuid.UUID | None = None
    subject_id: uuid.UUID
    day_of_week: DayOfWeek
    period_number: int
    start_time: time
    end_time: time
    school_class: ClassOut
    section: SectionOut | None = None
    subject: SubjectOut

    model_config = {"from_attributes": True}
