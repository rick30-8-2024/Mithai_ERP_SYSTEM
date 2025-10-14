from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError
from decimal import Decimal

customer_management_router = APIRouter(prefix="/api/customer-management", tags=["customer_management"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


def _row_to_customer(row) -> dict:
    return {
        "id": str(row["id"]),
        "companyName": row["company_name"],
        "contactPerson": row["contact_person"],
        "email": row.get("email"),
        "phone": row.get("phone"),
        "address": row.get("address"),
        "city": row.get("city"),
        "state": row.get("state"),
        "pincode": row.get("pincode"),
        "gstin": row.get("gstin"),
        "customerType": row["customer_type"],
        "status": row["status"],
        "creditLimit": _to_float(row.get("credit_limit")),
        "outstandingBalance": _to_float(row.get("outstanding_balance")),
        "paymentTerms": row.get("payment_terms"),
        "notes": row.get("notes"),
        "createdBy": row.get("created_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    customer_type: Optional[str] = None
    status: Optional[str] = None
    city: Optional[str] = None
    limit: int = 100
    offset: int = 0


class GetRequest(BaseModel):
    id: str


class CreateRequest(BaseModel):
    company_name: str
    contact_person: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    customer_type: str = "Regular"
    status: str = "Active"
    credit_limit: float = 0
    outstanding_balance: float = 0
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    last_updated_by: Optional[str] = None


class UpdateRequest(BaseModel):
    id: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    customer_type: Optional[str] = None
    status: Optional[str] = None
    credit_limit: Optional[float] = None
    outstanding_balance: Optional[float] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    last_updated_by: Optional[str] = None


class DeleteRequest(BaseModel):
    id: str


@customer_management_router.post("/list")
async def list_customers(req: ListRequest):
    pool = await get_db_pool()
    
    query = """
        SELECT * FROM customers
        WHERE 1=1
    """
    params = []
    param_count = 1

    # Search filter
    if req.query:
        query += f" AND (company_name ILIKE ${param_count} OR contact_person ILIKE ${param_count} OR email ILIKE ${param_count} OR phone ILIKE ${param_count} OR city ILIKE ${param_count})"
        params.append(f"%{req.query}%")
        param_count += 1

    # Customer type filter
    if req.customer_type:
        query += f" AND customer_type = ${param_count}"
        params.append(req.customer_type)
        param_count += 1

    # Status filter
    if req.status:
        query += f" AND status = ${param_count}"
        params.append(req.status)
        param_count += 1

    # City filter
    if req.city:
        query += f" AND city ILIKE ${param_count}"
        params.append(f"%{req.city}%")
        param_count += 1

    # Get total count
    count_query = f"SELECT COUNT(*) as count FROM ({query}) as subq"
    count_row = await pool.fetchrow(count_query, *params)
    total = count_row["count"]

    # Add ordering and pagination
    query += f" ORDER BY company_name ASC LIMIT ${param_count} OFFSET ${param_count + 1}"
    params.extend([req.limit, req.offset])

    rows = await pool.fetch(query, *params)
    customers = [_row_to_customer(row) for row in rows]

    return {
        "items": customers,
        "total": total,
        "limit": req.limit,
        "offset": req.offset,
    }


@customer_management_router.post("/get")
async def get_customer(req: GetRequest):
    pool = await get_db_pool()

    query = "SELECT * FROM customers WHERE id = $1"
    row = await pool.fetchrow(query, req.id)

    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")

    return _row_to_customer(row)


@customer_management_router.post("/create")
async def create_customer(req: CreateRequest):
    pool = await get_db_pool()

    try:
        # Insert customer
        insert_query = """
            INSERT INTO customers (
                company_name, contact_person, email, phone, address, city, state,
                pincode, gstin, customer_type, status, credit_limit, outstanding_balance,
                payment_terms, notes, created_by, last_updated_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) RETURNING id
        """
        row = await pool.fetchrow(
            insert_query,
            req.company_name,
            req.contact_person,
            req.email,
            req.phone,
            req.address,
            req.city,
            req.state,
            req.pincode,
            req.gstin,
            req.customer_type,
            req.status,
            req.credit_limit,
            req.outstanding_balance,
            req.payment_terms,
            req.notes,
            req.created_by,
            req.last_updated_by,
        )
        customer_id = row["id"]

        return {
            "success": True,
            "id": str(customer_id),
            "message": "Customer created successfully",
        }

    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Customer already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@customer_management_router.post("/update")
async def update_customer(req: UpdateRequest):
    pool = await get_db_pool()

    try:
        # Check if customer exists
        check_query = "SELECT id FROM customers WHERE id = $1"
        existing = await pool.fetchrow(check_query, req.id)
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Build update query dynamically
        updates = []
        params = []
        param_count = 1

        if req.company_name is not None:
            updates.append(f"company_name = ${param_count}")
            params.append(req.company_name)
            param_count += 1
        if req.contact_person is not None:
            updates.append(f"contact_person = ${param_count}")
            params.append(req.contact_person)
            param_count += 1
        if req.email is not None:
            updates.append(f"email = ${param_count}")
            params.append(req.email)
            param_count += 1
        if req.phone is not None:
            updates.append(f"phone = ${param_count}")
            params.append(req.phone)
            param_count += 1
        if req.address is not None:
            updates.append(f"address = ${param_count}")
            params.append(req.address)
            param_count += 1
        if req.city is not None:
            updates.append(f"city = ${param_count}")
            params.append(req.city)
            param_count += 1
        if req.state is not None:
            updates.append(f"state = ${param_count}")
            params.append(req.state)
            param_count += 1
        if req.pincode is not None:
            updates.append(f"pincode = ${param_count}")
            params.append(req.pincode)
            param_count += 1
        if req.gstin is not None:
            updates.append(f"gstin = ${param_count}")
            params.append(req.gstin)
            param_count += 1
        if req.customer_type is not None:
            updates.append(f"customer_type = ${param_count}")
            params.append(req.customer_type)
            param_count += 1
        if req.status is not None:
            updates.append(f"status = ${param_count}")
            params.append(req.status)
            param_count += 1
        if req.credit_limit is not None:
            updates.append(f"credit_limit = ${param_count}")
            params.append(req.credit_limit)
            param_count += 1
        if req.outstanding_balance is not None:
            updates.append(f"outstanding_balance = ${param_count}")
            params.append(req.outstanding_balance)
            param_count += 1
        if req.payment_terms is not None:
            updates.append(f"payment_terms = ${param_count}")
            params.append(req.payment_terms)
            param_count += 1
        if req.notes is not None:
            updates.append(f"notes = ${param_count}")
            params.append(req.notes)
            param_count += 1
        if req.last_updated_by is not None:
            updates.append(f"last_updated_by = ${param_count}")
            params.append(req.last_updated_by)
            param_count += 1

        # Always update last_updated timestamp
        updates.append(f"last_updated = NOW()")

        if updates:
            update_query = f"UPDATE customers SET {', '.join(updates)} WHERE id = ${param_count}"
            params.append(req.id)
            await pool.execute(update_query, *params)

        return {"success": True, "message": "Customer updated successfully"}

    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Duplicate entry")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@customer_management_router.post("/delete")
async def delete_customer(req: DeleteRequest):
    pool = await get_db_pool()

    try:
        # Check if customer exists
        check_query = "SELECT id FROM customers WHERE id = $1"
        row = await pool.fetchrow(check_query, req.id)
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Delete customer
        delete_query = "DELETE FROM customers WHERE id = $1"
        await pool.execute(delete_query, req.id)

        return {"success": True, "message": "Customer deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")