"""Guardians, academic structure, attendance, exams/marks, fees, reports."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_admin_or_teacher
from app.core.grading import grade_for, summarize_marks
from app.models.academic import AcademicYear, ClassSubject, SchoolClass, Section, Subject
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus
from app.models.exam import Exam, Mark
from app.models.fee import FeeCategory, FeePayment, StudentFee
from app.models.people import Guardian, Student
from app.models.user import User
from app.schemas import (
    AcademicYearCreate,
    AttendanceTakeIn,
    ExamCreate,
    FeeCategoryCreate,
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
    return [{"id": str(y.id), "name": y.name, "is_current": y.is_current} for y in db.scalars(select(AcademicYear))]


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


@academic_router.post("/classes/{class_id}/subjects/{subject_id}", status_code=201)
def link_subject(class_id: str, subject_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    db.add(ClassSubject(class_id=class_id, subject_id=subject_id))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Already linked or invalid")
    return {"ok": True}


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
@results_router.get("/student/{student_id}/exam/{exam_id}")
def student_result(student_id: str, exam_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    marks = list(db.scalars(select(Mark).where(Mark.student_id == student_id, Mark.exam_id == exam_id)))
    if not marks:
        raise HTTPException(status_code=404, detail="No marks found")
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
    c = FeeCategory(name=data.name, amount=data.amount, academic_year_id=data.academic_year_id, description=data.description)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": str(c.id)}


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
    return {"ok": True, "paid": new_paid, "due": float(inv.total_amount) - new_paid}


@fees_router.get("/invoices/student/{student_id}", response_model=list[StudentFeeOut])
def invoices_for_student(student_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(StudentFee).where(StudentFee.student_id == student_id)))


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
