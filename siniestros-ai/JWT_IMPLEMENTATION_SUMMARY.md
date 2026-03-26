# JWT Authentication System - Implementation Summary

## Overview

A complete JWT authentication system has been implemented for the SegurCaixa Adeslas claims management system. The system provides:

- JWT token-based authentication using python-jose
- Password hashing using passlib/bcrypt
- Role-based access control (RBAC) with three user roles: CLIENTE, GESTOR, ADMIN
- FastAPI dependency injection for protecting endpoints
- Demo users pre-configured for testing
- Optional authentication for backward compatibility

## Files Created

### 1. `backend/auth/__init__.py`
- Empty package initialization file
- Marks `backend.auth` as a Python package

### 2. `backend/auth/auth.py` (9.4 KB)
Core JWT and authentication utilities.

**Enums:**
- `UserRole`: CLIENTE, GESTOR, ADMIN

**Models:**
- `TokenData`: JWT token payload
- `Token`: Token response model
- `CurrentUser`: Current authenticated user model

**Password Utilities:**
- `hash_password(password)`: Hash password with bcrypt (12 rounds)
- `verify_password(plain, hashed)`: Verify password against hash

**JWT Functions:**
- `create_access_token(data, expires_delta)`: Create JWT token
- `decode_token(token)`: Decode and verify JWT token

**FastAPI Dependencies:**
- `get_current_user(credentials)`: Optional authentication dependency
- `require_role(*roles)`: Role-based access control dependency factory

**User Management (Demo):**
- `authenticate_user(email, password)`: Authenticate user by email/password
- `get_user_by_email(email)`: Get user by email
- `create_demo_user(email, password, role)`: Create new demo user

**Demo Users:**
- admin@segurcaixa.es / admin123 (ADMIN)
- gestor1@segurcaixa.es / gestor123 (GESTOR)
- gestor2@segurcaixa.es / gestor123 (GESTOR)
- cliente1@segurcaixa.es / cliente123 (CLIENTE)
- cliente2@segurcaixa.es / cliente123 (CLIENTE)

### 3. `backend/auth/routes.py` (8.3 KB)
Authentication API endpoints.

**Endpoints:**
- `POST /api/auth/login`: Login with email/password → returns JWT token
- `POST /api/auth/register`: Register new demo user → returns JWT token
- `GET /api/auth/me`: Get current authenticated user info
- `GET /api/auth/demo-users`: List demo users (development only)

**Features:**
- Full docstrings with examples
- Input validation
- Comprehensive error handling
- Demo user credentials listed in endpoint documentation

### 4. `backend/config/settings.py` (Updated)
Added JWT configuration:

```python
# Authentication Configuration
AUTH_REQUIRED: bool = False  # Set to False for backward compatibility
JWT_SECRET_KEY: str = "segurcaixa-adeslas-jwt-secret-2024-change-in-production"
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_HOURS: int = 24
```

### 5. `backend/main.py` (Updated)
Integrated authentication router:

```python
from backend.auth import routes as auth_routes

# In route inclusion section:
app.include_router(auth_routes.router)
```

### 6. `requirements.txt` (Updated)
Added authentication dependencies:

```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

### 7. `AUTHENTICATION.md` (New)
Comprehensive documentation including:
- Overview and features
- Installation instructions
- Configuration guide
- API endpoint documentation
- Demo users table
- Usage examples (cURL, JavaScript, Python)
- How to protect endpoints
- File structure
- Security considerations
- Testing instructions
- Troubleshooting guide
- Future enhancements

### 8. `test_auth.py` (New)
Test script demonstrating:
- Getting demo users list
- Login with valid credentials
- Getting current user info
- Testing invalid tokens
- Testing endpoints without tokens
- Registering new users
- Testing different user roles

**Run with:** `python test_auth.py` (after starting the server)

### 9. `JWT_IMPLEMENTATION_SUMMARY.md` (This File)
Implementation summary and quick reference

## Implementation Details

### Token Structure

JWT tokens contain:
```json
{
  "user_id": "admin_001",
  "email": "admin@segurcaixa.es",
  "role": "ADMIN",
  "exp": 1711411200  // Unix timestamp for expiration
}
```

### Token Expiration

- Default: 24 hours
- Configurable via `JWT_EXPIRATION_HOURS` setting
- Tokens are verified on each API call

### Password Security

- Hash algorithm: bcrypt
- Rounds: 12 (configurable via passlib)
- Verification: Constant-time comparison
- Never stored in plain text

### Role-Based Access Control

Three user roles:
1. **CLIENTE**: Client/customer users
2. **GESTOR**: Claims manager/handler
3. **ADMIN**: System administrator

Example endpoint protection:
```python
@router.get("/admin-only")
async def admin_endpoint(
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN))
):
    return {"message": "Admin access granted"}
