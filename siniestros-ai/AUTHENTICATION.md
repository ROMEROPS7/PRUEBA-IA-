# JWT Authentication System

Complete JWT authentication system for SegurCaixa Adeslas claims management system.

## Overview

The authentication system provides:
- **JWT token-based authentication** using python-jose
- **Password hashing** with bcrypt (passlib)
- **Role-based access control (RBAC)** with three user roles: CLIENTE, GESTOR, ADMIN
- **FastAPI dependency injection** for protecting endpoints
- **Demo users** pre-configured for testing
- **Optional authentication** for backward compatibility (AUTH_REQUIRED=False)

## Installation

Dependencies are already added to `requirements.txt`:
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

JWT settings are configured in `backend/config/settings.py`:

```python
# Authentication Configuration
AUTH_REQUIRED: bool = False  # Set to False for backward compatibility
JWT_SECRET_KEY: str = "segurcaixa-adeslas-jwt-secret-2024-change-in-production"
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_HOURS: int = 24
```

### Production Security

For production, change these settings:
1. Set `JWT_SECRET_KEY` to a strong random secret
2. Set `AUTH_REQUIRED` to `True` to enforce authentication
3. Use environment variables or a secrets manager instead of hardcoded values

Example `.env` file:
```
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
AUTH_REQUIRED=true
```

## API Endpoints

### 1. Login - Get JWT Token

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@segurcaixa.es",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "admin_001",
  "email": "admin@segurcaixa.es",
  "role": "ADMIN"
}
```

### 2. Register - Create Demo User

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@segurcaixa.es",
  "password": "securepassword123",
  "role": "CLIENTE"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "cliente_001",
  "email": "newuser@segurcaixa.es",
  "role": "CLIENTE"
}
```

### 3. Get Current User Info

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "admin_001",
  "email": "admin@segurcaixa.es",
  "role": "ADMIN",
  "authenticated": true
}
```

### 4. Get Demo Users (for testing)

```
GET /api/auth/demo-users
```

**Response:**
```json
{
  "demo_users": {
    "admin@segurcaixa.es": {
      "email": "admin@segurcaixa.es",
      "password": "admin123",
      "role": "ADMIN"
    },
    "gestor1@segurcaixa.es": {
      "email": "gestor1@segurcaixa.es",
      "password": "gestor123",
      "role": "GESTOR"
    },
    ...
  },
  "note": "These credentials are for development/testing purposes only"
}
```

## Demo Users

Pre-configured users for testing:

| Email | Password | Role |
|-------|----------|------|
| admin@segurcaixa.es | admin123 | ADMIN |
| gestor1@segurcaixa.es | gestor123 | GESTOR |
| gestor2@segurcaixa.es | gestor123 | GESTOR |
| cliente1@segurcaixa.es | cliente123 | CLIENTE |
| cliente2@segurcaixa.es | cliente123 | CLIENTE |

## Usage Examples

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@segurcaixa.es",
    "password": "admin123"
  }'
```

**Use token to call authenticated endpoint:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

### JavaScript/Fetch Examples

**Login:**
```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@segurcaixa.es',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.access_token;

// Store token in localStorage
localStorage.setItem('token', token);
```

**Use token in subsequent requests:**
```javascript
const response = await fetch('http://localhost:8000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const userData = await response.json();
console.log(userData);
```

### Python Examples

**Login:**
```python
import requests

response = requests.post(
    'http://localhost:8000/api/auth/login',
    json={
        'email': 'admin@segurcaixa.es',
        'password': 'admin123'
    }
)

data = response.json()
token = data['access_token']
```

**Use token:**
```python
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/auth/me', headers=headers)
user_data = response.json()
print(user_data)
```

## Protecting Endpoints

### Basic Authentication (Optional)

```python
from fastapi import APIRouter, Depends
from backend.auth.auth import get_current_user, CurrentUser

router = APIRouter()

@router.get("/protected")
async def protected_endpoint(
    current_user: Optional[CurrentUser] = Depends(get_current_user)
):
    if current_user is None:
        return {"message": "No authentication provided"}

    return {
        "message": f"Hello {current_user.email}",
        "user_id": current_user.user_id,
        "role": current_user.role.value
    }
```

### Require Authentication

```python
from backend.auth.auth import require_role, UserRole

@router.get("/admin-only")
async def admin_endpoint(
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN))
):
    return {"message": "Admin access granted"}
```

### Multiple Roles

