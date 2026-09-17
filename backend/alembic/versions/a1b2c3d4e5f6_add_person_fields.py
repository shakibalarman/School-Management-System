"""add blood_group nationality religion to students and teachers

Revision ID: a1b2c3d4e5f6
Revises: ff0e7626800b
Create Date: 2026-09-15 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'ff0e7626800b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('students', sa.Column('blood_group', sa.String(length=10), nullable=True))
    op.add_column('students', sa.Column('nationality', sa.String(length=50), nullable=True))
    op.add_column('students', sa.Column('religion', sa.String(length=50), nullable=True))

    op.add_column('teachers', sa.Column('blood_group', sa.String(length=10), nullable=True))
    op.add_column('teachers', sa.Column('nationality', sa.String(length=50), nullable=True))
    op.add_column('teachers', sa.Column('religion', sa.String(length=50), nullable=True))
    op.add_column('teachers', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('teachers', sa.Column('gender', sa.Enum('MALE', 'FEMALE', 'OTHER', name='gender', create_type=False), nullable=True))


def downgrade() -> None:
    op.drop_column('teachers', 'gender')
    op.drop_column('teachers', 'date_of_birth')
    op.drop_column('teachers', 'religion')
    op.drop_column('teachers', 'nationality')
    op.drop_column('teachers', 'blood_group')
    op.drop_column('students', 'religion')
    op.drop_column('students', 'nationality')
    op.drop_column('students', 'blood_group')
