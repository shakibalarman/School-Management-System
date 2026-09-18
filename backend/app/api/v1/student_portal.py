"""Student portal — endpoints accessible only by students for their own data."""
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.academic import ClassSubject, SchoolClass, Section, Subject, TeacherSchedule
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus, DayOfWeek, FeeStatus
from app.models.exam import Exam, Mark
from app.models.fee import FeeCategory, FeePayment, StudentFee
from app.models.notice import Notice
from app.models.people import Student, Teacher
from app.models.user import User

router = APIRouter(prefix="/student", tags=["student-portal"])


def _get_student_profile(user: User, db: Session) -> Student:
    """Get the student profile linked to the current user."""
    student = db.scalar(select(Student).where(Student.user_id == user.id))
    if student is None:
        raise HTTPException(status_code=404, detail="No student profile linked to this account")
    return student


@router.get("/me")
def get_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)
    sc = db.get(SchoolClass, student.class_id) if student.class_id else None
    sec = db.get(Section, student.section_id) if student.section_id else None
    return {
        "id": str(student.id),
        "student_code": student.student_code,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "phone": student.phone,
        "address": student.address,
        "date_of_birth": student.date_of_birth.isoformat() if student.date_of_birth else None,
        "gender": student.gender.value if student.gender else None,
        "blood_group": student.blood_group,
        "nationality": student.nationality,
        "religion": student.religion,
        "admission_date": student.admission_date.isoformat() if student.admission_date else None,
        "roll_number": student.roll_number,
        "status": student.status.value,
        "class": {"id": str(sc.id), "name": sc.name} if sc else None,
        "section": {"id": str(sec.id), "name": sec.name} if sec else None,
    }


@router.get("/dashboard")
def get_student_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)

    # Attendance summary
    total = db.scalar(select(func.count(Attendance.id)).where(Attendance.student_id == student.id)) or 0
    present = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.student_id == student.id,
            Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE]),
        )
    ) or 0
    absent = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.student_id == student.id, Attendance.status == AttendanceStatus.ABSENT
        )
    ) or 0
    attendance_pct = round((present / total * 100) if total else 0.0, 1)

    # Fee summary
    total_fees = db.scalar(
        select(func.coalesce(func.sum(StudentFee.total_amount), 0)).where(StudentFee.student_id == student.id)
    ) or 0
    paid_fees = db.scalar(
        select(func.coalesce(func.sum(StudentFee.paid_amount), 0)).where(StudentFee.student_id == student.id)
    ) or 0
    pending_fees = float(total_fees) - float(paid_fees)

    # Recent marks count
    marks_count = db.scalar(select(func.count(Mark.id)).where(Mark.student_id == student.id)) or 0

    # Upcoming exams
    upcoming_exams = db.scalar(select(func.count(Exam.id)).where(Exam.class_id == student.class_id)) or 0

    return {
        "attendance": {"total": total, "present": present, "absent": absent, "percentage": attendance_pct},
        "fees": {"total": float(total_fees), "paid": float(paid_fees), "pending": pending_fees},
        "marks_count": marks_count,
        "upcoming_exams": upcoming_exams,
    }


@router.get("/subjects")
def get_my_subjects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)
    if not student.class_id:
        return []
    subjects = db.scalars(
        select(Subject)
        .join(ClassSubject, ClassSubject.subject_id == Subject.id)
        .where(ClassSubject.class_id == student.class_id)
        .order_by(Subject.name)
    ).all()
    return [{"id": str(s.id), "name": s.name, "code": s.code} for s in subjects]


