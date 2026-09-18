"""add head_teacher role to user_role enum

Revision ID: f4a5b6c7d8e9
Revises: c3d4e5f6a7b8
Create Date: 2026-09-18
"""
from alembic import op

revision = "f4a5b6c7d8e9"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'head_teacher'")


def downgrade() -> None:
    pass
