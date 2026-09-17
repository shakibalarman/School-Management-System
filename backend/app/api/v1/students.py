"""Student CRUD + search/filter + deactivate + guardian/class assignment."""
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.models.people import Guardian, Student
from app.models.user import User, UserRole
from app.schemas import StudentCreate, StudentOut, StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])


def _gen_code() -> str:
    return f"STU-{secrets.token_hex(3).upper()}"


@router.post("", response_model=StudentOut, status_code=201)
def create_student(data: StudentCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if data.email and db.scalar(select(Student).where(Student.email == data.email.lower().strip())):
        raise HTTPException(status_code=400, detail="Student email already exists")
    student = Student(
        student_code=_gen_code(),
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email.lower().strip() if data.email else None,
        phone=data.phone,
        address=data.address,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        blood_group=data.blood_group,
        nationality=data.nationality,
        religion=data.religion,
        admission_date=data.admission_date,
        class_id=data.class_id,
        section_id=data.section_id,
        roll_number=data.roll_number,
    )
    if data.create_login:
        if not data.email:
            raise HTTPException(status_code=400, detail="Email is required when create_login=True")
        if not data.password:
            raise HTTPException(status_code=400, detail="Password required when create_login=True")
        login_email = data.email.lower().strip()
        if db.scalar(select(User).where(User.email == login_email)):
            raise HTTPException(status_code=400, detail="A user with this email already exists")
        login = User(email=login_email, hashed_password=hash_password(data.password), role=UserRole.STUDENT)
        db.add(login)
        db.flush()
        student.user_id = login.id
    if data.guardian_ids:
        guardians = list(db.scalars(select(Guardian).where(Guardian.id.in_(data.guardian_ids))))
        student.guardians = guardians
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("", response_model=list[StudentOut])
def list_students(
    q: str | None = Query(default=None, description="Search name/email/code"),
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    stmt = select(Student).order_by(Student.created_at.desc())
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Student.first_name.ilike(like),
                Student.last_name.ilike(like),
                Student.email.ilike(like),
                Student.student_code.ilike(like),
            )
        )
    if class_id:
        stmt = stmt.where(Student.class_id == class_id)
    if section_id:
        stmt = stmt.where(Student.section_id == section_id)
    if status:
        stmt = stmt.where(Student.status == status)
    return list(db.scalars(stmt.offset(skip).limit(limit)))


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    s = db.get(Student, student_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return s


@router.patch("/{student_id}", response_model=StudentOut)
def update_student(student_id: str, data: StudentUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    s = db.get(Student, student_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Student not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.post("/{student_id}/guardians/{guardian_id}", response_model=StudentOut)
def assign_guardian(student_id: str, guardian_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    s = db.get(Student, student_id)
    g = db.get(Guardian, guardian_id)
    if s is None or g is None:
        raise HTTPException(status_code=404, detail="Student or guardian not found")
    if g not in s.guardians:
        s.guardians.append(g)
        db.commit()
        db.refresh(s)
    return s
