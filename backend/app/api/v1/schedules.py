"""Teacher schedule (timetable) CRUD — admin manages hourly class assignments."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.academic import TeacherSchedule
from app.models.enums import DayOfWeek
from app.models.people import Teacher
from app.models.user import User
from app.schemas import TeacherScheduleCreate, TeacherScheduleOut

router = APIRouter(prefix="/schedules", tags=["schedules"])
log = logging.getLogger(__name__)


@router.post("/teacher/{teacher_id}", response_model=TeacherScheduleOut, status_code=201)
def create_schedule(teacher_id: str, data: TeacherScheduleCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.get(Teacher, teacher_id) is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if data.end_time <= data.start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
    entry = TeacherSchedule(teacher_id=teacher_id, **data.model_dump())
    db.add(entry)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        log.exception("Failed to create schedule")
        raise HTTPException(status_code=400, detail=f"Schedule conflict or invalid data: {exc}")
    db.refresh(entry)
    return db.scalar(
        select(TeacherSchedule)
        .where(TeacherSchedule.id == entry.id)
        .options(
            joinedload(TeacherSchedule.school_class),
            joinedload(TeacherSchedule.section),
            joinedload(TeacherSchedule.subject),
        )
    )


@router.get("", response_model=list[TeacherScheduleOut])
def list_schedules(
    teacher_id: str | None = None,
    class_id: str | None = None,
    day: DayOfWeek | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    stmt = select(TeacherSchedule).options(
        joinedload(TeacherSchedule.school_class),
        joinedload(TeacherSchedule.section),
        joinedload(TeacherSchedule.subject),
    )
    if teacher_id:
        stmt = stmt.where(TeacherSchedule.teacher_id == teacher_id)
    if class_id:
        stmt = stmt.where(TeacherSchedule.class_id == class_id)
    if day:
        stmt = stmt.where(TeacherSchedule.day_of_week == day)
    stmt = stmt.order_by(TeacherSchedule.day_of_week, TeacherSchedule.period_number)
    return list(db.scalars(stmt).unique().all())


@router.get("/{schedule_id}", response_model=TeacherScheduleOut)
def get_schedule(schedule_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    entry = db.scalar(
        select(TeacherSchedule)
        .where(TeacherSchedule.id == schedule_id)
        .options(
            joinedload(TeacherSchedule.school_class),
            joinedload(TeacherSchedule.section),
            joinedload(TeacherSchedule.subject),
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    return entry


@router.put("/{schedule_id}", response_model=TeacherScheduleOut)
def update_schedule(schedule_id: str, data: TeacherScheduleCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    entry = db.get(TeacherSchedule, schedule_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    if data.end_time <= data.start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
    for field, value in data.model_dump().items():
        setattr(entry, field, value)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Schedule conflict or invalid data: {exc}")
    db.refresh(entry)
    return db.scalar(
        select(TeacherSchedule)
        .where(TeacherSchedule.id == entry.id)
        .options(
            joinedload(TeacherSchedule.school_class),
            joinedload(TeacherSchedule.section),
            joinedload(TeacherSchedule.subject),
        )
    )


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    entry = db.get(TeacherSchedule, schedule_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    db.delete(entry)
    db.commit()
