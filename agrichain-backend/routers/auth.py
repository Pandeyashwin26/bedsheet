"""
AGRI-मित्र Authentication Router
═══════════════════════════════════════════════════════════════════════════════

JWT-based authentication: register, login, profile read/update, password change.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from core.config import settings
from db.session import get_db
from db.models import User

# ─── Constants ────────────────────────────────────────────────────────────────
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# ─── Security helpers ────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ═══════════════════════════════════════════════════════════════════════════════
# Pydantic Schemas
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=200)
    email: Optional[str] = None
    district: Optional[str] = None
    state: str = "Maharashtra"
    main_crop: Optional[str] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None
    language: str = "hi"

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip().replace(" ", "").replace("-", "")
        if not cleaned.replace("+", "").isdigit():
            raise ValueError("Phone must contain only digits")
        return cleaned


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserProfileResponse(BaseModel):
    id: int
    phone: str
    full_name: str
    email: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    main_crop: Optional[str] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None
    language: str
    total_harvests: int
    savings_estimate: float
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    main_crop: Optional[str] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None
    language: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


# ═══════════════════════════════════════════════════════════════════════════════
# Token Utilities
# ═══════════════════════════════════════════════════════════════════════════════

def create_access_token(user_id: int) -> str:
    """Create a JWT access token for the given user ID."""
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[int]:
    """Verify a JWT token and return the user ID, or None."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except (JWTError, ValueError):
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# Dependencies
# ═══════════════════════════════════════════════════════════════════════════════

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from the Authorization header."""
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )
    return user


def _user_to_dict(user: User) -> dict:
    """Convert a User ORM object to a serializable dict."""
    return {
        "id": user.id,
        "phone": user.phone,
        "full_name": user.full_name,
        "email": user.email,
        "district": user.district,
        "state": user.state,
        "main_crop": user.main_crop,
        "farm_size_acres": user.farm_size_acres,
        "soil_type": user.soil_type,
        "language": user.language,
        "total_harvests": user.total_harvests,
        "savings_estimate": user.savings_estimate,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.phone == body.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered",
        )

    user = User(
        phone=body.phone,
        password_hash=pwd_context.hash(body.password),
        full_name=body.full_name,
        email=body.email,
        district=body.district,
        state=body.state,
        main_crop=body.main_crop,
        farm_size_acres=body.farm_size_acres,
        soil_type=body.soil_type,
        language=body.language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_dict(user))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with phone + password and receive a JWT token."""
    user = db.query(User).filter(User.phone == body.phone, User.is_active == True).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_dict(user))


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's profile fields."""
    update_data = body.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(current_user, field_name, value)

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the authenticated user's password."""
    if not pwd_context.verify(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = pwd_context.hash(body.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Password changed successfully"}
