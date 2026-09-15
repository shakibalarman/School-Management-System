"""Fees: categories, per-student invoices, payments."""
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import FeeStatus, FeeType


class FeeCategory(Base):
    __tablename__ = "fee_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[FeeType] = mapped_column(Enum(FeeType, name="fee_type"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    academic_year_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class StudentFee(Base):
    __tablename__ = "student_fees"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fee_category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_categories.id", ondelete="RESTRICT"), nullable=False
    )
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    status: Mapped[FeeStatus] = mapped_column(
        Enum(FeeStatus, name="fee_status"), default=FeeStatus.PENDING, nullable=False, index=True
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    payments: Mapped[list["FeePayment"]] = relationship(back_populates="student_fee", cascade="all, delete-orphan")

    @property
    def due_amount(self) -> float:
        return float(self.total_amount) - float(self.paid_amount)


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_fee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_fees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, server_default=func.current_date(), nullable=False)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    transaction_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    received_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student_fee: Mapped[StudentFee] = relationship(back_populates="payments")
