"""Comprehensive seed: 30 students per class, 20 teachers, exams, homework, fees, routines."""
import random
import uuid
from datetime import date, datetime, time, timedelta

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.academic import (
    AcademicYear,
    ClassSubject,
    SchoolClass,
    Section,
    Subject,
    TeacherClassAssignment,
    TeacherSchedule,
    TeacherSubjectAssignment,
)
from app.models.attendance import Attendance
from app.models.enums import (
    AttendanceStatus,
    DayOfWeek,
    ExamType,
    FeeStatus,
    FeeType,
    Gender,
    PersonStatus,
    UserRole,
)
from app.models.exam import Exam, Mark
from app.models.fee import FeeCategory, FeePayment, StudentFee
from app.models.homework import Homework
from app.models.notice import Notice
from app.models.people import Guardian, Student, Teacher
from app.models.user import User

# ---------------------------------------------------------------------------
# Name pools
# ---------------------------------------------------------------------------
FIRST_NAMES_M = [
    "Arman", "Tanim", "Sakib", "Nafi", "Rakib", "Tanvir", "Shihab", "Mim",
    "Shanto", "Rony", "Jubayer", "Fahim", "Sabbir", "Tusher", "Asif",
    "Raihan", "Mahadi", "Samiul", "Abir", "Shakil", "Farhan", "Imran",
    "Jahid", "Masum", "Parvez", "Rubel", "Kamal", "Helal", "Rafiq", "Sohel",
    "Mizan", "Anis", "Biplob", "Sumon", "Habib", "Yeasin", "Adnan", "Nabil",
    "Pranto", "Zahin",
]
FIRST_NAMES_F = [
    "Tasnia", "Nusrat", "Faria", "Mim", "Taniya", "Rifa", "Sumaiya", "Jannat",
    "Meghla", "Puja", "Nafisa", "Tasfia", "Maliha", "Sanjida", "Farhana",
    "Tahsin", "Anika", "Bushra", "Ruma", "Lamia", "Sabrina", "Mstera",
    "Kanon", "Probha", "Runa", "Nupur", "Shirin", "Joya", "Lily", "Roksana",
    "Shammi", "Nasima", "Halima", "Rahima", "Jamila", "Amena", "Khadija",
    "Rashida", "Salma", "Parvin",
]
LAST_NAMES = [
    "Islam", "Khan", "Ahmed", "Hossain", "Rahman", "Miah", "Uddin", "Chowdhury",
    "Das", "Biswas", "Sarker", "Ali", "Sheikh", "Talukder", "Mondal",
    "Haque", "Ferdous", "Akter", "Begum", "Paul", "Gupta", "Roy",
]
TEACHER_SUBJECTS = ["BAN", "ENG", "MATH", "SCI", "PHY", "CHEM", "BIO", "ICT", "CS", "HIST", "GEO", "ECON"]
CLASS_SUBJECTS_MAP = {
    "Nursery":    ["BAN", "ENG", "MATH"],
    "Play":       ["BAN", "ENG", "MATH"],
    "Class 1":    ["BAN", "ENG", "MATH", "SCI"],
    "Class 2":    ["BAN", "ENG", "MATH", "SCI"],
    "Class 3":    ["BAN", "ENG", "MATH", "SCI"],
    "Class 4":    ["BAN", "ENG", "MATH", "SCI"],
    "Class 5":    ["BAN", "ENG", "MATH", "SCI", "ICT"],
    "Class 6":    ["BAN", "ENG", "MATH", "SCI", "ICT", "HIST", "GEO"],
    "Class 7":    ["BAN", "ENG", "MATH", "SCI", "ICT", "HIST", "GEO"],
    "Class 8":    ["BAN", "ENG", "MATH", "SCI", "ICT", "HIST", "GEO", "SSCI"],
    "Class 9":    ["BAN", "ENG", "MATH", "PHY", "CHEM", "BIO", "ICT"],
    "Class 10":   ["BAN", "ENG", "MATH", "PHY", "CHEM", "BIO", "ICT"],
}
DAYS = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY]
PERIODS = [
    (time(8, 0), time(8, 45)),
    (time(8, 50), time(9, 35)),
    (time(9, 45), time(10, 30)),
    (time(10, 35), time(11, 20)),
    (time(11, 30), time(12, 15)),
    (time(12, 20), time(13, 5)),
]
HOMEWORK_TITLES = [
    "Chapter Review Questions", "Worksheet Practice", "Essay Writing",
    "Problem Set", "Reading Comprehension", "Lab Report",
    "Project Work", "Vocabulary Exercise", "Grammar Practice",
    "Math Problems", "Science Fair Preparation", "History Timeline",
]
FEE_TYPES = [FeeType.TUITION, FeeType.EXAM, FeeType.LIBRARY, FeeType.TRANSPORT]
random.seed(42)


