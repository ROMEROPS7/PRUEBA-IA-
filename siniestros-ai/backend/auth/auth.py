"""
JWT Authentication and Authorization utilities.

Provides:
- Token creation and verification using python-jose
- Password hashing using passlib/bcrypt
- User role-based access control (RBAC)
- FastAPI dependency injection for protected routes
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, List, Dict, Any
from functools import lru_cache

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from jose import JWTError, jwt

from backend.config.settings import settings


# ==================== User Role Enum ====================
class UserRole(str, Enum):
    """User roles for role-based access control."""
    CLIENTE = "CLIENTE"
    GESTOR = "GESTOR"
    ADMIN = "ADMIN"


# ==================== Token Models ====================
class TokenData(BaseModel):
    """JWT token payload data."""
    user_id: str
    email: str
    role: UserRole
    exp: Optional[datetime] = None


class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str


class CurrentUser(BaseModel):
    """Current authenticated user model."""
    user_id: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True


# ==================== Password Hashing ====================
# Configure password hashing with bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to verify against

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ==================== JWT Token Management ====================
def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of claims to include in token
        expires_delta: Token expiration time delta. If None, uses JWT_EXPIRATION_HOURS from settings

    Returns:
        Encoded JWT token as string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            hours=settings.JWT_EXPIRATION_HOURS
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string to decode

    Returns:
        TokenData if token is valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id: str = payload.get("user_id")
        email: str = payload.get("email")
        role: str = payload.get("role")

        if user_id is None or email is None or role is None:
            return None

        return TokenData(
            user_id=user_id,
            email=email,
            role=UserRole(role),
        )

    except JWTError:
        return None


# ==================== FastAPI Security Dependencies ====================
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[CurrentUser]:
    """
    FastAPI dependency to extract and verify the current user from JWT token.

    If AUTH_REQUIRED is False, returns None when no token is provided (backward compatibility).
    If AUTH_REQUIRED is True, raises HTTPException when token is missing or invalid.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        CurrentUser if token is valid, None if no token provided and AUTH_REQUIRED is False

    Raises:
        HTTPException: If token is invalid/expired and AUTH_REQUIRED is True
    """
    if credentials is None:
        if settings.AUTH_REQUIRED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None

    token = credentials.credentials
    token_data = decode_token(token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        user_id=token_data.user_id,
        email=token_data.email,
        role=token_data.role,
    )


def require_role(*allowed_roles: UserRole):
    """
    FastAPI dependency factory to require specific user roles.

    Returns a dependency that checks if the current user has one of the allowed roles.

    Args:
        *allowed_roles: Variable number of allowed UserRole values

    Returns:
        Dependency function that validates user role

    Example:
        @router.get("/admin-only")
        async def admin_endpoint(user: CurrentUser = Depends(require_role(UserRole.ADMIN))):
            return {"message": "Admin access granted"}
    """
    async def role_checker(
        current_user: Optional[CurrentUser] = Depends(get_current_user),
    ) -> CurrentUser:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role.value}' is not authorized to access this resource. "
                       f"Required roles: {', '.join(role.value for role in allowed_roles)}",
            )

        return current_user

    return role_checker


# ==================== Demo User Management ====================
# In-memory storage for demo users (in production, use database)
DEMO_USERS = {
    "admin@segurcaixa.es": {
        "user_id": "admin_001",
        "email": "admin@segurcaixa.es",
        "password_hash": hash_password("admin123"),
        "role": UserRole.ADMIN,
    },
    "gestor1@segurcaixa.es": {
        "user_id": "gestor_001",
        "email": "gestor1@segurcaixa.es",
        "password_hash": hash_password("gestor123"),
        "role": UserRole.GESTOR,
    },
    "gestor2@segurcaixa.es": {
        "user_id": "gestor_002",
        "email": "gestor2@segurcaixa.es",
        "password_hash": hash_password("gestor123"),
        "role": UserRole.GESTOR,
    },
    "cliente1@segurcaixa.es": {
        "user_id": "cliente_001",
        "email": "cliente1@segurcaixa.es",
        "password_hash": hash_password("cliente123"),
        "role": UserRole.CLIENTE,
    },
    "cliente2@segurcaixa.es": {
        "user_id": "cliente_002",
        "email": "cliente2@segurcaixa.es",
        "password_hash": hash_password("cliente123"),
        "role": UserRole.CLIENTE,
    },
}


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user by email and password.

    Currently uses in-memory demo users. In production, query the database.

    Args:
        email: User email address
        password: Plain text password

    Returns:
        User dict with user_id, email, role if authentication succeeds, None otherwise
    """
    user = DEMO_USERS.get(email)

    if not user:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
    }


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get user by email address.

    Args:
        email: User email address

    Returns:
        User dict if found, None otherwise
    """
    user = DEMO_USERS.get(email)

    if not user:
        return None

    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
    }


def create_demo_user(
    email: str,
    password: str,
    role: UserRole,
) -> Dict[str, Any]:
    """
    Create a new demo user (for testing).

    Args:
        email: User email address
        password: Plain text password
        role: User role

    Returns:
        Created user dict
    """
    user_id = f"{role.value.lower()}_{len(DEMO_USERS) + 1:03d}"

    user = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
    }

    DEMO_USERS[email] = user

    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
    }
