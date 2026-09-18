"""Import all models here so Alembic autogenerate sees them."""
from app.models.academic import (  # noqa: F401
    AcademicYear,
    ClassSubject,
    SchoolClass,
    Section,
    Subject,
    TeacherClassAssignment,
    TeacherSchedule,
    TeacherSubjectAssignment,
)
from app.models.attendance import Attendance  # noqa: F401
from app.models.exam import Exam, Mark  # noqa: F401
from app.models.fee import FeeCategory, FeePayment, StudentFee  # noqa: F401
from app.models.homework import Homework  # noqa: F401
from app.models.notice import Notice  # noqa: F401
from app.models.people import Guardian, Student, Teacher, guardian_student  # noqa: F401
from app.models.token import RefreshToken  # noqa: F401
from app.models.user import User  # noqa: F401
