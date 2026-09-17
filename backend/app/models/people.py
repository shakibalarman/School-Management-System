"""People profiles: Student / Teacher / Guardian + guardian-student link."""
import uuid
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Gender, PersonStatus

# Many-to-many: a guardian may have several children; a student may have several guardians.
guardian_student = Table(
    "guardian_student",
    Base.metadata,
    Column("guardian_id", UUID(as_uuid=True), ForeignKey("guardians.id", ondelete="CASCADE"), primary_key=True),
    Column("student_id", UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True
    )
    student_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)  # generated ID
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender, name="gender"), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    religion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    admission_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    class_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True, index=True
    )
    section_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="SET NULL"), nullable=True, index=True
    )
    roll_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[PersonStatus] = mapped_column(
        Enum(PersonStatus, name="person_status"), default=PersonStatus.ACTIVE, nullable=False, index=True
    )
    profile_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User | None"] = relationship(back_populates="student_profile")
    school_class: Mapped["SchoolClass | None"] = relationship(back_populates="students")
    section: Mapped["Section | None"] = relationship(back_populates="students")
    guardians: Mapped[list["Guardian"]] = relationship(secondary=guardian_student, back_populates="students")


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True
    )
    teacher_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender, name="gender", create_type=False), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    religion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    joining_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[PersonStatus] = mapped_column(
        Enum(PersonStatus, name="person_status", create_type=False), default=PersonStatus.ACTIVE, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User | None"] = relationship(back_populates="teacher_profile")


class Guardian(Base):
    __tablename__ = "guardians"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User | None"] = relationship(back_populates="guardian_profile")
    students: Mapped[list[Student]] = relationship(secondary=guardian_student, back_populates="guardians")
