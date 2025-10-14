from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import re
import bcrypt
from database.db_pool import get_db_pool

signup_router = APIRouter()

class SignupRequest(BaseModel):
    username: str
    password: str
    role: str = "user"  # Default role

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password with the following requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
    
    return True, ""

@signup_router.post("/signup")
async def signup(signup_data: SignupRequest):
    """
    Signup endpoint to register a new user
    
    Validates:
    - Username uniqueness
    - Password requirements (uppercase, lowercase, digit, special char, min length)
    
    Stores user data in the database without encryption (as requested)
    """
    try:
        print(f"[SIGNUP] Received signup request for username: {signup_data.username}")
        signup_data.role = str(signup_data.role).lower()
        print(f"[SIGNUP] Role: {signup_data.role}")
        
        # Validate password
        print(f"[SIGNUP] Validating password...")
        is_valid, error_message = validate_password(signup_data.password)
        if not is_valid:
            print(f"[SIGNUP ERROR] Password validation failed: {error_message}")
            raise HTTPException(status_code=400, detail=error_message)
        
        print(f"[SIGNUP] Password validation passed")
        
        # Get database connection pool
        print(f"[SIGNUP] Getting database connection pool...")
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            print(f"[SIGNUP] Database connection acquired")
            
            # Check if username already exists
            print(f"[SIGNUP] Checking if username '{signup_data.username}' already exists...")
            existing_user = await conn.fetchrow(
                "SELECT username FROM users WHERE username = $1",
                signup_data.username
            )
            
            if existing_user:
                print(f"[SIGNUP ERROR] Username '{signup_data.username}' already exists")
                raise HTTPException(
                    status_code=409,
                    detail="Username already exists. Please choose a different username."
                )
            
            print(f"[SIGNUP] Username is unique")
            
            # Check if role exists in Role table
            print(f"[SIGNUP] Checking if role '{signup_data.role}' exists...")
            role_exists = await conn.fetchrow(
                "SELECT role FROM Role WHERE role = $1",
                signup_data.role
            )
            
            if not role_exists:
                print(f"[SIGNUP ERROR] Role '{signup_data.role}' does not exist in the system")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid role: {signup_data.role}. Role does not exist in the system."
                )
            
            print(f"[SIGNUP] Role validation passed")
            
            # Hash password with bcrypt
            print(f"[SIGNUP] Hashing password with bcrypt...")
            password_bytes = signup_data.password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            # Insert new user into database
            print(f"[SIGNUP] Inserting user into database...")
            await conn.execute(
                """
                INSERT INTO users (username, password, role)
                VALUES ($1, $2, $3)
                """,
                signup_data.username,
                hashed_password,  # Store hashed password
                signup_data.role
            )
            
            print(f"[SIGNUP] User '{signup_data.username}' successfully registered")
        
        return {
            "status": "success",
            "message": "User registered successfully",
            "username": signup_data.username
        }
    
    except HTTPException as he:
        print(f"[SIGNUP ERROR] HTTPException: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        print(f"[SIGNUP ERROR] Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[SIGNUP ERROR] Traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during signup: {str(e)}"
        )