from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError, ForeignKeyViolationError
from decimal import Decimal
from datetime import date, datetime

sales_orders_router = APIRouter(prefix="/api/sales-orders", tags=["sales_orders"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


async def _update_customer_outstanding(conn, company_name: str, amount_change: float):
    """
    Update customer outstanding balance by company name.
    amount_change can be positive (add to outstanding) or negative (deduct from outstanding).
    Uses COALESCE in SQL to properly handle NULL values.
    """
    customer_query = "SELECT id FROM customers WHERE company_name = $1 AND status = 'Active' LIMIT 1"
    customer = await conn.fetchrow(customer_query, company_name)
    
    if customer:
        await conn.execute(
            """
            UPDATE customers
            SET outstanding_balance = GREATEST(COALESCE(outstanding_balance, 0) + $1, 0),
                last_updated = NOW()
            WHERE id = $2
            """,
            amount_change,
            customer["id"]
        )
        return True
    return False


class SalesOrderItem(BaseModel):
    name: str
    sku: Optional[str] = None
    quantity: float
    unit: str
    weight: float
    weight_unit: str
    unit_price: float
    total_price: float


def _row_to_sales_order(row, items: List[dict] = None) -> dict:
    return {
        "id": str(row["id"]),
        "orderNumber": row["order_number"],
        "customerCompany": row["customer_company"],
        "customerName": row["customer_name"],
        "customerContact": row.get("customer_contact"),
        "customerEmail": row.get("customer_email"),
        "customerAddress": row.get("customer_address"),
        "orderDate": row["order_date"].isoformat() if row.get("order_date") else None,
        "dueDate": row["due_date"].isoformat() if row.get("due_date") else None,
        "deliveryDate": row["delivery_date"].isoformat() if row.get("delivery_date") else None,
        "status": row["status"],
        "priority": row["priority"],
        "totalAmount": _to_float(row["total_amount"]),
        "paidAmount": _to_float(row["paid_amount"]),
        "paymentStatus": row["payment_status"],
        "notes": row.get("notes"),
        "salesRep": row.get("sales_rep"),
        "discount": _to_float(row["discount"]),
        "taxes": _to_float(row["taxes"]),
        "finalAmount": _to_float(row["final_amount"]),
        "createdBy": row.get("created_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
        "items": items or [],
    }


def _row_to_so_item(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "sku": row.get("sku"),
        "quantity": _to_float(row["quantity"]),
        "unit": row["unit"],
        "weight": _to_float(row["weight"]),
        "weightUnit": row["weight_unit"],
        "unitPrice": _to_float(row["unit_price"]),
        "totalPrice": _to_float(row["total_price"]),
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    status: Optional[str] = None
    payment_status: Optional[str] = None
    priority: Optional[str] = None
    customer: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetRequest(BaseModel):
    order_number: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    order_number: str
    customer_company: str
    customer_name: str
    customer_contact: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    order_date: str
    due_date: str
    delivery_date: Optional[str] = None
    status: str = "Pending"
    priority: str = "Medium"
    total_amount: float = 0
    paid_amount: float = 0
    payment_status: str = "Pending"
    notes: Optional[str] = None
    sales_rep: Optional[str] = None
    discount: float = 0
    taxes: float = 0
    final_amount: float = 0
    created_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    items: List[SalesOrderItem] = []


class UpdateRequest(BaseModel):
    id: str
    order_number: Optional[str] = None
    customer_company: Optional[str] = None
    customer_name: Optional[str] = None
    customer_contact: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    order_date: Optional[str] = None
    due_date: Optional[str] = None
    delivery_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    sales_rep: Optional[str] = None
    discount: Optional[float] = None
    taxes: Optional[float] = None
    final_amount: Optional[float] = None
    last_updated_by: Optional[str] = None
    items: Optional[List[SalesOrderItem]] = None


class DeleteRequest(BaseModel):
    id: str


@sales_orders_router.get("/generate-number")
async def generate_order_number():
    """
    Generate the next sales order number in format SO-YYYY-XXX
    where YYYY is the current year and XXX starts at 001.
    """
    pool = await get_db_pool()
    current_year = datetime.now().year
    prefix = f"SO-{current_year}-"
    
    try:
        # Find the highest order number for the current year
        query = """
            SELECT order_number FROM sales_orders
            WHERE order_number LIKE $1
            ORDER BY order_number DESC
            LIMIT 1
        """
        row = await pool.fetchrow(query, f"{prefix}%")
        
        if row:
            # Extract the numeric part and increment
            last_number = row["order_number"]
            try:
                # Get the numeric suffix after SO-YYYY-
                numeric_part = last_number.split("-")[-1]
                next_num = int(numeric_part) + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1
        
        # Format with minimum 3 digits
        formatted_num = str(next_num).zfill(3)
        new_order_number = f"{prefix}{formatted_num}"
        
        return {"order_number": new_order_number}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate order number: {str(e)}")


@sales_orders_router.post("/list")
async def list_sales_orders(req: ListRequest):
    pool = await get_db_pool()
    
    query = """
        SELECT * FROM sales_orders
        WHERE 1=1
    """
    params = []
    param_count = 1

    # Search filter
    if req.query:
        query += f" AND (order_number ILIKE ${param_count} OR customer_company ILIKE ${param_count} OR customer_name ILIKE ${param_count})"
        params.append(f"%{req.query}%")
        param_count += 1

    # Status filter
    if req.status:
        query += f" AND status = ${param_count}"
        params.append(req.status)
        param_count += 1

    # Payment status filter
    if req.payment_status:
        query += f" AND payment_status = ${param_count}"
        params.append(req.payment_status)
        param_count += 1

    # Priority filter
    if req.priority:
        query += f" AND priority = ${param_count}"
        params.append(req.priority)
        param_count += 1

    # Customer filter
    if req.customer:
        query += f" AND customer_company ILIKE ${param_count}"
        params.append(f"%{req.customer}%")
        param_count += 1

    # Get total count
    count_query = f"SELECT COUNT(*) as count FROM ({query}) as subq"
    count_row = await pool.fetchrow(count_query, *params)
    total = count_row["count"]

    # Add ordering and pagination
    query += f" ORDER BY order_date DESC, created_date DESC LIMIT ${param_count} OFFSET ${param_count + 1}"
    params.extend([req.limit, req.offset])

    rows = await pool.fetch(query, *params)

    # Fetch items for each sales order
    items_map = {}
    if rows:
        so_ids = [row["id"] for row in rows]
        items_query = """
            SELECT * FROM sales_order_items
            WHERE sales_order_id = ANY($1)
            ORDER BY sales_order_id
        """
        items_rows = await pool.fetch(items_query, so_ids)
        for item_row in items_rows:
            so_id = str(item_row["sales_order_id"])
            if so_id not in items_map:
                items_map[so_id] = []
            items_map[so_id].append(_row_to_so_item(item_row))

    orders = [_row_to_sales_order(row, items_map.get(str(row["id"]), [])) for row in rows]

    return {
        "items": orders,
        "total": total,
        "limit": req.limit,
        "offset": req.offset,
    }


@sales_orders_router.post("/get")
async def get_sales_order(req: GetRequest):
    if not req.order_number and not req.id:
        raise HTTPException(status_code=400, detail="Provide either order_number or id")

    pool = await get_db_pool()

    if req.order_number:
        query = "SELECT * FROM sales_orders WHERE order_number = $1"
        row = await pool.fetchrow(query, req.order_number)
    else:
        query = "SELECT * FROM sales_orders WHERE id = $1"
        row = await pool.fetchrow(query, req.id)

    if not row:
        raise HTTPException(status_code=404, detail="Sales order not found")

    # Fetch items
    items_query = "SELECT * FROM sales_order_items WHERE sales_order_id = $1"
    items_rows = await pool.fetch(items_query, row["id"])
    items = [_row_to_so_item(item_row) for item_row in items_rows]

    return _row_to_sales_order(row, items)


@sales_orders_router.post("/create")
async def create_sales_order(req: CreateRequest):
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                order_date = datetime.strptime(req.order_date, "%Y-%m-%d").date() if req.order_date else None
                due_date = datetime.strptime(req.due_date, "%Y-%m-%d").date() if req.due_date else None
                delivery_date = datetime.strptime(req.delivery_date, "%Y-%m-%d").date() if req.delivery_date else None
                
                insert_query = """
                    INSERT INTO sales_orders (
                        order_number, customer_company, customer_name, customer_contact,
                        customer_email, customer_address, order_date, due_date, delivery_date,
                        status, priority, total_amount, paid_amount, payment_status,
                        notes, sales_rep, discount, taxes, final_amount,
                        created_by, last_updated_by
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
                    ) RETURNING id
                """
                row = await conn.fetchrow(
                    insert_query,
                    req.order_number,
                    req.customer_company,
                    req.customer_name,
                    req.customer_contact,
                    req.customer_email,
                    req.customer_address,
                    order_date,
                    due_date,
                    delivery_date,
                    req.status,
                    req.priority,
                    req.total_amount,
                    req.paid_amount,
                    req.payment_status,
                    req.notes,
                    req.sales_rep,
                    req.discount,
                    req.taxes,
                    req.final_amount,
                    req.created_by,
                    req.last_updated_by,
                )
                so_id = row["id"]

                if req.items:
                    items_query = """
                        INSERT INTO sales_order_items (
                            sales_order_id, name, sku, quantity, unit, weight, weight_unit,
                            unit_price, total_price
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """
                    for item in req.items:
                        await conn.execute(
                            items_query,
                            so_id,
                            item.name,
                            item.sku,
                            item.quantity,
                            item.unit,
                            item.weight,
                            item.weight_unit,
                            item.unit_price,
                            item.total_price,
                        )

                if req.final_amount > 0 and req.customer_company:
                    await _update_customer_outstanding(conn, req.customer_company, req.final_amount)

                return {
                    "success": True,
                    "id": str(so_id),
                    "message": "Sales order created successfully",
                }

    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Sales order number already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@sales_orders_router.post("/update")
async def update_sales_order(req: UpdateRequest):
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                check_query = "SELECT id, customer_company, final_amount, payment_status FROM sales_orders WHERE id = $1"
                existing = await conn.fetchrow(check_query, req.id)
                if not existing:
                    raise HTTPException(status_code=404, detail="Sales order not found")

                old_payment_status = existing["payment_status"]
                old_final_amount = _to_float(existing["final_amount"])
                customer_company = existing["customer_company"]

                updates = []
                params = []
                param_count = 1

                if req.order_number is not None:
                    updates.append(f"order_number = ${param_count}")
                    params.append(req.order_number)
                    param_count += 1
                if req.customer_company is not None:
                    updates.append(f"customer_company = ${param_count}")
                    params.append(req.customer_company)
                    param_count += 1
                if req.customer_name is not None:
                    updates.append(f"customer_name = ${param_count}")
                    params.append(req.customer_name)
                    param_count += 1
                if req.customer_contact is not None:
                    updates.append(f"customer_contact = ${param_count}")
                    params.append(req.customer_contact)
                    param_count += 1
                if req.customer_email is not None:
                    updates.append(f"customer_email = ${param_count}")
                    params.append(req.customer_email)
                    param_count += 1
                if req.customer_address is not None:
                    updates.append(f"customer_address = ${param_count}")
                    params.append(req.customer_address)
                    param_count += 1
                if req.order_date is not None:
                    updates.append(f"order_date = ${param_count}")
                    params.append(datetime.strptime(req.order_date, "%Y-%m-%d").date())
                    param_count += 1
                if req.due_date is not None:
                    updates.append(f"due_date = ${param_count}")
                    params.append(datetime.strptime(req.due_date, "%Y-%m-%d").date())
                    param_count += 1
                if req.delivery_date is not None:
                    updates.append(f"delivery_date = ${param_count}")
                    params.append(datetime.strptime(req.delivery_date, "%Y-%m-%d").date())
                    param_count += 1
                if req.status is not None:
                    updates.append(f"status = ${param_count}")
                    params.append(req.status)
                    param_count += 1
                if req.priority is not None:
                    updates.append(f"priority = ${param_count}")
                    params.append(req.priority)
                    param_count += 1
                if req.total_amount is not None:
                    updates.append(f"total_amount = ${param_count}")
                    params.append(req.total_amount)
                    param_count += 1
                if req.paid_amount is not None:
                    updates.append(f"paid_amount = ${param_count}")
                    params.append(req.paid_amount)
                    param_count += 1
                if req.payment_status is not None:
                    updates.append(f"payment_status = ${param_count}")
                    params.append(req.payment_status)
                    param_count += 1
                if req.notes is not None:
                    updates.append(f"notes = ${param_count}")
                    params.append(req.notes)
                    param_count += 1
                if req.sales_rep is not None:
                    updates.append(f"sales_rep = ${param_count}")
                    params.append(req.sales_rep)
                    param_count += 1
                if req.discount is not None:
                    updates.append(f"discount = ${param_count}")
                    params.append(req.discount)
                    param_count += 1
                if req.taxes is not None:
                    updates.append(f"taxes = ${param_count}")
                    params.append(req.taxes)
                    param_count += 1
                if req.final_amount is not None:
                    updates.append(f"final_amount = ${param_count}")
                    params.append(req.final_amount)
                    param_count += 1
                if req.last_updated_by is not None:
                    updates.append(f"last_updated_by = ${param_count}")
                    params.append(req.last_updated_by)
                    param_count += 1

                updates.append(f"last_updated = NOW()")

                if updates:
                    update_query = f"UPDATE sales_orders SET {', '.join(updates)} WHERE id = ${param_count}"
                    params.append(req.id)
                    await conn.execute(update_query, *params)

                if req.items is not None:
                    await conn.execute("DELETE FROM sales_order_items WHERE sales_order_id = $1", req.id)
                    
                    if req.items:
                        items_query = """
                            INSERT INTO sales_order_items (
                                sales_order_id, name, sku, quantity, unit, weight, weight_unit,
                                unit_price, total_price
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        """
                        for item in req.items:
                            await conn.execute(
                                items_query,
                                req.id,
                                item.name,
                                item.sku,
                                item.quantity,
                                item.unit,
                                item.weight,
                                item.weight_unit,
                                item.unit_price,
                                item.total_price,
                            )

                new_payment_status = req.payment_status if req.payment_status is not None else old_payment_status
                if old_payment_status != 'Paid' and new_payment_status == 'Paid' and customer_company:
                    await _update_customer_outstanding(conn, customer_company, -old_final_amount)

                return {"success": True, "message": "Sales order updated successfully"}

    except UniqueViolationError:
        raise HTTPException(status_code=400, detail="Sales order number already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@sales_orders_router.post("/delete")
async def delete_sales_order(req: DeleteRequest):
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                check_query = "SELECT id, customer_company, final_amount, payment_status FROM sales_orders WHERE id = $1"
                row = await conn.fetchrow(check_query, req.id)
                if not row:
                    raise HTTPException(status_code=404, detail="Sales order not found")

                customer_company = row["customer_company"]
                final_amount = _to_float(row["final_amount"])
                payment_status = row["payment_status"]

                delete_query = "DELETE FROM sales_orders WHERE id = $1"
                await conn.execute(delete_query, req.id)

                if payment_status != 'Paid' and final_amount > 0 and customer_company:
                    await _update_customer_outstanding(conn, customer_company, -final_amount)

                return {"success": True, "message": "Sales order deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")