```

### Backward Compatibility

- `AUTH_REQUIRED = False` by default
- Endpoints work without authentication
- `get_current_user` returns `None` when no token provided
- Existing endpoints don't break
- Can be enabled anytime by setting `AUTH_REQUIRED = True`

## Usage Quick Start

### 1. Start the Server
```bash
python run.py
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@segurcaixa.es",
    "password": "admin123"
  }'
```

### 3. Use Token
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

### 4. Run Tests
```bash
python test_auth.py
```

### 5. View API Documentation
Open: http://localhost:8000/api/docs

## Configuration

### Development (Current)
```python
AUTH_REQUIRED = False  # Optional auth
JWT_SECRET_KEY = "segurcaixa-adeslas-jwt-secret-2024-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
```

### Production Recommendations
```python
AUTH_REQUIRED = True  # Enforce auth
JWT_SECRET_KEY = <strong-random-secret-from-env>
JWT_ALGORITHM = "HS256"  # or RS256 for asymmetric
JWT_EXPIRATION_HOURS = 12  # or 24
```

Use environment variables:
```bash
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
AUTH_REQUIRED=true
```

## Protecting Existing Endpoints

To add authentication to an existing endpoint:

**Optional (returns None if no token):**
```python
@router.get("/api/my-endpoint")
async def my_endpoint(
    current_user: Optional[CurrentUser] = Depends(get_current_user)
):
    if current_user:
        print(f"Authenticated as {current_user.email}")
    else:
        print("No authentication provided")
```

**Required:**
```python
@router.get("/api/protected")
async def protected_endpoint(
    current_user: CurrentUser = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user": current_user}
```

**Role-based:**
```python
@router.get("/api/admin-only")
async def admin_endpoint(
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN))
):
    return {"message": "Admin only"}
```

## Testing

### Interactive Testing (Recommended)
1. Start server: `python run.py`
2. Open: http://localhost:8000/api/docs
3. Click "Authorize" button
4. Get token from `/api/auth/login` endpoint
5. Paste token in Authorize dialog
6. Test other endpoints with authorization

### Automated Testing
```bash
python test_auth.py
```

### cURL Testing
See `AUTHENTICATION.md` for detailed examples

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens signed with secret key
- [x] Token expiration enforced
- [x] Role-based access control implemented
- [ ] Change JWT_SECRET_KEY in production
- [ ] Enable AUTH_REQUIRED in production
- [ ] Use HTTPS in production (not HTTP)
- [ ] Move secrets to environment variables
- [ ] Implement audit logging
- [ ] Regular security updates for dependencies

## Common Issues

### "Invalid or expired token"
- Token has expired (24 hours default)
- Token was malformed
- Secret key mismatch
- **Solution:** Login again to get fresh token

### "Missing authentication token"
- No Authorization header provided
- Header format is incorrect: must be `Authorization: Bearer <token>`
- **Solution:** Provide valid token in Authorization header

### "User role not authorized"
- User role doesn't have permission for endpoint
- **Solution:** Use correct user or change role requirements

### Import errors
- Dependencies not installed: `pip install -r requirements.txt`
- Python path not set correctly
- **Solution:** Reinstall dependencies and verify project structure

## File Locations

```
/sessions/jolly-relaxed-cannon/mnt/SEGURCAIXAADESLAS IA/siniestros-ia/
├── backend/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── auth.py           (9.4 KB)
│   │   └── routes.py          (8.3 KB)
│   ├── config/
│   │   └── settings.py        (UPDATED)
│   └── main.py                (UPDATED)
├── AUTHENTICATION.md          (NEW - Full documentation)
├── test_auth.py               (NEW - Test script)
└── JWT_IMPLEMENTATION_SUMMARY.md (THIS FILE)
```

## Next Steps

1. **Test the implementation:** Run `python test_auth.py`
2. **Review documentation:** Open `AUTHENTICATION.md`
3. **Update existing endpoints:** Add authentication as needed
4. **Configure for production:** Update settings and environment
5. **Implement database storage:** Replace demo users with database
6. **Add audit logging:** Track authentication events
7. **Consider refresh tokens:** Extend session management

## Support

For detailed information, see:
- `AUTHENTICATION.md`: Complete API documentation and examples
- `test_auth.py`: Working examples of all authentication flows
- `backend/auth/auth.py`: Source code with detailed docstrings
- `backend/auth/routes.py`: Endpoint implementations with examples

## Summary

✓ JWT authentication system fully implemented
✓ Role-based access control (RBAC) configured
✓ FastAPI dependencies for endpoint protection
✓ Backward compatible (optional authentication)
✓ Demo users pre-configured
✓ Comprehensive documentation provided
✓ Test script included
✓ Ready for production deployment (after configuration)
