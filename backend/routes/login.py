from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool

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
            
            # Fetch user from database
            print(f"[LOGIN] Fetching user '{login_data.username}' from database...")
            user = await conn.fetchrow(
                "SELECT id, username, password, role FROM users WHERE username = $1",
                login_data.username
            )
            
            # Check if user exists
            if not user:
                print(f"[LOGIN ERROR] User '{login_data.username}' not found")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid username or password"
                )
            
            print(f"[LOGIN] User found, verifying password...")
            
            # Verify password (no encryption as requested)
            if user['password'] != login_data.password:
                print(f"[LOGIN ERROR] Password mismatch for user '{login_data.username}'")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid username or password"
                )
            
            print(f"[LOGIN] Password verified successfully for user '{login_data.username}'")
        
        # Return success response with user information
        print(f"[LOGIN] Login successful for user '{login_data.username}' with role '{user['role']}'")
        return {
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": str(user['id']),
                "username": user['username'],
                "role": user['role']
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