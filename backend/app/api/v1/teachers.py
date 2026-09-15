"""Teacher CRUD + activate/deactivate + subject/class assignment."""
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.models.academic import TeacherClassAssignment, TeacherSubjectAssignment
from app.models.enums import PersonStatus
from app.models.people import Teacher
from app.models.user import User, UserRole
from app.schemas import TeacherCreate, TeacherOut

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.post("", response_model=TeacherOut, status_code=201)
def create_teacher(data: TeacherCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.scalar(select(Teacher).where(Teacher.email == data.email.lower().strip())):
        raise HTTPException(status_code=400, detail="Teacher email already exists")
    teacher = Teacher(
        teacher_code=f"TCH-{secrets.token_hex(3).upper()}",
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email.lower().strip(),
        phone=data.phone,
        department=data.department,
        designation=data.designation,
        joining_date=data.joining_date,
    )
    if data.create_login:
        if not data.password:
            raise HTTPException(status_code=400, detail="Password required when create_login=True")
        login = User(email=teacher.email, hashed_password=hash_password(data.password), role=UserRole.TEACHER)
        db.add(login)
        db.flush()
        teacher.user_id = login.id
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("", response_model=list[TeacherOut])
def list_teachers(
    skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db), _: User = Depends(get_current_user),
):
    return list(db.scalars(select(Teacher).order_by(Teacher.created_at.desc()).offset(skip).limit(limit)))


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    t = db.get(Teacher, teacher_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return t


@router.patch("/{teacher_id}/deactivate", response_model=TeacherOut)
def deactivate(teacher_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    t = db.get(Teacher, teacher_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    t.status = PersonStatus.INACTIVE
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{teacher_id}/activate", response_model=TeacherOut)
def activate(teacher_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    t = db.get(Teacher, teacher_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    t.status = PersonStatus.ACTIVE
    db.commit()
    db.refresh(t)
    return t


@router.post("/{teacher_id}/subjects/{subject_id}", status_code=201)
def assign_subject(teacher_id: str, subject_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.get(Teacher, teacher_id) is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    db.add(TeacherSubjectAssignment(teacher_id=teacher_id, subject_id=subject_id))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Assignment already exists or invalid")
    return {"ok": True}


@router.post("/{teacher_id}/classes/{class_id}", status_code=201)
def assign_class(
    teacher_id: str, class_id: str, section_id: str | None = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    if db.get(Teacher, teacher_id) is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    db.add(TeacherClassAssignment(teacher_id=teacher_id, class_id=class_id, section_id=section_id))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Assignment already exists or invalid")
    return {"ok": True}
