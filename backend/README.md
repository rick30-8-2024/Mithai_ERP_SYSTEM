# Mithai ERP System - Backend API

FastAPI backend server for the Mithai ERP System.

## Project Structure

```
backend/
├── app.py                 # Main application file
├── requirements.txt       # Python dependencies
├── routes/               # API route modules
│   ├── __init__.py
│   ├── login.py         # Authentication - Login endpoints
│   └── signup.py        # Authentication - Signup endpoints
└── README.md            # This file
```

## Features

- ✅ FastAPI framework with automatic OpenAPI documentation
- ✅ CORS middleware for frontend integration
- ✅ Modular route structure
- ✅ Custom 404 error handler
- ✅ Login and Signup endpoints with validation
- ✅ Pydantic models for request/response validation
- ✅ Health check endpoint

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

#### Development Mode (with auto-reload):
```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI schema**: http://localhost:8000/openapi.json

## Available Endpoints

### Root
- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email

### Error Handling
- All undefined routes return a custom 404 JSON response

## Sample API Requests

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Signup
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

## Adding New Routes

1. Create a new route file in the `routes/` directory:
```python
# routes/new_route.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/endpoint")
async def endpoint():
    return {"message": "Hello"}
```

2. Import and include the router in [`app.py`](app.py:1):
```python
from routes import login, signup, new_route

app.include_router(new_route.router, prefix="/api/new", tags=["New"])
```

3. Update `routes/__init__.py`:
```python
__all__ = ["login", "signup", "new_route"]
```

## Environment Variables

Create a `.env` file in the backend directory for configuration:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Testing

To test the API:

1. Using the interactive docs at `/docs`
2. Using curl or Postman
3. Using pytest (install with `pip install pytest httpx`):
```bash
pytest
```

## Next Steps

- [ ] Implement database integration (SQLAlchemy/MongoDB)
- [ ] Add JWT authentication logic
- [ ] Implement password hashing with bcrypt
- [ ] Add email verification functionality
- [ ] Create more route modules (products, orders, etc.)
- [ ] Add logging and monitoring
- [ ] Write unit and integration tests
- [ ] Set up database migrations with Alembic

## Notes

- The current implementation uses sample/mock data
- Database connections need to be configured
- JWT token generation needs to be implemented
- Password hashing should be added before production use
- Email service integration required for verification emails

## License

Part of the Mithai ERP System project.