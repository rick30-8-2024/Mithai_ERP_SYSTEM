from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError
from datetime import date, datetime
import bcrypt

user_management_router = APIRouter(prefix="/api/user-management", tags=["user_management"])


class UserPermissionsModel(BaseModel):
    permissions: List[str]


class User(BaseModel):
    id: str
    username: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    status: str
    permissions: List[str]
    joined_date: str
    last_login: Optional[str] = None
    is_active: bool


def _row_to_user(row) -> dict:
    return {
        "id": str(row["id"]),
        "username": row["username"],
        "name": row["name"],
        "email": row["email"],
        "phone": row.get("phone"),
        "role": row["role"],
        "department": row.get("department"),
        "status": row["status"],
        "permissions": row.get("permissions") or [],
        "joinedDate": row["joined_date"].isoformat() if row.get("joined_date") else None,
        "lastLogin": row["last_login"].isoformat() if row.get("last_login") else None,
        "isActive": row["is_active"],
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    limit: int = 100
    offset: int = 0


class GetRequest(BaseModel):
    username: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    status: str = "Active"
    permissions: List[str] = []
    joined_date: Optional[str] = None
    is_active: bool = True
    last_updated_by: Optional[str] = None


class UpdateRequest(BaseModel):
    id: str
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    last_updated_by: Optional[str] = None


class DeleteRequest(BaseModel):
    id: str


@user_management_router.post("/list")
async def list_users(req: ListRequest):
    pool = await get_db_pool()
    
    query = """
        SELECT id, username, name, email, phone, role, department, status, 
               permissions, joined_date, last_login, is_active
        FROM users
        WHERE 1=1
    """
    params = []
    param_count = 1

    # Search filter
    if req.query:
        query += f" AND (username ILIKE ${param_count} OR name ILIKE ${param_count} OR email ILIKE ${param_count} OR role ILIKE ${param_count} OR department ILIKE ${param_count})"
        params.append(f"%{req.query}%")
        param_count += 1

    # Role filter
    if req.role:
        query += f" AND role = ${param_count}"
        params.append(req.role)
        param_count += 1

    # Department filter
    if req.department:
        query += f" AND department = ${param_count}"
        params.append(req.department)
        param_count += 1

    # Status filter
    if req.status:
        query += f" AND status = ${param_count}"
        params.append(req.status)
        param_count += 1

    # Get total count
    count_query = f"SELECT COUNT(*) as count FROM ({query}) as subq"
    count_row = await pool.fetchrow(count_query, *params)
    total = count_row["count"]

    # Add ordering and pagination
    query += f" ORDER BY joined_date DESC, name ASC LIMIT ${param_count} OFFSET ${param_count + 1}"
    params.extend([req.limit, req.offset])

    rows = await pool.fetch(query, *params)
    users = [_row_to_user(row) for row in rows]

    return {
        "items": users,
        "total": total,
        "limit": req.limit,
        "offset": req.offset,
    }


@user_management_router.post("/get")
async def get_user(req: GetRequest):
    if not req.username and not req.id:
        raise HTTPException(status_code=400, detail="Provide either username or id")

    pool = await get_db_pool()

    if req.username:
        query = """
            SELECT id, username, name, email, phone, role, department, status, 
                   permissions, joined_date, last_login, is_active
            FROM users WHERE username = $1
        """
        row = await pool.fetchrow(query, req.username)
    else:
        query = """
            SELECT id, username, name, email, phone, role, department, status, 
                   permissions, joined_date, last_login, is_active
            FROM users WHERE id = $1
        """
        row = await pool.fetchrow(query, req.id)

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return _row_to_user(row)


@user_management_router.post("/create")
async def create_user(req: CreateRequest):
    pool = await get_db_pool()

    try:
        # Hash the password
        hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Parse joined_date if provided
        joined_date = datetime.strptime(req.joined_date, "%Y-%m-%d").date() if req.joined_date else date.today()
        
        # Insert user
        insert_query = """
            INSERT INTO users (
                username, password, name, email, phone, role, department,
                status, permissions, joined_date, is_active, last_updated_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            ) RETURNING id
        """
        row = await pool.fetchrow(
            insert_query,
            req.username,
            hashed_password,
            req.name,
            req.email,
            req.phone,
            req.role,
            req.department,
            req.status,
            req.permissions,
            joined_date,
            req.is_active,
            req.last_updated_by,
        )
        user_id = row["id"]

        return {
            "success": True,
            "id": str(user_id),
            "message": "User created successfully",
        }

    except UniqueViolationError as e:
        if "username" in str(e):
            raise HTTPException(status_code=400, detail="Username already exists")
        elif "email" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        else:
            raise HTTPException(status_code=400, detail="Duplicate entry")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@user_management_router.post("/update")
async def update_user(req: UpdateRequest):
    pool = await get_db_pool()

    try:
        # Check if user exists
        check_query = "SELECT id FROM users WHERE id = $1"
        existing = await pool.fetchrow(check_query, req.id)
        if not existing:
            raise HTTPException(status_code=404, detail="User not found")

        # Build update query dynamically
        updates = []
        params = []
        param_count = 1

        if req.username is not None:
            updates.append(f"username = ${param_count}")
            params.append(req.username)
            param_count += 1
        if req.password is not None:
            hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            updates.append(f"password = ${param_count}")
            params.append(hashed_password)
            param_count += 1
        if req.name is not None:
            updates.append(f"name = ${param_count}")
            params.append(req.name)
            param_count += 1
        if req.email is not None:
            updates.append(f"email = ${param_count}")
            params.append(req.email)
            param_count += 1
        if req.phone is not None:
            updates.append(f"phone = ${param_count}")
            params.append(req.phone)
            param_count += 1
        if req.role is not None:
            updates.append(f"role = ${param_count}")
            params.append(req.role)
            param_count += 1
        if req.department is not None:
            updates.append(f"department = ${param_count}")
            params.append(req.department)
            param_count += 1
        if req.status is not None:
            updates.append(f"status = ${param_count}")
            params.append(req.status)
            param_count += 1
        if req.permissions is not None:
            updates.append(f"permissions = ${param_count}")
            params.append(req.permissions)
            param_count += 1
        if req.is_active is not None:
            updates.append(f"is_active = ${param_count}")
            params.append(req.is_active)
            param_count += 1
        if req.last_updated_by is not None:
            updates.append(f"last_updated_by = ${param_count}")
            params.append(req.last_updated_by)
            param_count += 1

        # Always update last_updated timestamp
        updates.append(f"last_updated = NOW()")

        if updates:
            update_query = f"UPDATE users SET {', '.join(updates)} WHERE id = ${param_count}"
            params.append(req.id)
            await pool.execute(update_query, *params)

        return {"success": True, "message": "User updated successfully"}

    except UniqueViolationError as e:
        if "username" in str(e):
            raise HTTPException(status_code=400, detail="Username already exists")
        elif "email" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        else:
            raise HTTPException(status_code=400, detail="Duplicate entry")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@user_management_router.post("/delete")
async def delete_user(req: DeleteRequest):
    pool = await get_db_pool()

    try:
        # Check if user exists
        check_query = "SELECT id FROM users WHERE id = $1"
        row = await pool.fetchrow(check_query, req.id)
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete user
        delete_query = "DELETE FROM users WHERE id = $1"
        await pool.execute(delete_query, req.id)

        return {"success": True, "message": "User deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@user_management_router.post("/toggle-status")
async def toggle_user_status(req: GetRequest):
    """Toggle user active status"""
    if not req.id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    pool = await get_db_pool()
    
    try:
        # Get current status
        check_query = "SELECT is_active, status FROM users WHERE id = $1"
        row = await pool.fetchrow(check_query, req.id)
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_is_active = not row["is_active"]
        new_status = "Active" if new_is_active else "Inactive"
        
        # Update status
        update_query = "UPDATE users SET is_active = $1, status = $2, last_updated = NOW() WHERE id = $3"
        await pool.execute(update_query, new_is_active, new_status, req.id)
        
        return {
            "success": True,
            "message": f"User status updated to {new_status}",
            "isActive": new_is_active
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")