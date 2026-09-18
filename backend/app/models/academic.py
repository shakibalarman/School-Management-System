"""Academic structure: Year -> Class -> Section, Subjects + links."""
import uuid
from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import DayOfWeek


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # e.g. "2026"
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    classes: Mapped[list["SchoolClass"]] = relationship(back_populates="academic_year")


class SchoolClass(Base):
    """Named `SchoolClass` to avoid clashing with Python `class` keyword. Table: classes."""
    __tablename__ = "classes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "Class 8"
    academic_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="RESTRICT"), nullable=False
    )

    academic_year: Mapped[AcademicYear] = relationship(back_populates="classes")
    sections: Mapped[list["Section"]] = relationship(back_populates="school_class", cascade="all, delete-orphan")
    subjects: Mapped[list["ClassSubject"]] = relationship(back_populates="school_class", cascade="all, delete-orphan")
    students: Mapped[list["Student"]] = relationship(back_populates="school_class")

    __table_args__ = (UniqueConstraint("name", "academic_year_id", name="uq_class_name_year"),)


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(10), nullable=False)  # e.g. "A"
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    capacity: Mapped[int | None] = mapped_column(nullable=True)

    school_class: Mapped[SchoolClass] = relationship(back_populates="sections")
    students: Mapped[list["Student"]] = relationship(back_populates="section")

    __table_args__ = (UniqueConstraint("class_id", "name", name="uq_section_class_name"),)


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # Mathematics, English, ...
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    classes: Mapped[list["ClassSubject"]] = relationship(back_populates="subject", cascade="all, delete-orphan")


class ClassSubject(Base):
    """Which subjects are taught in which class."""
    __tablename__ = "class_subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )

    school_class: Mapped[SchoolClass] = relationship(back_populates="subjects")
    subject: Mapped[Subject] = relationship(back_populates="classes")

    __table_args__ = (UniqueConstraint("class_id", "subject_id", name="uq_class_subject"),)


class TeacherClassAssignment(Base):
    """Teacher -> class(/section) assignment."""
    __tablename__ = "teacher_class_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    section_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="SET NULL"), nullable=True
    )

    __table_args__ = (UniqueConstraint("teacher_id", "class_id", "section_id", name="uq_teacher_class_section"),)

    teacher: Mapped["Teacher"] = relationship(back_populates="class_assignments")
    school_class: Mapped["SchoolClass"] = relationship()
    section: Mapped["Section | None"] = relationship()


class TeacherSubjectAssignment(Base):
    """Teacher -> subject assignment."""
    __tablename__ = "teacher_subject_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )

    __table_args__ = (UniqueConstraint("teacher_id", "subject_id", name="uq_teacher_subject"),)

    teacher: Mapped["Teacher"] = relationship(back_populates="subject_assignments")
    subject: Mapped["Subject"] = relationship()


class TeacherSchedule(Base):
    """Weekly timetable: which teacher teaches which class/subject at which hour."""
    __tablename__ = "teacher_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    class_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    section_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="SET NULL"), nullable=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week: Mapped[DayOfWeek] = mapped_column(
        Enum(DayOfWeek, name="day_of_week", values_callable=lambda x: [e.value for e in x]),
        nullable=False, index=True
    )
    period_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-based period index
    start_time: Mapped[time] = mapped_column(nullable=False)  # e.g. 08:00
    end_time: Mapped[time] = mapped_column(nullable=False)  # e.g. 08:45

    teacher: Mapped["Teacher"] = relationship()
    school_class: Mapped["SchoolClass"] = relationship()
    section: Mapped["Section | None"] = relationship()
    subject: Mapped["Subject"] = relationship()

    __table_args__ = (
        UniqueConstraint("teacher_id", "day_of_week", "period_number", name="uq_teacher_day_period"),
        UniqueConstraint("class_id", "section_id", "day_of_week", "period_number", name="uq_class_section_day_period"),
    )
