"""Teacher portal — endpoints accessible only by teachers for their own data."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.grading import grade_for, summarize_marks
from app.models.academic import (
    ClassSubject,
    SchoolClass,
    Subject,
    TeacherClassAssignment,
    TeacherSchedule,
    TeacherSubjectAssignment,
)
from app.models.enums import UserRole
from app.models.exam import Mark
from app.models.people import Student, Teacher
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


@router.get("/results")
def get_my_subject_results(
    exam_id: str = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Teacher: results only for subjects assigned to this teacher."""
    teacher = _get_teacher_profile(user, db)

    # Get subject IDs assigned to this teacher
    subject_ids = [
        r.subject_id
        for r in db.scalars(
            select(TeacherSubjectAssignment).where(TeacherSubjectAssignment.teacher_id == teacher.id)
        )
    ]
    if not subject_ids:
        return []

    # Get marks for those subjects in this exam
    from app.models.academic import Subject
    marks = list(db.scalars(
        select(Mark).where(Mark.exam_id == exam_id, Mark.subject_id.in_(subject_ids))
    ))
    if not marks:
        return []

    subjects = {s.id: s for s in db.scalars(select(Subject).where(Subject.id.in_(subject_ids)))}
    students_map = {s.id: s for s in db.scalars(select(Student))}

    # Group by student
    by_student: dict[str, list] = {}
    for m in marks:
        by_student.setdefault(str(m.student_id), []).append(m)

    results = []
    for sid, smarks in by_student.items():
        student = students_map.get(uuid.UUID(sid) if not isinstance(sid, uuid.UUID) else sid)
        rows = []
        for m in smarks:
            grade, gpa = grade_for(float(m.marks))
            subj = subjects.get(m.subject_id)
            rows.append({
                "subject": subj.name if subj else str(m.subject_id),
                "marks": float(m.marks),
                "grade": grade,
                "gpa": gpa,
            })
        summary = summarize_marks([r["marks"] for r in rows])
        results.append({
            "student_id": sid,
            "student_name": f"{student.first_name} {student.last_name}" if student else sid,
            "student_code": student.student_code if student else None,
            "rows": rows,
            "total": summary["total"],
            "average": summary["average"],
            "gpa": summary["gpa"],
            "result": summary["result"],
        })
    return results


@router.get("/classes")
def get_my_classes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Teacher: list classes assigned to this teacher with students."""
    teacher = _get_teacher_profile(user, db)

    assignments = list(db.scalars(
        select(TeacherClassAssignment).where(TeacherClassAssignment.teacher_id == teacher.id)
    ))

    # Get subjects this teacher teaches
    subj_ids = [r.subject_id for r in db.scalars(
        select(TeacherSubjectAssignment).where(TeacherSubjectAssignment.teacher_id == teacher.id)
    )]
    my_subjects = {s.id: s for s in db.scalars(select(Subject).where(Subject.id.in_(subj_ids)))}

    result = []
    for a in assignments:
        cls = db.get(SchoolClass, a.class_id)
        if cls is None:
            continue
        # Get students in this class
        students_stmt = select(Student).where(Student.class_id == cls.id, Student.status == "active")
        if a.section_id:
            students_stmt = students_stmt.where(Student.section_id == a.section_id)
        students = list(db.scalars(students_stmt.order_by(Student.roll_number)))

        # Get subjects linked to this class
        cs_rows = db.scalars(select(ClassSubject).where(ClassSubject.class_id == cls.id)).all()
        class_subjects = []
        for cs in cs_rows:
            subj = db.get(Subject, cs.subject_id)
            if subj:
                class_subjects.append({
                    "id": str(subj.id),
                    "name": subj.name,
                    "code": subj.code,
                    "is_mine": subj.id in my_subjects,
                })

        section = db.get(SchoolClass, a.section_id) if a.section_id else None
        result.append({
            "class_id": str(cls.id),
            "class_name": cls.name,
            "section_id": str(a.section_id) if a.section_id else None,
            "section_name": None,
            "students": [
                {
                    "id": str(s.id),
                    "student_code": s.student_code,
                    "first_name": s.first_name,
                    "last_name": s.last_name,
                    "email": s.email,
                    "roll_number": s.roll_number,
                    "status": s.status.value,
                }
                for s in students
            ],
            "student_count": len(students),
            "subjects": class_subjects,
        })

    return result


@router.get("/classes/{class_id}/students")
def get_class_students(class_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Teacher: get students in a specific class."""
    teacher = _get_teacher_profile(user, db)

    # Verify teacher is assigned to this class
    assigned = db.scalar(
        select(TeacherClassAssignment).where(
            TeacherClassAssignment.teacher_id == teacher.id,
            TeacherClassAssignment.class_id == class_id,
        )
    )
    if assigned is None:
        raise HTTPException(status_code=403, detail="You are not assigned to this class")

    students = list(db.scalars(
        select(Student)
        .where(Student.class_id == class_id, Student.status == "active")
        .order_by(Student.roll_number)
    ))
    return [
        {
            "id": str(s.id),
            "student_code": s.student_code,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "phone": s.phone,
            "roll_number": s.roll_number,
            "gender": s.gender.value if s.gender else None,
        }
        for s in students
    ]
