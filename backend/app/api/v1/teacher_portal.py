"""Teacher portal — endpoints accessible only by teachers for their own data."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.academic import TeacherSchedule
from app.models.enums import UserRole
from app.models.people import Teacher
from app.models.user import User

router = APIRouter(prefix="/teacher", tags=["teacher-portal"])


def _get_teacher_profile(user: User, db: Session) -> Teacher:
    """Get the teacher profile linked to the current user."""
    if user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Teacher account required")
    teacher = db.scalar(select(Teacher).where(Teacher.user_id == user.id))
    if teacher is None:
        raise HTTPException(status_code=404, detail="No teacher profile linked to this account")
    return teacher


@router.get("/me")
def get_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    teacher = _get_teacher_profile(user, db)
    return {
        "id": str(teacher.id),
        "teacher_code": teacher.teacher_code,
        "first_name": teacher.first_name,
        "last_name": teacher.last_name,
        "email": teacher.email,
        "phone": teacher.phone,
        "department": teacher.department,
        "designation": teacher.designation,
        "status": teacher.status.value,
    }


@router.get("/routine")
def get_my_routine(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the teacher's weekly timetable grouped by day of week."""
    teacher = _get_teacher_profile(user, db)

    entries = list(
        db.scalars(
            select(TeacherSchedule)
            .where(TeacherSchedule.teacher_id == teacher.id)
            .options(
                joinedload(TeacherSchedule.school_class),
                joinedload(TeacherSchedule.section),
                joinedload(TeacherSchedule.subject),
            )
            .order_by(TeacherSchedule.day_of_week, TeacherSchedule.period_number)
        ).unique().all()
    )

    routine: dict[str, list] = {}
    for entry in entries:
        day = entry.day_of_week.value
        if day not in routine:
            routine[day] = []
        section_name = entry.section.name if entry.section else None
        routine[day].append({
            "id": str(entry.id),
            "period": entry.period_number,
            "start_time": entry.start_time.strftime("%H:%M"),
            "end_time": entry.end_time.strftime("%H:%M"),
            "class": {"id": str(entry.school_class.id), "name": entry.school_class.name},
            "section": {"id": str(entry.section.id), "name": section_name} if entry.section else None,
            "subject": {"id": str(entry.subject.id), "name": entry.subject.name, "code": entry.subject.code},
        })

    day_order = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
    return [{"day": d, "periods": routine.get(d, [])} for d in day_order if d in routine]
