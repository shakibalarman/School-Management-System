"""Guardians, academic structure, attendance, exams/marks, fees, reports, notices."""
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_admin_or_head_teacher, require_admin_or_teacher
from app.core.grading import grade_for, summarize_marks
from app.models.academic import AcademicYear, ClassSubject, SchoolClass, Section, Subject
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus
from app.models.exam import Exam, Mark
from app.models.fee import FeeCategory, FeePayment, StudentFee
from app.models.homework import Homework
from app.models.notice import Notice
from app.models.people import Guardian, Student
from app.models.user import User
from app.schemas import (
    AcademicYearCreate,
    AttendanceTakeIn,
    ExamCreate,
    FeeBulkAssignIn,
    FeeCategoryCreate,
    FeeCategoryOut,
    FeePaymentCreate,
    GuardianCreate,
    GuardianOut,
    MarksBulkIn,
    SchoolClassCreate,
    SectionCreate,
    StudentFeeCreate,
    StudentFeeOut,
    SubjectCreate,
)

guardians_router = APIRouter(prefix="/guardians", tags=["guardians"])
academic_router = APIRouter(prefix="/academic", tags=["academic"])
attendance_router = APIRouter(prefix="/attendance", tags=["attendance"])
exams_router = APIRouter(prefix="/exams", tags=["exams"])
results_router = APIRouter(prefix="/results", tags=["results"])
fees_router = APIRouter(prefix="/fees", tags=["fees"])
reports_router = APIRouter(prefix="/reports", tags=["reports"])
notices_router = APIRouter(prefix="/notices", tags=["notices"])
homework_router = APIRouter(prefix="/homework", tags=["homework"])


# ---- Guardians ----
@guardians_router.post("", response_model=GuardianOut, status_code=201)
def create_guardian(data: GuardianCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    g = Guardian(
        first_name=data.first_name, last_name=data.last_name,
        email=data.email.lower().strip() if data.email else None,
        phone=data.phone, address=data.address,
    )
    if data.student_ids:
        g.students = list(db.scalars(select(Student).where(Student.id.in_(data.student_ids))))
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


@guardians_router.get("", response_model=list[GuardianOut])
def list_guardians(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Guardian).order_by(Guardian.created_at.desc()).limit(200)))