```python
@router.get("/gestors-only")
async def gestor_endpoint(
    current_user: CurrentUser = Depends(
        require_role(UserRole.ADMIN, UserRole.GESTOR)
    )
):
    return {"message": "Gestor or Admin access"}
```

## File Structure

```
backend/
├── auth/
│   ├── __init__.py           # Package init
│   ├── auth.py               # Core JWT and password utilities
│   └── routes.py             # Authentication API endpoints
└── config/
    └── settings.py           # Configuration with JWT settings
```

## Key Components

### `backend/auth/auth.py`

**Classes:**
- `UserRole(Enum)`: CLIENTE, GESTOR, ADMIN
- `TokenData`: JWT token payload
- `Token`: Token response model
- `CurrentUser`: Current authenticated user model

**Functions:**
- `hash_password(password)`: Hash password with bcrypt
- `verify_password(plain, hashed)`: Verify password
- `create_access_token(data, expires_delta)`: Create JWT token
- `decode_token(token)`: Decode and verify JWT token
- `get_current_user(credentials)`: FastAPI dependency for optional auth
- `require_role(*roles)`: FastAPI dependency factory for role-based access
- `authenticate_user(email, password)`: Authenticate user
- `get_user_by_email(email)`: Get user by email
- `create_demo_user(email, password, role)`: Create new demo user

### `backend/auth/routes.py`

**Endpoints:**
- `POST /api/auth/login`: Login with email/password
- `POST /api/auth/register`: Register new demo user
- `GET /api/auth/me`: Get current user info
- `GET /api/auth/demo-users`: List demo users (dev only)

### `backend/config/settings.py`

**JWT Settings:**
- `AUTH_REQUIRED`: Enable/disable authentication enforcement
- `JWT_SECRET_KEY`: Secret key for signing tokens
- `JWT_ALGORITHM`: Algorithm (default: HS256)
- `JWT_EXPIRATION_HOURS`: Token expiry time (default: 24 hours)

## Backward Compatibility

The authentication system is optional by default:
- `AUTH_REQUIRED = False` in settings
- Endpoints work without authentication tokens
- `get_current_user` returns `None` when no token provided
- Existing endpoints don't break

To enable authentication enforcement:
1. Set `AUTH_REQUIRED = True` in settings or `.env`
2. Update endpoints to require authentication
3. Clients must provide valid JWT tokens

## Security Considerations

1. **Secret Key**: Change `JWT_SECRET_KEY` in production
2. **HTTPS**: Always use HTTPS in production (not HTTP)
3. **Token Storage**: Store tokens securely (HttpOnly cookies or secure localStorage)
4. **Token Expiry**: Tokens expire after 24 hours (configurable)
5. **Password Hashing**: Passwords are hashed with bcrypt (12 rounds)
6. **Demo Users**: Remove demo user accounts in production

## Testing

### API Documentation

The authentication endpoints are fully documented in the interactive API:
```
http://localhost:8000/api/docs
```

### Test Login Flow

1. Open `http://localhost:8000/api/docs`
2. Find `/api/auth/login` endpoint
3. Click "Try it out"
4. Enter credentials: `admin@segurcaixa.es` / `admin123`
5. Execute and copy the `access_token`
6. Navigate to `/api/auth/me`
7. Click "Authorize" and paste the token
8. Execute to see authenticated response

## Troubleshooting

### Invalid Token Error
- Token may have expired (24 hours default)
- Token may be malformed
- Secret key mismatch
- Solution: Login again to get a fresh token

### Authentication Not Working
- Check if `AUTH_REQUIRED` is set correctly
- Verify Authorization header format: `Authorization: Bearer <token>`
- Check that `JWT_SECRET_KEY` matches across all instances
- Verify token hasn't expired

### Import Errors
- Install dependencies: `pip install -r requirements.txt`
- Verify `backend/auth/__init__.py` exists
- Check Python path includes project root

## Future Enhancements

Potential improvements for production:
1. **Database Integration**: Store users in database instead of memory
2. **Refresh Tokens**: Implement token refresh for longer sessions
3. **OAuth2**: Add OAuth2 integration (Google, Microsoft, etc.)
4. **API Keys**: Support long-lived API keys for service-to-service auth
5. **2FA**: Two-factor authentication support
6. **Audit Logging**: Log authentication events
7. **Session Management**: Revoke tokens and manage active sessions
8. **Rate Limiting**: Limit login attempts

## License

Part of SegurCaixa Adeslas Claims Management System
