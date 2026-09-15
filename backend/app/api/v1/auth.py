"""Authentication: login / refresh / logout / me / change-password."""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.token import RefreshToken
from app.models.user import User
from app.schemas import ChangePasswordIn, LoginIn, RefreshIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_tokens(user: User, db: Session) -> TokenOut:
    access = create_access_token(str(user.id), user.role.value)
    refresh = create_refresh_token(str(user.id))
    payload = decode_token(refresh)
    db.add(
        RefreshToken(
            user_id=user.id,
            jti=payload.get("jti") or secrets.token_hex(16),
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
    )
    db.commit()
    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower().strip()))
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return _issue_tokens(user, db)


@router.post("/refresh", response_model=TokenOut)
def refresh(data: RefreshIn, db: Session = Depends(get_db)):
    try:
        payload = decode_token(data.refresh_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    from uuid import UUID

    user = db.get(User, UUID(str(payload.get("sub"))))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return _issue_tokens(user, db)


@router.post("/logout", status_code=204)
def logout(user: User = Depends(get_current_user)):
    # Stateless JWT: client discards tokens. Refresh rotation/revocation
    # can be enforced via the refresh_tokens table in a follow-up.
    return None


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password", status_code=204)
def change_password(data: ChangePasswordIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fresh = db.get(User, user.id)
    assert fresh is not None
    if not verify_password(data.current_password, fresh.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    fresh.hashed_password = hash_password(data.new_password)
    db.commit()
    return None