def _slug(first: str, last: str) -> str:
    return f"{first.lower()}.{last.lower()}"


def main() -> None:
    db = SessionLocal()
    try:
        # ── Academic year ──────────────────────────────────────────────────
        year = db.scalar(select(AcademicYear).where(AcademicYear.name == "2026"))
        if year is None:
            year = AcademicYear(name="2026", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31), is_current=True)
            db.add(year)
            db.flush()
            print("Created academic year 2026")
        else:
            print("Academic year 2026 already exists")

        # ── Admin ──────────────────────────────────────────────────────────
        if db.scalar(select(User).where(User.email == "admin@school.com")) is None:
            db.add(User(email="admin@school.com", hashed_password=hash_password("Admin123!"), role=UserRole.ADMIN, is_active=True))
            print("Created admin admin@school.com / Admin123!")

        # ── Classes & sections ─────────────────────────────────────────────
        class_names = [
            "Nursery", "Play", "Class 1", "Class 2", "Class 3", "Class 4",
            "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
        ]
        class_map: dict[str, SchoolClass] = {}  # name -> SchoolClass
        for cname in class_names:
            cls = db.scalar(select(SchoolClass).where(SchoolClass.name == cname, SchoolClass.academic_year_id == year.id))
            if cls is None:
                cls = SchoolClass(name=cname, academic_year_id=year.id)
                db.add(cls)
                db.flush()
            class_map[cname] = cls
            if cname in ("Class 9", "Class 10"):
                for sec in ["Science", "Arts", "Commerce"]:
                    if db.scalar(select(Section).where(Section.class_id == cls.id, Section.name == sec)) is None:
                        db.add(Section(name=sec, class_id=cls.id, capacity=40))

        # ── Subjects ───────────────────────────────────────────────────────
        subjects_data = [
            ("Bangla", "BAN"), ("English", "ENG"), ("Mathematics", "MATH"),
            ("General Science", "SCI"), ("Physics", "PHY"), ("Chemistry", "CHEM"),
            ("Biology", "BIO"), ("Higher Mathematics", "HMATH"),
            ("ICT", "ICT"), ("Computer Science", "CS"),
            ("Social Science", "SSCI"), ("History", "HIST"),
            ("Geography", "GEO"), ("Civics and Citizenship", "CIV"),
            ("Economics", "ECON"), ("Business Studies", "BSTD"),
            ("Accounting", "ACC"), ("Finance and Banking", "FB"),
        ]
        subj_map: dict[str, Subject] = {}  # code -> Subject
        for name, code in subjects_data:
            s = db.scalar(select(Subject).where(Subject.code == code))
            if s is None:
                s = Subject(name=name, code=code)
                db.add(s)
                db.flush()
            subj_map[code] = s

        # ── ClassSubject links ─────────────────────────────────────────────
        for cname, codes in CLASS_SUBJECTS_MAP.items():
            cls = class_map[cname]
            for code in codes:
                if db.scalar(select(ClassSubject).where(ClassSubject.class_id == cls.id, ClassSubject.subject_id == subj_map[code].id)) is None:
                    db.add(ClassSubject(class_id=cls.id, subject_id=subj_map[code].id))
        db.flush()

        # ── Teachers (20) ──────────────────────────────────────────────────
        teacher_data = [
            ("Rafiq", "Hossain"), ("Salma", "Begum"), ("Kamal", "Uddin"),
            ("Nasima", "Akter"), ("Helal", "Rahman"), ("Ruma", "Khan"),
            ("Sohel", "Islam"), ("Halima", "Ali"), ("Jubayer", "Miah"),
            ("Farhana", "Das"), ("Raihan", "Sarker"), ("Tahsin", "Chowdhury"),
            ("Masum", "Paul"), ("Lamia", "Roy"), ("Shakil", "Biswas"),
            ("Maliha", "Gupta"), ("Anis", "Sheikh"), ("Sabrina", "Talukder"),
            ("Rubel", "Mondal"), ("Bushra", "Ferdous"),
        ]
        teachers: list[Teacher] = []
        subjects_cycle = list(subj_map.keys())
        all_classes = list(class_map.values())
        for i, (first, last) in enumerate(teacher_data):
            code = f"T{i+1:03d}"
            email = f"{_slug(first, last)}@teacher.school.com"
            t = db.scalar(select(Teacher).where(Teacher.teacher_code == code))
            if t is None:
                # User account
                u = db.scalar(select(User).where(User.email == email))
                if u is None:
                    u = User(email=email, hashed_password=hash_password(first), role=UserRole.TEACHER, is_active=True)
                    db.add(u)
                    db.flush()
                t = Teacher(
                    user_id=u.id, teacher_code=code, first_name=first, last_name=last,
                    email=email, gender=Gender.MALE if i % 2 == 0 else Gender.FEMALE,
                    department="Academic", designation="Teacher", status=PersonStatus.ACTIVE,
                    joining_date=date(2025, 1, 1),
                )
                db.add(t)
                db.flush()
            teachers.append(t)

            # Assign 2 subjects per teacher
            sub_codes = subjects_cycle[i * 2:(i * 2) + 2]
            for sc in sub_codes:
                if db.scalar(select(TeacherSubjectAssignment).where(TeacherSubjectAssignment.teacher_id == t.id, TeacherSubjectAssignment.subject_id == subj_map[sc].id)) is None:
                    db.add(TeacherSubjectAssignment(teacher_id=t.id, subject_id=subj_map[sc].id))

            # Assign each teacher to 2 classes
            assigned_classes = all_classes[i * 2:(i * 2) + 2]
            if not assigned_classes:
                assigned_classes = random.sample(all_classes, 2)
            for cls in assigned_classes:
                sec = None
                if cls.name in ("Class 9", "Class 10") and cls.sections:
                    sec = random.choice(cls.sections)
                if db.scalar(select(TeacherClassAssignment).where(
                    TeacherClassAssignment.teacher_id == t.id,
                    TeacherClassAssignment.class_id == cls.id,
                    TeacherClassAssignment.section_id == sec.id if sec else None,
                )) is None:
                    db.add(TeacherClassAssignment(teacher_id=t.id, class_id=cls.id, section_id=sec.id if sec else None))

        # ── Students (30 per class) ────────────────────────────────────────
        all_students: list[Student] = []
        student_counter = 0
        for cname, cls in class_map.items():
            sections = cls.sections if cls.sections else [None]
            students_per_section = max(1, 30 // len(sections))
            for sec in sections:
                for roll in range(1, students_per_section + 1):
                    student_counter += 1
                    gender = Gender.MALE if random.random() < 0.55 else Gender.FEMALE
                    first_pool = FIRST_NAMES_M if gender == Gender.MALE else FIRST_NAMES_F
                    first = random.choice(first_pool)
                    last = random.choice(LAST_NAMES)
                    scode = f"STU{student_counter:04d}"
                    email = f"{_slug(first, last)}{student_counter}@student.school.com"
                    s = db.scalar(select(Student).where(Student.student_code == scode))
                    if s is None:
                        u = db.scalar(select(User).where(User.email == email))
                        if u is None:
                            u = User(email=email, hashed_password=hash_password(first), role=UserRole.STUDENT, is_active=True)
                            db.add(u)
                            db.flush()
                        s = Student(
                            user_id=u.id, student_code=scode, first_name=first, last_name=last,
                            email=email, gender=gender, status=PersonStatus.ACTIVE,
                            admission_date=date(2026, 1, 15), class_id=cls.id,
                            section_id=sec.id if sec else None, roll_number=roll,
                        )
                        db.add(s)
                        db.flush()
                    all_students.append(s)

        # ── Exams ──────────────────────────────────────────────────────────
        exams: list[Exam] = []
        for cname, cls in class_map.items():
            exam = db.scalar(select(Exam).where(Exam.name == f"Midterm {cname}", Exam.class_id == cls.id))
            if exam is None:
                exam = Exam(
                    name=f"Midterm {cname}", exam_type=ExamType.MIDTERM,
                    academic_year_id=year.id, class_id=cls.id,
                    start_date=date(2026, 6, 1), end_date=date(2026, 6, 15),
                    description=f"Mid-term examination for {cname}",
                )
                db.add(exam)
                db.flush()
            exams.append(exam)

            # Marks for students in this class
            class_students = [s for s in all_students if s.class_id == cls.id]
            class_subject_codes = CLASS_SUBJECTS_MAP.get(cname, [])
            for stu in class_students[:10]:  # limit to first 10 per class to keep data reasonable
                for scode in class_subject_codes:
                    if db.scalar(select(Mark).where(Mark.exam_id == exam.id, Mark.student_id == stu.id, Mark.subject_id == subj_map[scode].id)) is None:
                        db.add(Mark(
                            exam_id=exam.id, student_id=stu.id, subject_id=subj_map[scode].id,
                            marks=round(random.uniform(40, 98), 1),
                        ))

        # ── Homework ───────────────────────────────────────────────────────
        for cname, cls in class_map.items():
            class_subject_codes = CLASS_SUBJECTS_MAP.get(cname, [])
            if not class_subject_codes:
                continue
            scode = random.choice(class_subject_codes)
            title = random.choice(HOMEWORK_TITLES)
            if db.scalar(select(Homework).where(Homework.class_id == cls.id, Homework.title == title)) is None:
                teacher = random.choice(teachers)
                db.add(Homework(
                    title=title,
                    description=f"Complete the exercises from chapter 3 of {subj_map[scode].name} textbook.",
                    class_id=cls.id, subject_id=subj_map[scode].id,
                    due_date=date.today() + timedelta(days=random.randint(3, 14)),
                    created_by=teacher.user_id,
                ))

        # ── Fee categories ─────────────────────────────────────────────────
        for cname, cls in class_map.items():
            if cname in ("Class 9", "Class 10"):
                tuition = 5000
            elif cname in ("Nursery", "Play"):
                tuition = 2000
            else:
                class_num = int(cname.split()[-1])
                tuition = 3000 if class_num >= 5 else 2000
            for ft, amt in [(FeeType.TUITION, tuition), (FeeType.EXAM, 1500), (FeeType.LIBRARY, 500), (FeeType.TRANSPORT, 1200)]:
                if db.scalar(select(FeeCategory).where(FeeCategory.name == ft, FeeCategory.class_id == cls.id)) is None:
                    db.add(FeeCategory(name=ft, amount=amt, class_id=cls.id, academic_year_id=year.id, description=f"{ft.value} fee for {cname}"))

        # ── Student fees (assign to all students) ──────────────────────────
        db.flush()
        for stu in all_students:
            cats = db.scalars(select(FeeCategory).where(FeeCategory.class_id == stu.class_id)).all()
            for cat in cats:
                if db.scalar(select(StudentFee).where(StudentFee.student_id == stu.id, StudentFee.fee_category_id == cat.id)) is None:
                    paid = round(float(cat.amount) * random.choice([0, 0, 0, 0.5, 1.0]), 2)
                    status = FeeStatus.PAID if paid >= float(cat.amount) else (FeeStatus.PARTIAL if paid > 0 else FeeStatus.PENDING)
                    sf = StudentFee(student_id=stu.id, fee_category_id=cat.id, total_amount=float(cat.amount), paid_amount=paid, status=status, due_date=date(2026, 9, 30))
                    db.add(sf)
                    if paid > 0:
                        db.flush()
                        db.add(FeePayment(student_fee_id=sf.id, amount=paid, payment_method=random.choice(["cash", "bank_transfer", "mobile_banking"]), transaction_ref=f"PAY-{uuid.uuid4().hex[:8].upper()}"))

        # ── Class routines (schedules) ─────────────────────────────────────
        used_teacher_slots: set[tuple[uuid.UUID, str, int]] = set()
        for cname, cls in class_map.items():
            class_subject_codes = CLASS_SUBJECTS_MAP.get(cname, [])
            if not class_subject_codes:
                continue
            sec = cls.sections[0] if cls.sections else None
            subjs_assigned = [subj_map[c] for c in class_subject_codes]
            idx = 0
            for day in DAYS:
                for period_i, (start, end) in enumerate(PERIODS):
                    if idx >= len(subjs_assigned):
                        idx = 0
                    subj = subjs_assigned[idx]
                    # Find a teacher for this subject that is free this day/period
                    tsas = db.scalars(select(TeacherSubjectAssignment).where(TeacherSubjectAssignment.subject_id == subj.id)).all()
                    teacher_id = None
                    for tsa in tsas:
                        slot = (tsa.teacher_id, day.value, period_i + 1)
                        if slot not in used_teacher_slots:
                            # Also check DB for existing schedule
                            exists = db.scalar(select(TeacherSchedule).where(
                                TeacherSchedule.teacher_id == tsa.teacher_id,
                                TeacherSchedule.day_of_week == day,
                                TeacherSchedule.period_number == period_i + 1,
                            ))
                            if exists is None:
                                teacher_id = tsa.teacher_id
                                used_teacher_slots.add(slot)
                                break
                    if teacher_id is None:
                        # Fallback: pick any teacher not yet busy
                        for t in teachers:
                            slot = (t.id, day.value, period_i + 1)
                            if slot not in used_teacher_slots:
                                exists = db.scalar(select(TeacherSchedule).where(
                                    TeacherSchedule.teacher_id == t.id,
                                    TeacherSchedule.day_of_week == day,
                                    TeacherSchedule.period_number == period_i + 1,
                                ))
                                if exists is None:
                                    teacher_id = t.id
                                    used_teacher_slots.add(slot)
                                    break
                    if teacher_id is not None:
                        db.add(TeacherSchedule(
                            teacher_id=teacher_id, class_id=cls.id, section_id=sec.id if sec else None,
                            subject_id=subj.id, day_of_week=day, period_number=period_i + 1,
                            start_time=start, end_time=end,
                        ))
                    idx += 1

        # ── Notices ────────────────────────────────────────────────────────
        notice_texts = [
            ("Parent-Teacher Meeting", "A parent-teacher meeting is scheduled for next Friday. All parents are requested to attend.", "all"),
            ("Annual Sports Day", "Annual sports day will be held on October 15th. Students should practice for events.", "student"),
            ("Staff Meeting", "All teachers are requested to attend the staff meeting on Monday at 2 PM.", "teacher"),
            ("Exam Schedule", "Mid-term examinations will begin from June 1st. Please check the notice board for detailed schedule.", "all"),
            ("Holiday Notice", "School will remain closed on account of national holiday on September 25th.", "all"),
        ]
        for title, content, target in notice_texts:
            if db.scalar(select(Notice).where(Notice.title == title)) is None:
                db.add(Notice(title=title, content=content, target_role=target, published=True))

        db.commit()
        print(f"Seed complete: {len(teachers)} teachers, {len(all_students)} students, {len(exams)} exams, routines, fees, notices")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