@router.get("/attendance")
def get_my_attendance(
    month: int | None = None,
    year: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = _get_student_profile(user, db)
    stmt = select(Attendance).where(Attendance.student_id == student.id).order_by(Attendance.date.desc())
    if month and year:
        from sqlalchemy import extract
        stmt = stmt.where(extract("month", Attendance.date) == month, extract("year", Attendance.date) == year)
    records = db.scalars(stmt.limit(500))

    total = 0
    present = 0
    absent = 0
    late = 0
    excused = 0
    record_list = []
    for r in records:
        total += 1
        if r.status == AttendanceStatus.PRESENT:
            present += 1
        elif r.status == AttendanceStatus.ABSENT:
            absent += 1
        elif r.status == AttendanceStatus.LATE:
            late += 1
        elif r.status == AttendanceStatus.EXCUSED:
            excused += 1
        record_list.append({"id": str(r.id), "date": r.date.isoformat(), "status": r.status.value})

    percentage = round((present / total * 100) if total else 0.0, 1)
    return {
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "excused": excused,
        "percentage": percentage,
        "records": record_list,
    }


@router.get("/exams")
def get_my_exams(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)
    marks = db.scalars(
        select(Mark, Exam)
        .join(Exam, Mark.exam_id == Exam.id)
        .where(Mark.student_id == student.id)
        .order_by(Exam.start_date.desc())
    ).all()
    return [
        {
            "exam_id": str(m[1].id),
            "exam_name": m[1].name,
            "exam_type": m[1].exam_type.value,
            "subject_id": str(m[0].subject_id),
            "marks": m[0].marks,
            "start_date": m[1].start_date.isoformat() if m[1].start_date else None,
            "end_date": m[1].end_date.isoformat() if m[1].end_date else None,
        }
        for m in marks
    ]


@router.get("/fees")
def get_my_fees(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)
    fees = db.scalars(
        select(StudentFee, FeeCategory)
        .join(FeeCategory, StudentFee.fee_category_id == FeeCategory.id)
        .where(StudentFee.student_id == student.id)
        .order_by(StudentFee.created_at.desc())
    ).all()
    return [
        {
            "id": str(f[0].id),
            "category": f[1].name.value,
            "total_amount": float(f[0].total_amount),
            "paid_amount": float(f[0].paid_amount),
            "due_amount": float(f[0].total_amount) - float(f[0].paid_amount),
            "status": f[0].status.value,
            "due_date": f[0].due_date.isoformat() if f[0].due_date else None,
        }
        for f in fees
    ]


@router.get("/notices")
def get_my_notices(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = _get_student_profile(user, db)
    stmt = (
        select(Notice)
        .where(Notice.published == True, (Notice.target_role == "all") | (Notice.target_role == "student"))
        .order_by(Notice.created_at.desc())
    )
    if student.class_id:
        stmt = stmt.where((Notice.class_id == None) | (Notice.class_id == student.class_id))
    else:
        stmt = stmt.where(Notice.class_id == None)
    notices = db.scalars(stmt.limit(50))
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "content": n.content,
            "target_role": n.target_role,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notices
    ]


@router.get("/schedule")
def get_my_schedule(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the class timetable grouped by day of week."""
    student = _get_student_profile(user, db)
    if not student.class_id:
        return []

    stmt = (
        select(TeacherSchedule)
        .where(TeacherSchedule.class_id == student.class_id)
        .options(
            joinedload(TeacherSchedule.subject),
            joinedload(TeacherSchedule.teacher),
            joinedload(TeacherSchedule.section),
        )
        .order_by(TeacherSchedule.day_of_week, TeacherSchedule.period_number)
    )
    if student.section_id:
        stmt = stmt.where(
            (TeacherSchedule.section_id == student.section_id) | (TeacherSchedule.section_id.is_(None))
        )
    else:
        stmt = stmt.where(TeacherSchedule.section_id.is_(None))

    entries = list(db.scalars(stmt).unique().all())

    routine: dict[str, list] = {}
    for entry in entries:
        day = entry.day_of_week.value
        if day not in routine:
            routine[day] = []
        routine[day].append({
            "id": str(entry.id),
            "period": entry.period_number,
            "start_time": entry.start_time.strftime("%H:%M"),
            "end_time": entry.end_time.strftime("%H:%M"),
            "subject": {"id": str(entry.subject.id), "name": entry.subject.name, "code": entry.subject.code},
            "teacher": {"id": str(entry.teacher.id), "name": f"{entry.teacher.first_name} {entry.teacher.last_name}"},
        })

    day_order = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
    return [{"day": d, "periods": routine.get(d, [])} for d in day_order if d in routine]
