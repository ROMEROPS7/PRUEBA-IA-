# Authentication Quick Start Guide

Get up and running with JWT authentication in 5 minutes.

## 1. Start the Server

```bash
python run.py
```

The server will start at `http://localhost:8000`

## 2. Get a Token (Login)

Open a terminal and run:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@segurcaixa.es",
    "password": "admin123"
  }'
```

You'll get a response like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "admin_001",
  "email": "admin@segurcaixa.es",
  "role": "ADMIN"
}
```

**Copy the `access_token` value.**

## 3. Use the Token

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <paste_token_here>"
```

You'll see your user info:
```json
{
  "user_id": "admin_001",
  "email": "admin@segurcaixa.es",
  "role": "ADMIN",
  "authenticated": true
}
```

## 4. Test with Swagger UI (Recommended)

1. Open: http://localhost:8000/api/docs
2. Find the `/api/auth/login` endpoint
3. Click "Try it out"
4. Enter email: `admin@segurcaixa.es` and password: `admin123`
5. Click "Execute"
6. Copy the `access_token` from the response
7. Click the "Authorize" button (top right)
8. Paste: `Bearer <token>`
9. Click "Authorize", then "Close"
10. Now try other endpoints - they'll automatically include your token!

## 5. Run Automated Tests

```bash
python test_auth.py
```

This will test all authentication flows and show you what's working.

---

## Demo Users for Testing

| Email | Password | Role |
|-------|----------|------|
| admin@segurcaixa.es | admin123 | ADMIN |
| gestor1@segurcaixa.es | gestor123 | GESTOR |
| gestor2@segurcaixa.es | gestor123 | GESTOR |
| cliente1@segurcaixa.es | cliente123 | CLIENTE |
| cliente2@segurcaixa.es | cliente123 | CLIENTE |

## 5-Minute Examples

### JavaScript
```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@segurcaixa.es',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.access_token;

// Use token
const userResponse = await fetch('http://localhost:8000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const user = await userResponse.json();
console.log(user);
```

### Python
```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login',
  json={
    'email': 'admin@segurcaixa.es',
    'password': 'admin123'
  }
)
token = response.json()['access_token']

# Use token
user = requests.get('http://localhost:8000/api/auth/me',
  headers={'Authorization': f'Bearer {token}'}
).json()
print(user)
```

## Protecting Your Own Endpoints

### Optional Authentication (Recommended for now)
```python
from fastapi import APIRouter, Depends
from backend.auth.auth import get_current_user, CurrentUser
from typing import Optional

router = APIRouter()

@router.get("/my-endpoint")
async def my_endpoint(current_user: Optional[CurrentUser] = Depends(get_current_user)):
    if current_user:
        return {"message": f"Hello {current_user.email}"}
    else:
        return {"message": "Hello anonymous user"}
```

### Require Authentication (Stricter)
```python
@router.get("/protected")
async def protected_endpoint(
    current_user: Optional[CurrentUser] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Login required")
    return {"message": f"Hello {current_user.email}"}
```

### Require Specific Role
```python
from backend.auth.auth import require_role, UserRole

@router.get("/admin-only")
async def admin_endpoint(
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN))
):
    return {"message": "Admin access granted"}
```

## API Endpoints

### Available Now

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login` | Get JWT token |
| `POST /api/auth/register` | Register new user |
| `GET /api/auth/me` | Get current user |
| `GET /api/auth/demo-users` | List demo users |

### Full Documentation
See: `AUTHENTICATION.md`

## Common Questions

**Q: How do I store the token?**
A: In development, print it. In production, use secure HTTP-only cookies or localStorage.

**Q: How long is the token valid?**
A: 24 hours by default (configurable in settings)

**Q: How do I log out?**
A: Delete the token from your client (there's no server logout needed)

**Q: Can I use this with React/Vue/Angular?**
A: Yes! Send the token in the `Authorization: Bearer <token>` header for all requests.

**Q: Is this production-ready?**
A: Almost! Change `JWT_SECRET_KEY` in settings.py for production.

## Troubleshooting

**"Invalid email or password"**
- Check spelling of email and password
- Use demo users from table above

**"Invalid or expired token"**
- Token expired (24 hours)
- Token is malformed
- Solution: Login again

**"Cannot import auth"**
- Run: `pip install -r requirements.txt`
- Restart the server

## Next Steps

1. ✓ You've tested authentication
2. Read: `AUTHENTICATION.md` for full details
3. Update your endpoints to use authentication
4. Set production configuration
5. Deploy!

## Still Have Questions?

- Full docs: `AUTHENTICATION.md`
- Implementation details: `JWT_IMPLEMENTATION_SUMMARY.md`
- Verification: `AUTH_IMPLEMENTATION_CHECKLIST.md`
- API docs: http://localhost:8000/api/docs

---

**That's it! You're ready to use JWT authentication.**
