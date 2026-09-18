"""add teacher_schedules table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-09-18
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    day_of_week_enum = ENUM(
        "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday",
        name="day_of_week",
        create_type=False,
    )
    day_of_week_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "teacher_schedules",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("teacher_id", UUID(as_uuid=True), sa.ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("class_id", UUID(as_uuid=True), sa.ForeignKey("classes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("section_id", UUID(as_uuid=True), sa.ForeignKey("sections.id", ondelete="SET NULL"), nullable=True),
        sa.Column("subject_id", UUID(as_uuid=True), sa.ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_of_week", day_of_week_enum, nullable=False, index=True),
        sa.Column("period_number", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.UniqueConstraint("teacher_id", "day_of_week", "period_number", name="uq_teacher_day_period"),
        sa.UniqueConstraint("class_id", "section_id", "day_of_week", "period_number", name="uq_class_section_day_period"),
    )


def downgrade() -> None:
    op.drop_table("teacher_schedules")
    op.execute("DROP TYPE IF EXISTS day_of_week")
