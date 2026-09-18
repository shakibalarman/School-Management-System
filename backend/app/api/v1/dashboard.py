"""Dashboard statistics endpoint for admin overview."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.academic import SchoolClass, Subject
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus, FeeStatus
from app.models.fee import StudentFee
from app.models.people import Student, Teacher
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_students = db.scalar(select(func.count(Student.id))) or 0
    total_teachers = db.scalar(select(func.count(Teacher.id))) or 0
    total_classes = db.scalar(select(func.count(SchoolClass.id))) or 0
    total_subjects = db.scalar(select(func.count(Subject.id))) or 0

    today = date.today()
    today_present = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE]),
        )
    ) or 0
    today_absent = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.ABSENT,
        )
    ) or 0
    today_late = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.LATE,
        )
    ) or 0
    today_excused = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.EXCUSED,
        )
    ) or 0
    today_total = today_present + today_absent + today_late + today_excused
    today_percentage = round((today_present / today_total * 100) if today_total else 0.0, 1)

    total_collected = db.scalar(
        select(func.coalesce(func.sum(StudentFee.paid_amount), 0.0)).where(
            StudentFee.status.in_([FeeStatus.PAID, FeeStatus.PARTIAL])
        )
    ) or 0.0
    total_outstanding = db.scalar(
        select(func.coalesce(func.sum(StudentFee.total_amount - StudentFee.paid_amount), 0.0)).where(
            StudentFee.status.in_([FeeStatus.PENDING, FeeStatus.PARTIAL, FeeStatus.OVERDUE])
        )
    ) or 0.0
    total_due = db.scalar(
        select(func.coalesce(func.sum(StudentFee.total_amount), 0.0))
    ) or 0.0

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "total_subjects": total_subjects,
        "today_attendance": {
            "present": today_present,
            "absent": today_absent,
            "late": today_late,
            "excused": today_excused,
            "total": today_total,
            "percentage": today_percentage,
        },
        "fee_collection": {
            "total_collected": float(total_collected),
            "total_outstanding": float(total_outstanding),
            "total_due": float(total_due),
        },
    }


@router.get("/weekly-attendance")
def weekly_attendance(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    today = date.today()
    days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        present = db.scalar(
            select(func.count(Attendance.id)).where(
                Attendance.date == d,
                Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE]),
            )
        ) or 0
        total = db.scalar(
            select(func.count(Attendance.id)).where(Attendance.date == d)
        ) or 0
        day_name = d.strftime("%a")
        pct = round((present / total * 100) if total else 0.0, 1)
        days.append({"day": day_name, "present": present, "total": total, "percentage": pct})
    return days
