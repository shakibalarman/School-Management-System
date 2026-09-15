"""Admin user management (create / list / activate / deactivate)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    email = data.email.lower().strip()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(email=email, hashed_password=hash_password(data.password), role=data.role, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserOut])
def list_users(
    role: UserRole | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    stmt = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    if role:
        stmt = select(User).where(User.role == role).order_by(User.created_at.desc()).offset(skip).limit(limit)
    return list(db.scalars(stmt))


@router.patch("/{user_id}/deactivate", response_model=UserOut)
def deactivate(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/activate", response_model=UserOut)
def activate(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.get("/count", response_model=dict)
def count(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total = db.scalar(select(func.count(User.id)))
    return {"total": total}