# ---- Academic ----
@academic_router.post("/years", status_code=201)
def create_year(data: AcademicYearCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    y = AcademicYear(**data.model_dump())
    db.add(y)
    db.commit()
    db.refresh(y)
    return {"id": str(y.id), "name": y.name}


@academic_router.get("/years")
def list_years(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [{"id": str(y.id), "name": y.name, "is_current": y.is_current, "start_date": y.start_date.isoformat(), "end_date": y.end_date.isoformat()} for y in db.scalars(select(AcademicYear))]


@academic_router.patch("/years/{year_id}")
def update_year(year_id: str, data: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    y = db.get(AcademicYear, year_id)
    if y is None:
        raise HTTPException(status_code=404, detail="Academic year not found")
    if data.get("is_current"):
        for other in db.scalars(select(AcademicYear).where(AcademicYear.id != year_id)):
            other.is_current = False
    for key in ("name", "start_date", "end_date", "is_current"):
        if key in data:
            setattr(y, key, data[key])
    db.commit()
    db.refresh(y)
    return {"id": str(y.id), "name": y.name, "is_current": y.is_current}


@academic_router.delete("/years/{year_id}", status_code=204)
def delete_year(year_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    y = db.get(AcademicYear, year_id)
    if y is None:
        raise HTTPException(status_code=404, detail="Academic year not found")
    db.delete(y)
    db.commit()


@academic_router.post("/classes", status_code=201)
def create_class(data: SchoolClassCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    c = SchoolClass(name=data.name, academic_year_id=data.academic_year_id)
    db.add(c)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Class already exists for this year")
    db.refresh(c)
    return {"id": str(c.id), "name": c.name}


@academic_router.get("/classes")
def list_classes(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    out = []
    for c in db.scalars(select(SchoolClass)):

        out.append({"id": str(c.id), "name": c.name, "academic_year_id": str(c.academic_year_id)})
    return out


@academic_router.get("/sections")
def list_sections(class_id: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stmt = select(Section)
    if class_id:
        stmt = stmt.where(Section.class_id == class_id)
    return [{"id": str(s.id), "name": s.name, "class_id": str(s.class_id), "capacity": s.capacity} for s in db.scalars(stmt)]


@academic_router.post("/sections", status_code=201)
def create_section(data: SectionCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    s = Section(name=data.name, class_id=data.class_id, capacity=data.capacity)
    db.add(s)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Section already exists for this class")
    db.refresh(s)
    return {"id": str(s.id), "name": s.name}


@academic_router.post("/subjects", status_code=201)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    subj = Subject(name=data.name, code=data.code.upper().strip(), description=data.description)
    db.add(subj)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Subject code already exists")
    db.refresh(subj)
    return {"id": str(subj.id), "name": subj.name, "code": subj.code}


@academic_router.get("/subjects")
def list_subjects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [{"id": str(s.id), "name": s.name, "code": s.code} for s in db.scalars(select(Subject))]


@academic_router.delete("/subjects/{subject_id}", status_code=204)
def delete_subject(subject_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    subj = db.get(Subject, subject_id)
    if subj is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subj)
    db.commit()
    return None


@academic_router.post("/classes/{class_id}/subjects/{subject_id}", status_code=201)
def link_subject(class_id: str, subject_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    db.add(ClassSubject(class_id=class_id, subject_id=subject_id))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Already linked or invalid")
    return {"ok": True}


@academic_router.get("/classes/{class_id}/subjects")
def list_class_subjects(class_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.scalars(select(ClassSubject).where(ClassSubject.class_id == class_id)).all()
    subject_ids = [r.subject_id for r in rows]
    subjects = db.scalars(select(Subject).where(Subject.id.in_(subject_ids))) if subject_ids else []
    return [{"id": str(s.id), "name": s.name, "code": s.code} for s in subjects]


# ---- Attendance ----
@attendance_router.post("/take", status_code=201)
def take_attendance(
    data: AttendanceTakeIn, user: User = Depends(require_admin_or_teacher), db: Session = Depends(get_db)
):
    for r in data.records:
        existing = db.scalar(select(Attendance).where(Attendance.student_id == r.student_id, Attendance.date == data.date))
        if existing:
            existing.status = r.status
            existing.class_id = data.class_id
            existing.section_id = data.section_id
            existing.marked_by = user.id
        else:
            db.add(
                Attendance(
                    student_id=r.student_id, class_id=data.class_id, section_id=data.section_id,
                    date=data.date, status=r.status, marked_by=user.id,
                )
            )
    db.commit()
    return {"ok": True, "count": len(data.records)}


@attendance_router.patch("/{attendance_id}")
def update_attendance_record(
    attendance_id: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    record = db.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if "status" in data:
        record.status = data["status"]
    db.commit()
    db.refresh(record)
    return {
        "id": str(record.id),
        "student_id": str(record.student_id),
        "class_id": str(record.class_id),
        "section_id": str(record.section_id) if record.section_id else None,
        "date": record.date.isoformat(),
        "status": record.status.value,
        "marked_by": str(record.marked_by) if record.marked_by else None,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


@attendance_router.get("/rate")
def attendance_rate(
    student_id: str = Query(...), db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    total = db.scalar(select(func.count(Attendance.id)).where(Attendance.student_id == student_id)) or 0
    present = db.scalar(
        select(func.count(Attendance.id)).where(
            Attendance.student_id == student_id, Attendance.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE])
        )
    ) or 0
    rate = round((present / total * 100) if total else 0.0, 2)
    return {"student_id": student_id, "present": present, "total": total, "rate": rate}


@attendance_router.get("")
def list_attendance(
    class_id: str | None = None,
    section_id: str | None = None,
    date: str | None = None,
    student_id: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    stmt = (
        select(Attendance, Student, SchoolClass, Section)
        .join(Student, Attendance.student_id == Student.id, isouter=True)
        .join(SchoolClass, Attendance.class_id == SchoolClass.id, isouter=True)
        .join(Section, Attendance.section_id == Section.id, isouter=True)
        .order_by(Attendance.date.desc(), Attendance.created_at.desc())
    )
    if class_id:
        stmt = stmt.where(Attendance.class_id == class_id)
    if section_id:
        stmt = stmt.where(Attendance.section_id == section_id)
    if date:
        stmt = stmt.where(Attendance.date == date)
    if student_id:
        stmt = stmt.where(Attendance.student_id == student_id)
    rows = db.execute(stmt.offset(skip).limit(limit)).all()
    return [
        {
            "id": str(r[0].id),
            "student_id": str(r[0].student_id),
            "class_id": str(r[0].class_id),
            "section_id": str(r[0].section_id) if r[0].section_id else None,
            "date": r[0].date.isoformat(),
            "status": r[0].status.value,
            "marked_by": str(r[0].marked_by) if r[0].marked_by else None,
            "created_at": r[0].created_at.isoformat() if r[0].created_at else None,
            "student": {
                "first_name": r[1].first_name,
                "last_name": r[1].last_name,
                "student_code": r[1].student_code,
            } if r[1] else None,
            "class": {"name": r[2].name} if r[2] else None,
            "section": {"name": r[3].name} if r[3] else None,
        }
        for r in rows
    ]


@attendance_router.get("/student/{student_id}")
def student_attendance(
    student_id: str,
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    stmt = select(Attendance).where(Attendance.student_id == student_id).order_by(Attendance.date.desc())
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
        record_list.append({
            "id": str(r.id),
            "date": r.date.isoformat(),
            "status": r.status.value,
        })

    percentage = round((present / total * 100) if total else 0.0, 1)
    return {
        "student_id": student_id,
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "excused": excused,
        "percentage": percentage,
        "records": record_list,
    }


# ---- Exams & marks ----
@exams_router.post("", status_code=201)
def create_exam(data: ExamCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    e = Exam(**data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": str(e.id), "name": e.name}


@exams_router.get("")
def list_exams(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [{"id": str(e.id), "name": e.name, "exam_type": e.exam_type.value} for e in db.scalars(select(Exam))]


@exams_router.post("/{exam_id}/marks", status_code=201)
def enter_marks(exam_id: str, data: MarksBulkIn, user: User = Depends(require_admin_or_teacher), db: Session = Depends(get_db)):
    if str(data.exam_id) != exam_id:
        raise HTTPException(status_code=400, detail="exam_id mismatch")
    for entry in data.entries:
        existing = db.scalar(
            select(Mark).where(
                Mark.exam_id == exam_id, Mark.student_id == entry.student_id, Mark.subject_id == entry.subject_id
            )
        )
        if existing:
            existing.marks = entry.marks
            existing.entered_by = user.id
        else:
            db.add(
                Mark(
                    exam_id=exam_id, student_id=entry.student_id, subject_id=entry.subject_id,
                    marks=entry.marks, entered_by=user.id,
                )
            )
    db.commit()
    return {"ok": True, "count": len(data.entries)}


# ---- Results (computed grades) ----
@results_router.get("/all")
def all_results(
    exam_id: str = Query(...),
    class_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: all student results for a given exam, optionally filtered by class."""
    stmt = select(Mark).where(Mark.exam_id == exam_id)
    if class_id:
        student_ids = [s.id for s in db.scalars(select(Student).where(Student.class_id == class_id))]
        stmt = stmt.where(Mark.student_id.in_(student_ids))
    marks = list(db.scalars(stmt))
    subjects = {s.id: s for s in db.scalars(select(Subject))}
    students_map = {s.id: s for s in db.scalars(select(Student))}

    # Group by student
    by_student: dict[str, list] = {}
    for m in marks:
        by_student.setdefault(str(m.student_id), []).append(m)

    results = []
    for sid, smarks in by_student.items():
        student = students_map.get(uuid.UUID(sid) if not isinstance(sid, uuid.UUID) else sid)
        rows = []
        total = 0.0
        for m in smarks:
            grade, gpa = grade_for(float(m.marks))
            subj = subjects.get(m.subject_id)
            rows.append({
                "subject": subj.name if subj else str(m.subject_id),
                "marks": float(m.marks),
                "grade": grade,
                "gpa": gpa,
            })
            total += float(m.marks)
        avg = round(total / len(rows), 1) if rows else 0
        summary = summarize_marks([r["marks"] for r in rows])
        results.append({
            "student_id": sid,
            "student_name": f"{student.first_name} {student.last_name}" if student else sid,
            "student_code": student.student_code if student else None,
            "class_id": str(student.class_id) if student else None,
            "rows": rows,
            "total": summary["total"],
            "average": avg,
            "gpa": summary["gpa"],
            "result": summary["result"],
        })
    return results


@results_router.get("/overall")
def overall_results(
    exam_id: str = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: overall summary — class-wise pass rate, averages, toppers."""
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")

    marks = list(db.scalars(select(Mark).where(Mark.exam_id == exam_id)))
    if not marks:
        return {"exam": exam.name, "classes": [], "summary": {}}

    students_map = {s.id: s for s in db.scalars(select(Student))}
    classes_map = {c.id: c for c in db.scalars(select(SchoolClass))}
    subjects = {s.id: s for s in db.scalars(select(Subject))}

    # Group marks by class -> student
    class_student_marks: dict[str, dict[str, list]] = {}
    for m in marks:
        stu = students_map.get(m.student_id)
        if stu and stu.class_id:
            cid = str(stu.class_id)
            sid = str(m.student_id)
            class_student_marks.setdefault(cid, {}).setdefault(sid, []).append(m)

    class_results = []
    all_students_data = []
    for cid, student_marks_map in class_student_marks.items():
        cls = classes_map.get(uuid.UUID(cid))
        student_results = []
        for sid, smarks in student_marks_map.items():
            stu = students_map.get(uuid.UUID(sid))
            total = sum(float(m.marks) for m in smarks)
            avg = round(total / len(smarks), 1) if smarks else 0
            summary = summarize_marks([float(m.marks) for m in smarks])
            student_results.append({
                "student_id": sid,
                "student_name": f"{stu.first_name} {stu.last_name}" if stu else sid,
                "student_code": stu.student_code if stu else None,
                "gpa": summary["gpa"],
                "average": avg,
                "result": summary["result"],
                "total": summary["total"],
                "subjects": len(smarks),
            })

        student_results.sort(key=lambda x: x["gpa"], reverse=True)
        passed = sum(1 for s in student_results if s["result"] == "pass")
        total_students = len(student_results)
        avg_gpa = round(sum(s["gpa"] for s in student_results) / total_students, 2) if total_students else 0
        avg_marks = round(sum(s["average"] for s in student_results) / total_students, 1) if total_students else 0

        class_results.append({
            "class_id": cid,
            "class_name": cls.name if cls else cid,
            "total_students": total_students,
            "passed": passed,
            "failed": total_students - passed,
            "pass_rate": round(passed / total_students * 100, 1) if total_students else 0,
            "avg_gpa": avg_gpa,
            "avg_marks": avg_marks,
            "topper": student_results[0] if student_results else None,
            "students": student_results,
        })
        all_students_data.extend(student_results)

    class_results.sort(key=lambda x: x["avg_gpa"], reverse=True)
    all_students_data.sort(key=lambda x: x["gpa"], reverse=True)

    total_all = len(all_students_data)
    passed_all = sum(1 for s in all_students_data if s["result"] == "pass")
    overall = {
        "total_students": total_all,
        "passed": passed_all,
        "failed": total_all - passed_all,
        "pass_rate": round(passed_all / total_all * 100, 1) if total_all else 0,
        "avg_gpa": round(sum(s["gpa"] for s in all_students_data) / total_all, 2) if total_all else 0,
        "avg_marks": round(sum(s["average"] for s in all_students_data) / total_all, 1) if total_all else 0,
        "toppers": all_students_data[:5],
    }
    return {"exam": exam.name, "classes": class_results, "summary": overall}


@results_router.get("/student/{student_id}/exam/{exam_id}")
def student_result(student_id: str, exam_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    marks = list(db.scalars(select(Mark).where(Mark.student_id == student_id, Mark.exam_id == exam_id)))
    if not marks:
        return {"rows": [], "total": 0, "average": 0, "gpa": 0.0, "result": "no_data", "total_label": "0/0"}
    subjects = {s.id: s for s in db.scalars(select(Subject))}
    rows = []
    for m in marks:
        grade, gpa = grade_for(float(m.marks))
        subj = subjects.get(m.subject_id)
        rows.append(
            {"subject": subj.name if subj else str(m.subject_id), "marks": float(m.marks), "grade": grade, "gpa": gpa}
        )
    summary = summarize_marks([float(m.marks) for m in marks])
    return {"rows": rows, **summary, "total_label": f"{summary['total']}/{len(marks) * 100}"}


# ---- Fees ----
@fees_router.post("/categories", status_code=201)
def create_category(data: FeeCategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    c = FeeCategory(
        name=data.name, amount=data.amount, class_id=data.class_id,
        academic_year_id=data.academic_year_id, description=data.description,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": str(c.id)}


@fees_router.get("/categories", response_model=list[FeeCategoryOut])
def list_categories(
    class_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.models.academic import SchoolClass

    stmt = select(FeeCategory)
    if class_id:
        stmt = stmt.where(FeeCategory.class_id == class_id)
    rows = db.scalars(stmt).all()
    out = []
    for c in rows:
        cls = db.get(SchoolClass, c.class_id) if c.class_id else None
        out.append(FeeCategoryOut(
            id=c.id, name=c.name, amount=float(c.amount),
            class_id=c.class_id, academic_year_id=c.academic_year_id,
            description=c.description, class_name=cls.name if cls else None,
        ))
    return out


@fees_router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cat = db.get(FeeCategory, category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Fee category not found")
    db.delete(cat)
    db.commit()


@fees_router.post("/assign", status_code=201)
def bulk_assign_fees(data: FeeBulkAssignIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Assign a fee category to all active students in a class."""
    from app.models.enums import PersonStatus

    cat = db.get(FeeCategory, data.fee_category_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Fee category not found")
    students = list(db.scalars(
        select(Student).where(Student.class_id == data.class_id, Student.status == PersonStatus.ACTIVE)
    ))
    if not students:
        raise HTTPException(status_code=400, detail="No active students found in this class")

    count = 0
    for s in students:
        exists = db.scalar(
            select(StudentFee).where(
                StudentFee.student_id == s.id, StudentFee.fee_category_id == data.fee_category_id
            )
        )
        if not exists:
            db.add(StudentFee(
                student_id=s.id, fee_category_id=data.fee_category_id,
                total_amount=float(cat.amount), paid_amount=0, due_date=data.due_date,
            ))
            count += 1
    db.commit()
    # Auto-check: new fees assigned may push students over threshold
    _check_and_send_due_notices(db)
    return {"ok": True, "assigned": count, "total_students": len(students)}


@fees_router.post("/invoices", response_model=StudentFeeOut, status_code=201)
def create_invoice(data: StudentFeeCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    inv = StudentFee(
        student_id=data.student_id, fee_category_id=data.fee_category_id,
        total_amount=data.total_amount, paid_amount=0, due_date=data.due_date,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@fees_router.post("/invoices/{invoice_id}/pay", status_code=201)
def pay_invoice(
    invoice_id: str, data: FeePaymentCreate, user: User = Depends(require_admin), db: Session = Depends(get_db)
):
    inv = db.get(StudentFee, invoice_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    new_paid = float(inv.paid_amount) + data.amount
    if new_paid > float(inv.total_amount) + 1e-9:
        raise HTTPException(status_code=400, detail="Payment exceeds total")
    from app.models.enums import FeeStatus

    db.add(
        FeePayment(
            student_fee_id=inv.id, amount=data.amount, payment_method=data.payment_method,
            transaction_ref=data.transaction_ref, received_by=user.id,
        )
    )
    inv.paid_amount = new_paid
    if abs(new_paid - float(inv.total_amount)) < 1e-9:
        inv.status = FeeStatus.PAID
    elif new_paid > 0:
        inv.status = FeeStatus.PARTIAL
    if inv.due_date and inv.due_date < date.today() and inv.status != FeeStatus.PAID:
        inv.status = FeeStatus.OVERDUE
    db.commit()
    # Auto-check: if this student's total due drops below threshold, no new notice
    # If still above, the next manual trigger or assignment will catch it
    return {"ok": True, "paid": new_paid, "due": float(inv.total_amount) - new_paid}


@fees_router.get("/invoices/student/{student_id}", response_model=list[StudentFeeOut])
def invoices_for_student(student_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(StudentFee).where(StudentFee.student_id == student_id)))


DUE_THRESHOLD = 2000


def _check_and_send_due_notices(db: Session) -> dict:
    """Check all students with total due > threshold and send notices. Returns summary."""
    from app.models.enums import PersonStatus

    students = list(db.scalars(select(Student).where(Student.status == PersonStatus.ACTIVE)))
    notified = 0
    for stu in students:
        total_due = db.scalar(
            select(func.coalesce(func.sum(StudentFee.total_amount - StudentFee.paid_amount), 0))
            .where(StudentFee.student_id == stu.id)
        ) or 0
        if float(total_due) > DUE_THRESHOLD:
            # Check if a notice already exists today for this student
            from datetime import date as _date
            today = _date.today()
            existing = db.scalar(
                select(Notice).where(
                    Notice.title == f"Fee Due Reminder - {stu.first_name} {stu.last_name}",
                    Notice.class_id == stu.class_id,
                )
            )
            if existing is None:
                notice = Notice(
                    title=f"Fee Due Reminder - {stu.first_name} {stu.last_name}",
                    content=f"Dear {stu.first_name} {stu.last_name} ({stu.student_code}), your total outstanding fee amount is ৳{float(total_due):,.0f}. Please clear your dues before the due date to avoid late fees.",
                    target_role="student",
                    class_id=stu.class_id,
                    published=True,
                )
                db.add(notice)
                notified += 1
    db.commit()
    return {"total_students_checked": len(students), "notified": notified, "threshold": DUE_THRESHOLD}


@fees_router.post("/check-due-notices")
def trigger_due_notice_check(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Manually trigger check: send notices to students with total due > ৳2000."""
    return _check_and_send_due_notices(db)


# ---- Reports ----
@reports_router.get("/report-card/{student_id}/exam/{exam_id}")
def report_card(student_id: str, exam_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    student = db.get(Student, student_id)
    exam = db.get(Exam, exam_id)
    if student is None or exam is None:
        raise HTTPException(status_code=404, detail="Student or exam not found")
    marks = list(db.scalars(select(Mark).where(Mark.student_id == student_id, Mark.exam_id == exam_id)))
    subjects = {s.id: s for s in db.scalars(select(Subject))}
    rows = []
    for m in marks:
        grade, _ = grade_for(float(m.marks))
        subj = subjects.get(m.subject_id)
        rows.append({"subject": subj.name if subj else str(m.subject_id), "marks": float(m.marks), "grade": grade})
    summary = summarize_marks([float(m.marks) for m in marks])
    return {
        "student": f"{student.first_name} {student.last_name}",
        "student_code": student.student_code,
        "exam": exam.name,
        "rows": rows,
        **summary,
    }


# ---- Notices ----
@notices_router.post("", status_code=201)
def create_notice(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin_or_head_teacher),
):
    notice = Notice(
        title=data["title"],
        content=data["content"],
        target_role=data.get("target_role", "all"),
        class_id=data.get("class_id"),
        published=data.get("published", True),
        created_by=user.id,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return {
        "id": str(notice.id),
        "title": notice.title,
        "content": notice.content,
        "target_role": notice.target_role,
        "class_id": str(notice.class_id) if notice.class_id else None,
        "published": notice.published,
        "created_at": notice.created_at.isoformat() if notice.created_at else None,
    }


@notices_router.get("")
def list_notices(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    notices = db.scalars(select(Notice).order_by(Notice.created_at.desc()))
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "content": n.content,
            "target_role": n.target_role,
            "class_id": str(n.class_id) if n.class_id else None,
            "published": n.published,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notices
    ]


@notices_router.patch("/{notice_id}")
def update_notice(
    notice_id: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_head_teacher),
):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise HTTPException(status_code=404, detail="Notice not found")
    for key in ("title", "content", "target_role", "class_id", "published"):
        if key in data:
            setattr(notice, key, data[key])
    db.commit()
    db.refresh(notice)
    return {
        "id": str(notice.id),
        "title": notice.title,
        "content": notice.content,
        "target_role": notice.target_role,
        "class_id": str(notice.class_id) if notice.class_id else None,
        "published": notice.published,
        "created_at": notice.created_at.isoformat() if notice.created_at else None,
    }


@notices_router.delete("/{notice_id}", status_code=204)
def delete_notice(
    notice_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_head_teacher),
):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()


# ---- Homework ----
@homework_router.post("", status_code=201)
def create_homework(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin_or_teacher),
):
    from app.models.academic import SchoolClass

    hw = Homework(
        title=data["title"],
        description=data.get("description"),
        class_id=data["class_id"],
        subject_id=data.get("subject_id"),
        due_date=data.get("due_date"),
        created_by=user.id,
    )
    db.add(hw)
    db.commit()
    db.refresh(hw)
    cls = db.get(SchoolClass, hw.class_id)
    return {
        "id": str(hw.id),
        "title": hw.title,
        "description": hw.description,
        "class_id": str(hw.class_id),
        "class_name": cls.name if cls else None,
        "subject_id": str(hw.subject_id) if hw.subject_id else None,
        "due_date": hw.due_date.isoformat() if hw.due_date else None,
        "created_at": hw.created_at.isoformat() if hw.created_at else None,
    }


@homework_router.get("")
def list_homework(
    class_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.models.academic import SchoolClass, Subject

    stmt = select(Homework).order_by(Homework.created_at.desc())
    if class_id:
        stmt = stmt.where(Homework.class_id == class_id)
    rows = db.scalars(stmt).all()
    out = []
    for hw in rows:
        cls = db.get(SchoolClass, hw.class_id) if hw.class_id else None
        subj = db.get(Subject, hw.subject_id) if hw.subject_id else None
        out.append({
            "id": str(hw.id),
            "title": hw.title,
            "description": hw.description,
            "class_id": str(hw.class_id),
            "class_name": cls.name if cls else None,
            "subject_id": str(hw.subject_id) if hw.subject_id else None,
            "subject_name": subj.name if subj else None,
            "due_date": hw.due_date.isoformat() if hw.due_date else None,
            "created_at": hw.created_at.isoformat() if hw.created_at else None,
        })
    return out


@homework_router.delete("/{homework_id}", status_code=204)
def delete_homework(
    homework_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin_or_teacher),
):
    hw = db.get(Homework, homework_id)
    if hw is None:
        raise HTTPException(status_code=404, detail="Homework not found")
    db.delete(hw)
    db.commit()
