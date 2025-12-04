from typing import Optional, List
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


async def _row_to_customer(row, pool) -> dict:
    customer_id = str(row["id"])
    
    contacts_rows = await pool.fetch(
        "SELECT contact_person, is_primary FROM customer_contacts WHERE customer_id = $1 ORDER BY is_primary DESC, created_date ASC",
        row["id"]
    )
    emails_rows = await pool.fetch(
        "SELECT email, is_primary FROM customer_emails WHERE customer_id = $1 ORDER BY is_primary DESC, created_date ASC",
        row["id"]
    )
    phones_rows = await pool.fetch(
        "SELECT phone, is_primary FROM customer_phones WHERE customer_id = $1 ORDER BY is_primary DESC, created_date ASC",
        row["id"]
    )
    addresses_rows = await pool.fetch(
        "SELECT address, city, state, pincode, is_primary FROM customer_addresses WHERE customer_id = $1 ORDER BY is_primary DESC, created_date ASC",
        row["id"]
    )
    
    return {
        "id": customer_id,
        "companyName": row["company_name"],
        "contactPersons": [r["contact_person"] for r in contacts_rows],
        "emails": [r["email"] for r in emails_rows],
        "phones": [r["phone"] for r in phones_rows],
        "addresses": [
            {
                "address": r["address"],
                "city": r.get("city"),
                "state": r.get("state"),
                "pincode": r.get("pincode"),
            }
            for r in addresses_rows
        ],
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


class CustomerAddress(BaseModel):
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class CreateRequest(BaseModel):
    company_name: str
    contact_persons: List[str] = []
    emails: List[str] = []
    phones: List[str] = []
    addresses: List[CustomerAddress] = []
    gstin: Optional[str] = None
    customer_type: str = "N"
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
    contact_persons: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    phones: Optional[List[str]] = None
    addresses: Optional[List[CustomerAddress]] = None
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
    
    base_query = """
        SELECT * FROM customers
        WHERE 1=1
    """
    params = []
    param_count = 1

    if req.query:
        base_query += f"""
            AND (
                company_name ILIKE ${param_count}
                OR id IN (SELECT customer_id FROM customer_contacts WHERE contact_person ILIKE ${param_count})
                OR id IN (SELECT customer_id FROM customer_emails WHERE email ILIKE ${param_count})
                OR id IN (SELECT customer_id FROM customer_phones WHERE phone ILIKE ${param_count})
            )
        """
        params.append(f"%{req.query}%")
        param_count += 1

    if req.customer_type:
        base_query += f" AND customer_type = ${param_count}"
        params.append(req.customer_type)
        param_count += 1

    if req.status:
        base_query += f" AND status = ${param_count}"
        params.append(req.status)
        param_count += 1

    if req.city:
        base_query += f" AND id IN (SELECT customer_id FROM customer_addresses WHERE city ILIKE ${param_count})"
        params.append(f"%{req.city}%")
        param_count += 1

    count_query = f"SELECT COUNT(*) as count FROM ({base_query}) as subq"
    count_row = await pool.fetchrow(count_query, *params)
    total = count_row["count"]

    optimized_query = f"""
        WITH customer_base AS (
            {base_query}
            ORDER BY company_name ASC
            LIMIT ${param_count} OFFSET ${param_count + 1}
        ),
        contact_agg AS (
            SELECT customer_id, array_agg(DISTINCT contact_person ORDER BY contact_person) as contact_persons
            FROM customer_contacts
            WHERE customer_id IN (SELECT id FROM customer_base)
            GROUP BY customer_id
        ),
        email_agg AS (
            SELECT customer_id, array_agg(DISTINCT email ORDER BY email) as emails
            FROM customer_emails
            WHERE customer_id IN (SELECT id FROM customer_base)
            GROUP BY customer_id
        ),
        phone_agg AS (
            SELECT customer_id, array_agg(DISTINCT phone ORDER BY phone) as phones
            FROM customer_phones
            WHERE customer_id IN (SELECT id FROM customer_base)
            GROUP BY customer_id
        ),
        address_agg AS (
            SELECT customer_id, json_agg(
                json_build_object(
                    'address', address,
                    'city', city,
                    'state', state,
                    'pincode', pincode
                ) ORDER BY is_primary DESC, created_date ASC
            ) as addresses
            FROM customer_addresses
            WHERE customer_id IN (SELECT id FROM customer_base)
            GROUP BY customer_id
        )
        SELECT
            c.*,
            COALESCE(cc.contact_persons, ARRAY[]::text[]) as contact_persons,
            COALESCE(ce.emails, ARRAY[]::text[]) as emails,
            COALESCE(cp.phones, ARRAY[]::text[]) as phones,
            COALESCE(ca.addresses, '[]'::json) as addresses
        FROM customer_base c
        LEFT JOIN contact_agg cc ON c.id = cc.customer_id
        LEFT JOIN email_agg ce ON c.id = ce.customer_id
        LEFT JOIN phone_agg cp ON c.id = cp.customer_id
        LEFT JOIN address_agg ca ON c.id = ca.customer_id
        ORDER BY c.company_name ASC
    """
    
    params.extend([req.limit, req.offset])
    rows = await pool.fetch(optimized_query, *params)
    
    customers = []
    for row in rows:
        addresses_json = row["addresses"]
        if isinstance(addresses_json, str):
            import json
            addresses = json.loads(addresses_json)
        else:
            addresses = addresses_json if addresses_json else []
        
        customers.append({
            "id": str(row["id"]),
            "companyName": row["company_name"],
            "contactPersons": list(row["contact_persons"]) if row["contact_persons"] else [],
            "emails": list(row["emails"]) if row["emails"] else [],
            "phones": list(row["phones"]) if row["phones"] else [],
            "addresses": addresses,
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
        })

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

    return await _row_to_customer(row, pool)


@customer_management_router.post("/create")
async def create_customer(req: CreateRequest):
    pool = await get_db_pool()
    
    print("Backend: Received customer data:")
    print(f"  company_name: {req.company_name}")
    print(f"  contact_persons: {req.contact_persons}")
    print(f"  emails: {req.emails}")
    print(f"  phones: {req.phones}")
    print(f"  addresses: {req.addresses}")
    print(f"  gstin: {req.gstin}")
    print(f"  customer_type: {req.customer_type}")

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                insert_query = """
                    INSERT INTO customers (
                        company_name, gstin, customer_type, status, credit_limit,
                        outstanding_balance, payment_terms, notes, created_by, last_updated_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id
                """
                row = await conn.fetchrow(
                    insert_query,
                    req.company_name,
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

                for idx, contact in enumerate(req.contact_persons):
                    if contact.strip():
                        await conn.execute(
                            "INSERT INTO customer_contacts (customer_id, contact_person, is_primary) VALUES ($1, $2, $3)",
                            customer_id, contact, idx == 0
                        )

                for idx, email in enumerate(req.emails):
                    if email.strip():
                        await conn.execute(
                            "INSERT INTO customer_emails (customer_id, email, is_primary) VALUES ($1, $2, $3)",
                            customer_id, email, idx == 0
                        )

                for idx, phone in enumerate(req.phones):
                    if phone.strip():
                        await conn.execute(
                            "INSERT INTO customer_phones (customer_id, phone, is_primary) VALUES ($1, $2, $3)",
                            customer_id, phone, idx == 0
                        )

                for idx, addr in enumerate(req.addresses):
                    if addr.address.strip():
                        await conn.execute(
                            "INSERT INTO customer_addresses (customer_id, address, city, state, pincode, is_primary) VALUES ($1, $2, $3, $4, $5, $6)",
                            customer_id, addr.address, addr.city, addr.state, addr.pincode, idx == 0
                        )

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
        async with pool.acquire() as conn:
            async with conn.transaction():
                check_query = "SELECT id FROM customers WHERE id = $1"
                existing = await conn.fetchrow(check_query, req.id)
                if not existing:
                    raise HTTPException(status_code=404, detail="Customer not found")

                updates = []
                params = []
                param_count = 1

                if req.company_name is not None:
                    updates.append(f"company_name = ${param_count}")
                    params.append(req.company_name)
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

                updates.append(f"last_updated = NOW()")

                if updates:
                    update_query = f"UPDATE customers SET {', '.join(updates)} WHERE id = ${param_count}"
                    params.append(req.id)
                    await conn.execute(update_query, *params)

                if req.contact_persons is not None:
                    await conn.execute("DELETE FROM customer_contacts WHERE customer_id = $1", req.id)
                    for idx, contact in enumerate(req.contact_persons[:3]):
                        if contact.strip():
                            await conn.execute(
                                "INSERT INTO customer_contacts (customer_id, contact_person, is_primary) VALUES ($1, $2, $3)",
                                req.id, contact, idx == 0
                            )

                if req.emails is not None:
                    await conn.execute("DELETE FROM customer_emails WHERE customer_id = $1", req.id)
                    for idx, email in enumerate(req.emails[:3]):
                        if email.strip():
                            await conn.execute(
                                "INSERT INTO customer_emails (customer_id, email, is_primary) VALUES ($1, $2, $3)",
                                req.id, email, idx == 0
                            )

                if req.phones is not None:
                    await conn.execute("DELETE FROM customer_phones WHERE customer_id = $1", req.id)
                    for idx, phone in enumerate(req.phones[:3]):
                        if phone.strip():
                            await conn.execute(
                                "INSERT INTO customer_phones (customer_id, phone, is_primary) VALUES ($1, $2, $3)",
                                req.id, phone, idx == 0
                            )

                if req.addresses is not None:
                    await conn.execute("DELETE FROM customer_addresses WHERE customer_id = $1", req.id)
                    for idx, addr in enumerate(req.addresses[:5]):
                        if addr.address.strip():
                            await conn.execute(
                                "INSERT INTO customer_addresses (customer_id, address, city, state, pincode, is_primary) VALUES ($1, $2, $3, $4, $5, $6)",
                                req.id, addr.address, addr.city, addr.state, addr.pincode, idx == 0
                            )

                return {"success": True, "message": "Customer updated successfully"}

    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Duplicate entry")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@customer_management_router.post("/delete")
async def delete_customer(req: DeleteRequest):
    pool = await get_db_pool()

    try:
        check_query = "SELECT id FROM customers WHERE id = $1"
        row = await pool.fetchrow(check_query, req.id)
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")

        delete_query = "DELETE FROM customers WHERE id = $1"
        await pool.execute(delete_query, req.id)

        return {"success": True, "message": "Customer deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


class SearchCompanyRequest(BaseModel):
    query: str
    limit: int = 10


@customer_management_router.post("/search-companies")
async def search_companies(req: SearchCompanyRequest):
    pool = await get_db_pool()
    
    query = """
        SELECT DISTINCT company_name
        FROM customers
        WHERE company_name ILIKE $1
        ORDER BY company_name ASC
        LIMIT $2
    """
    
    rows = await pool.fetch(query, f"%{req.query}%", req.limit)
    companies = [row["company_name"] for row in rows]
    
    return {"companies": companies}


class GetByCompanyRequest(BaseModel):
    company_name: str


@customer_management_router.post("/get-by-company")
async def get_by_company(req: GetByCompanyRequest):
    pool = await get_db_pool()
    
    optimized_query = """
        WITH customer_base AS (
            SELECT id, company_name FROM customers
            WHERE company_name = $1 AND status = 'Active'
            LIMIT 1
        ),
        contact_agg AS (
            SELECT cc.customer_id, array_agg(DISTINCT cc.contact_person ORDER BY cc.contact_person) as contact_persons
            FROM customer_contacts cc
            WHERE cc.customer_id IN (SELECT id FROM customer_base)
            GROUP BY cc.customer_id
        ),
        email_agg AS (
            SELECT ce.customer_id, array_agg(DISTINCT ce.email ORDER BY ce.email) as emails
            FROM customer_emails ce
            WHERE ce.customer_id IN (SELECT id FROM customer_base)
            GROUP BY ce.customer_id
        ),
        phone_agg AS (
            SELECT cp.customer_id, array_agg(DISTINCT cp.phone ORDER BY cp.phone) as phones
            FROM customer_phones cp
            WHERE cp.customer_id IN (SELECT id FROM customer_base)
            GROUP BY cp.customer_id
        ),
        address_agg AS (
            SELECT ca.customer_id, array_agg(
                DISTINCT CONCAT_WS(', ',
                    ca.address,
                    NULLIF(ca.city, ''),
                    NULLIF(ca.state, ''),
                    NULLIF(ca.pincode, '')
                )
                ORDER BY CONCAT_WS(', ',
                    ca.address,
                    NULLIF(ca.city, ''),
                    NULLIF(ca.state, ''),
                    NULLIF(ca.pincode, '')
                )
            ) as addresses
            FROM customer_addresses ca
            WHERE ca.customer_id IN (SELECT id FROM customer_base)
            GROUP BY ca.customer_id
        )
        SELECT
            cb.company_name,
            COALESCE(cc.contact_persons, ARRAY[]::text[]) as contact_persons,
            COALESCE(ce.emails, ARRAY[]::text[]) as emails,
            COALESCE(cp.phones, ARRAY[]::text[]) as phones,
            COALESCE(ca.addresses, ARRAY[]::text[]) as addresses
        FROM customer_base cb
        LEFT JOIN contact_agg cc ON cb.id = cc.customer_id
        LEFT JOIN email_agg ce ON cb.id = ce.customer_id
        LEFT JOIN phone_agg cp ON cb.id = cp.customer_id
        LEFT JOIN address_agg ca ON cb.id = ca.customer_id
    """
    
    row = await pool.fetchrow(optimized_query, req.company_name)
    
    if not row:
        return {
            "company_name": req.company_name,
            "contact_persons": [],
            "emails": [],
            "phones": [],
            "addresses": []
        }
    
    return {
        "company_name": row["company_name"],
        "contact_persons": list(row["contact_persons"]) if row["contact_persons"] else [],
        "emails": list(row["emails"]) if row["emails"] else [],
        "phones": list(row["phones"]) if row["phones"] else [],
        "addresses": list(row["addresses"]) if row["addresses"] else []
    }