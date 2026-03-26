"""
Authentication API routes.

Endpoints:
- POST /api/auth/login: Login with email and password
- POST /api/auth/register: Register a new demo user
- GET /api/auth/me: Get current authenticated user info
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field

from backend.auth.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_user_by_email,
    create_demo_user,
    CurrentUser,
    Token,
    UserRole,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Not found"},
    },
)


# ==================== Request/Response Models ====================
class LoginRequest(BaseModel):
    """Login request with email and password."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class RegisterRequest(BaseModel):
    """Register request for demo users."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password (minimum 6 characters)")
    role: UserRole = Field(default=UserRole.CLIENTE, description="User role")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "newuser@segurcaixa.es",
                "password": "securepassword123",
                "role": "CLIENTE",
            }
        }


class UserInfo(BaseModel):
    """User information response."""
    user_id: str
    email: str
    role: str


class MeResponse(BaseModel):
    """Current user info response."""
    user_id: str
    email: str
    role: str
    authenticated: bool


# ==================== Login Endpoint ====================
@router.post(
    "/login",
    response_model=Token,
    summary="User Login",
    description="Authenticate with email and password to get JWT token",
)
async def login(request: LoginRequest) -> Token:
    """
    Login endpoint to get JWT access token.

    **Request Body:**
    - `email`: User email address
    - `password`: User password

    **Response:**
    - `access_token`: JWT token to use for authenticated requests
    - `token_type`: Always "bearer"
    - `user_id`: Authenticated user ID
    - `email`: Authenticated user email
    - `role`: Authenticated user role

    **Example:**
    ```bash
    curl -X POST http://localhost:8000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "admin@segurcaixa.es", "password": "admin123"}'
    ```

    **Demo Users:**
    - admin@segurcaixa.es / admin123 (ADMIN)
    - gestor1@segurcaixa.es / gestor123 (GESTOR)
    - gestor2@segurcaixa.es / gestor123 (GESTOR)
    - cliente1@segurcaixa.es / cliente123 (CLIENTE)
    - cliente2@segurcaixa.es / cliente123 (CLIENTE)
    """
    user = authenticate_user(request.email, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token
    token_data = {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"].value,
    }

    access_token = create_access_token(data=token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user["user_id"],
        email=user["email"],
        role=user["role"].value,
    )


# ==================== Register Endpoint ====================
@router.post(
    "/register",
    response_model=Token,
    summary="Register Demo User",
    description="Register a new demo user (for testing purposes)",
    status_code=status.HTTP_201_CREATED,
)
async def register(request: RegisterRequest) -> Token:
    """
    Register a new demo user.

    **Request Body:**
    - `email`: User email address
    - `password`: User password (minimum 6 characters)
    - `role`: User role (CLIENTE, GESTOR, ADMIN)

    **Response:**
    Returns JWT token immediately after registration.

    **Example:**
    ```bash
    curl -X POST http://localhost:8000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "email": "newuser@example.es",
        "password": "securepassword123",
        "role": "CLIENTE"
      }'
    ```

    **Note:** This endpoint is for demo/testing purposes. In production, user registration
    should be handled through a proper authentication provider.
    """
    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long",
        )

    # Check if user already exists
    existing_user = get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    # Create new user
    user = create_demo_user(
        email=request.email,
        password=request.password,
        role=request.role,
    )

    # Create JWT token
    token_data = {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"].value,
    }

    access_token = create_access_token(data=token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user["user_id"],
        email=user["email"],
        role=user["role"].value,
    )


# ==================== Current User Endpoint ====================
@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get Current User Info",
    description="Get information about the currently authenticated user",
)
async def get_me(
    current_user: Optional[CurrentUser] = Depends(get_current_user),
) -> MeResponse:
    """
    Get information about the currently authenticated user.

    **Headers:**
    - `Authorization: Bearer <token>`: JWT token from login endpoint

    **Response:**
    - `user_id`: User ID
    - `email`: User email
    - `role`: User role
    - `authenticated`: True if user is authenticated with valid token

    **Example:**
    ```bash
    curl -X GET http://localhost:8000/api/auth/me \
      -H "Authorization: Bearer <token>"
    ```

    **Note:** This endpoint works even without authentication (returns authenticated=false)
    if AUTH_REQUIRED is False in settings.
    """
    if current_user is None:
        return MeResponse(
            user_id="",
            email="",
            role="",
            authenticated=False,
        )

    return MeResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        role=current_user.role.value,
        authenticated=True,
    )


# ==================== Demo Endpoint ====================
@router.get(
    "/demo-users",
    response_model=dict,
    summary="Get Demo Users",
    description="Get list of available demo users for testing",
    tags=["Demo"],
)
async def get_demo_users():
    """
    Get list of available demo users for testing.

    **Response:**
    Returns a dictionary of demo users with their credentials.

    **Example:**
    ```bash
    curl -X GET http://localhost:8000/api/auth/demo-users
    ```

    **Note:** This endpoint is for development/testing purposes only.
    """
    demo_users = {
        "admin@segurcaixa.es": {
            "email": "admin@segurcaixa.es",
            "password": "admin123",
            "role": "ADMIN",
        },
        "gestor1@segurcaixa.es": {
            "email": "gestor1@segurcaixa.es",
            "password": "gestor123",
            "role": "GESTOR",
        },
        "gestor2@segurcaixa.es": {
            "email": "gestor2@segurcaixa.es",
            "password": "gestor123",
            "role": "GESTOR",
        },
        "cliente1@segurcaixa.es": {
            "email": "cliente1@segurcaixa.es",
            "password": "cliente123",
            "role": "CLIENTE",
        },
        "cliente2@segurcaixa.es": {
            "email": "cliente2@segurcaixa.es",
            "password": "cliente123",
            "role": "CLIENTE",
        },
    }

    return {
        "demo_users": demo_users,
        "note": "These credentials are for development/testing purposes only",
    }
