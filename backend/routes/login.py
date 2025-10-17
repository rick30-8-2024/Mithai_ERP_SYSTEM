from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
import bcrypt

login_router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@login_router.post("/login")
async def login(login_data: LoginRequest):
    """
    Login endpoint to authenticate a user
    
    Verifies:
    - Username exists in the database
    - Password matches the stored password
    
    Returns user information if authentication is successful
    """
    try:
        print(f"[LOGIN] Received login request for username: {login_data.username}")
        
        # Get database connection pool
        print(f"[LOGIN] Getting database connection pool...")
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            print(f"[LOGIN] Database connection acquired")
            
            print(f"[LOGIN] Fetching user '{login_data.username}' from database...")
            user = await conn.fetchrow(
                "SELECT id, username, password, role, is_active, status, permissions FROM users WHERE username = $1",
                login_data.username
            )
            
            # Check if user exists
            if not user:
                print(f"[LOGIN ERROR] User '{login_data.username}' not found")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid username or password"
                )
            
            # Check if user account is active
            if not user.get('is_active', True):
                print(f"[LOGIN ERROR] User '{login_data.username}' account is deactivated")
                raise HTTPException(
                    status_code=403,
                    detail="Your account has been deactivated. Please contact your administrator."
                )
            
            # Check if user status is Active
            user_status = user.get('status', 'Active')
            if user_status != 'Active':
                print(f"[LOGIN ERROR] User '{login_data.username}' status is '{user_status}'")
                raise HTTPException(
                    status_code=403,
                    detail=f"Your account is {user_status}. Please contact your administrator."
                )
            
            print(f"[LOGIN] User found and active, verifying password...")
            
            print(f"[LOGIN DEBUG] Stored password from DB: {user['password'][:50]}...")
            print(f"[LOGIN DEBUG] Stored password type: {type(user['password'])}")
            print(f"[LOGIN DEBUG] Stored password starts with: {user['password'][:4]}")
            
            # Verify password using bcrypt
            password_bytes = login_data.password.encode('utf-8')
            stored_password_bytes = user['password'].encode('utf-8')
            
            print(f"[LOGIN DEBUG] Encoded stored password (first 50 bytes): {stored_password_bytes[:50]}")
            print(f"[LOGIN DEBUG] Encoded stored password type: {type(stored_password_bytes)}")
            
            if not bcrypt.checkpw(password_bytes, stored_password_bytes):
                print(f"[LOGIN ERROR] Password mismatch for user '{login_data.username}'")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid username or password"
                )
            
            print(f"[LOGIN] Password verified successfully for user '{login_data.username}'")
        
        print(f"[LOGIN] Login successful for user '{login_data.username}' with role '{user['role']}'")
        return {
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": str(user['id']),
                "username": user['username'],
                "role": user['role'],
                "permissions": user.get('permissions', [])
            }
        }
    
    except HTTPException as he:
        print(f"[LOGIN ERROR] HTTPException: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        print(f"[LOGIN ERROR] Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[LOGIN ERROR] Traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during login: {str(e)}"
        )
@login_router.post("/users/list")
async def list_users():
    """
    List all users for worker assignment dropdown
    """
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            users = await conn.fetch(
                "SELECT id, username, role FROM users ORDER BY username"
            )
            
            return {
                "users": [
                    {
                        "id": str(user["id"]),
                        "username": user["username"],
                        "role": user["role"]
                    }
                    for user in users
                ]
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch users: {str(e)}"
        )
