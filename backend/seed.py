"""Seed an initial admin user + minimal academic data. Idempotent."""
import uuid
from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.academic import AcademicYear, SchoolClass, Section, Subject
from app.models.user import User, UserRole


def main() -> None:
    db = SessionLocal()
    try:
        email = "admin@school.local"
        admin = db.scalar(select(User).where(User.email == email))
        if admin is None:
            admin = User(email=email, hashed_password=hash_password("Admin123!"), role=UserRole.ADMIN, is_active=True)
            db.add(admin)
            print(f"Created admin {email} / Admin123!")
        else:
            print("Admin already exists")

        year = db.scalar(select(AcademicYear).where(AcademicYear.name == "2026"))
        if year is None:
            year = AcademicYear(name="2026", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31), is_current=True)
            db.add(year)
            db.flush()
            print("Created academic year 2026")
        for cname in ["Class 6", "Class 7", "Class 8", "Class 9"]:
            cls = db.scalar(select(SchoolClass).where(SchoolClass.name == cname, SchoolClass.academic_year_id == year.id))
            if cls is None:
                cls = SchoolClass(name=cname, academic_year_id=year.id)
                db.add(cls)
                db.flush()
            for sec in ["A", "B"]:
                exists = db.scalar(select(Section).where(Section.class_id == cls.id, Section.name == sec))
                if exists is None:
                    db.add(Section(name=sec, class_id=cls.id, capacity=40))
        for name, code in [
            ("Mathematics", "MATH"), ("English", "ENG"), ("Physics", "PHY"),
            ("Chemistry", "CHEM"), ("Biology", "BIO"), ("ICT", "ICT"), ("Bangla", "BAN"),
        ]:
            if db.scalar(select(Subject).where(Subject.code == code)) is None:
                db.add(Subject(name=name, code=code))
        db.commit()
        print("Seed complete")
    finally:
        db.close()


if __name__ == "__main__":
    main()
