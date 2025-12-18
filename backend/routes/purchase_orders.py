from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError, ForeignKeyViolationError
from decimal import Decimal
from datetime import date, datetime

purchase_orders_router = APIRouter(prefix="/api/purchase-orders", tags=["purchase_orders"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


class PurchaseOrderItem(BaseModel):
    name: str
    type: str  # 'Raw Material' or 'Finished Good'
    category: str
    quantity: float
    unit: str
    rate: float
    total_amount: float
    supplier: Optional[str] = None
    supplier_contact: Optional[str] = None
    supplier_email: Optional[str] = None
    brand: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    packing_weight: Optional[float] = None
    packing_unit: Optional[str] = None
    expected_inward_date: Optional[str] = None
    delivery_status: str = 'Pending'
    quality_status: str = 'Pending'


def _row_to_purchase_order(row, items: List[dict] = None) -> dict:
    return {
        "id": str(row["id"]),
        "poNumber": row["po_number"],
        "supplier": row["supplier"],
        "supplierContact": row.get("supplier_contact"),
        "supplierEmail": row.get("supplier_email"),
        "supplierAddress": row.get("supplier_address"),
        "orderDate": row["order_date"].isoformat() if row.get("order_date") else None,
        "expectedDeliveryDate": row["expected_delivery_date"].isoformat() if row.get("expected_delivery_date") else None,
        "actualDeliveryDate": row["actual_delivery_date"].isoformat() if row.get("actual_delivery_date") else None,
        "status": row["status"],
        "priority": row["priority"],
        "totalAmount": _to_float(row["total_amount"]),
        "paidAmount": _to_float(row["paid_amount"]),
        "paymentTerms": row.get("payment_terms"),
        "notes": row.get("notes"),
        "approvedBy": row.get("approved_by"),
        "createdBy": row.get("created_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
        "items": items or [],
    }


def _row_to_po_item(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "type": row["type"],
        "category": row["category"],
        "quantity": _to_float(row["quantity"]),
        "unit": row["unit"],
        "rate": _to_float(row["rate"]),
        "totalAmount": _to_float(row["total_amount"]),
        "supplier": row.get("supplier"),
        "supplierContact": row.get("supplier_contact"),
        "supplierEmail": row.get("supplier_email"),
        "brand": row.get("brand"),
        "grade": row.get("grade"),
        "description": row.get("description"),
        "packingWeight": _to_float(row.get("packing_weight")) if row.get("packing_weight") else None,
        "packingUnit": row.get("packing_unit"),
        "expectedInwardDate": row["expected_inward_date"].isoformat() if row.get("expected_inward_date") else None,
        "deliveryStatus": row["delivery_status"],
        "qualityStatus": row["quality_status"],
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    status: Optional[str] = None
    supplier: Optional[str] = None
    priority: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetRequest(BaseModel):
    po_number: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    po_number: str
    supplier: str
    supplier_contact: Optional[str] = None
    supplier_email: Optional[str] = None
    supplier_address: Optional[str] = None
    order_date: str
    expected_delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    status: str = "Draft"
    priority: str = "Medium"
    total_amount: float = 0
    paid_amount: float = 0
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[str] = None
    created_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    items: List[PurchaseOrderItem] = []


class UpdateRequest(BaseModel):
    id: str
    po_number: Optional[str] = None
    supplier: Optional[str] = None
    supplier_contact: Optional[str] = None
    supplier_email: Optional[str] = None
    supplier_address: Optional[str] = None
    order_date: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    items: Optional[List[PurchaseOrderItem]] = None


class DeleteRequest(BaseModel):
    id: str


@purchase_orders_router.get("/generate-number")
async def generate_po_number():
    """
    Generate the next purchase order number in format PO-YYYY-XXX
    where YYYY is the current year and XXX starts at 001.
    When the year changes, the counter resets to 001.
    """
    pool = await get_db_pool()
    current_year = datetime.now().year
    prefix = f"PO-{current_year}-"
    
    try:
        async with pool.acquire() as conn:
            # Find the highest order number for the current year
            query = """
                SELECT po_number FROM purchase_orders
                WHERE po_number LIKE $1
                ORDER BY po_number DESC
                LIMIT 1
            """
            row = await conn.fetchrow(query, f"{prefix}%")
            
            if row:
                # Extract the numeric part and increment
                last_number = row["po_number"]
                try:
                    # Get the numeric suffix after PO-YYYY-
                    numeric_part = last_number.split("-")[-1]
                    next_num = int(numeric_part) + 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1
            
            # Format with minimum 3 digits
            formatted_num = str(next_num).zfill(3)
            new_po_number = f"{prefix}{formatted_num}"
            
            return {"po_number": new_po_number}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PO number: {str(e)}")


@purchase_orders_router.post("/list")
async def list_purchase_orders(req: ListRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        query_parts = []
        params = []
        param_idx = 1

        # Base query
        base_query = """
            SELECT 
                po.id, po.po_number, po.supplier, po.supplier_contact, 
                po.supplier_email, po.supplier_address, po.order_date,
                po.expected_delivery_date, po.actual_delivery_date,
                po.status, po.priority, po.total_amount, po.paid_amount,
                po.payment_terms, po.notes, po.approved_by, po.created_by,
                po.created_date, po.last_updated, po.last_updated_by
            FROM purchase_orders po
            WHERE 1=1
        """

        # Add filters
        if req.query:
            query_parts.append(f"AND (po.po_number ILIKE ${param_idx} OR po.supplier ILIKE ${param_idx})")
            params.append(f"%{req.query}%")
            param_idx += 1

        if req.status:
            query_parts.append(f"AND po.status = ${param_idx}")
            params.append(req.status)
            param_idx += 1

        if req.supplier:
            query_parts.append(f"AND po.supplier = ${param_idx}")
            params.append(req.supplier)
            param_idx += 1

        if req.priority:
            query_parts.append(f"AND po.priority = ${param_idx}")
            params.append(req.priority)
            param_idx += 1

        # Build final query
        final_query = base_query + " ".join(query_parts) + f" ORDER BY po.created_date DESC LIMIT ${param_idx} OFFSET ${param_idx + 1}"
        params.extend([req.limit, req.offset])

        rows = await conn.fetch(final_query, *params)
        
        result = []
        for row in rows:
            # Fetch items for this purchase order
            items_rows = await conn.fetch(
                """
                SELECT * FROM purchase_order_items 
                WHERE purchase_order_id = $1
                ORDER BY name
                """,
                row["id"]
            )
            items = [_row_to_po_item(item_row) for item_row in items_rows]
            result.append(_row_to_purchase_order(row, items))

        # Get total count
        count_query = "SELECT COUNT(*) FROM purchase_orders po WHERE 1=1 " + " ".join(query_parts)
        count_params = params[:-2]  # Exclude limit and offset
        total = await conn.fetchval(count_query, *count_params)

        return {"items": result, "total": total, "limit": req.limit, "offset": req.offset}


@purchase_orders_router.post("/get")
async def get_purchase_order(req: GetRequest):
    if not req.po_number and not req.id:
        raise HTTPException(status_code=400, detail="Either po_number or id must be provided")

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if req.id:
            row = await conn.fetchrow("SELECT * FROM purchase_orders WHERE id = $1", req.id)
        else:
            row = await conn.fetchrow("SELECT * FROM purchase_orders WHERE po_number = $1", req.po_number)

        if not row:
            raise HTTPException(status_code=404, detail="Purchase order not found")

        # Fetch items
        items_rows = await conn.fetch(
            "SELECT * FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY name",
            row["id"]
        )
        items = [_row_to_po_item(item_row) for item_row in items_rows]

        return _row_to_purchase_order(row, items)


@purchase_orders_router.post("/create")
async def create_purchase_order(req: CreateRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            # Start transaction
            async with conn.transaction():
                # Insert purchase order
                po_id = await conn.fetchval(
                    """
                    INSERT INTO purchase_orders (
                        po_number, supplier, supplier_contact, supplier_email, supplier_address,
                        order_date, expected_delivery_date, actual_delivery_date,
                        status, priority, total_amount, paid_amount, payment_terms,
                        notes, approved_by, created_by, last_updated_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                    RETURNING id
                    """,
                    req.po_number, req.supplier, req.supplier_contact, req.supplier_email,
                    req.supplier_address, req.order_date, req.expected_delivery_date,
                    req.actual_delivery_date, req.status, req.priority, req.total_amount,
                    req.paid_amount, req.payment_terms, req.notes, req.approved_by,
                    req.created_by, req.last_updated_by
                )

                # Insert items
                for item in req.items:
                    await conn.execute(
                        """
                        INSERT INTO purchase_order_items (
                            purchase_order_id, name, type, category, quantity, unit, rate,
                            total_amount, supplier, supplier_contact, supplier_email,
                            brand, grade, description, packing_weight, packing_unit,
                            expected_inward_date, delivery_status, quality_status
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                        """,
                        po_id, item.name, item.type, item.category, item.quantity, item.unit,
                        item.rate, item.total_amount, item.supplier, item.supplier_contact,
                        item.supplier_email, item.brand, item.grade, item.description,
                        item.packing_weight, item.packing_unit, item.expected_inward_date,
                        item.delivery_status, item.quality_status
                    )

                return {"success": True, "id": str(po_id), "message": "Purchase order created successfully"}

        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Purchase order number already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@purchase_orders_router.post("/update")
async def update_purchase_order(req: UpdateRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            # Start transaction
            async with conn.transaction():
                # Build update query dynamically
                updates = []
                params = []
                param_idx = 1

                if req.po_number is not None:
                    updates.append(f"po_number = ${param_idx}")
                    params.append(req.po_number)
                    param_idx += 1

                if req.supplier is not None:
                    updates.append(f"supplier = ${param_idx}")
                    params.append(req.supplier)
                    param_idx += 1

                if req.supplier_contact is not None:
                    updates.append(f"supplier_contact = ${param_idx}")
                    params.append(req.supplier_contact)
                    param_idx += 1

                if req.supplier_email is not None:
                    updates.append(f"supplier_email = ${param_idx}")
                    params.append(req.supplier_email)
                    param_idx += 1

                if req.supplier_address is not None:
                    updates.append(f"supplier_address = ${param_idx}")
                    params.append(req.supplier_address)
                    param_idx += 1

                if req.order_date is not None:
                    updates.append(f"order_date = ${param_idx}")
                    params.append(req.order_date)
                    param_idx += 1

                if req.expected_delivery_date is not None:
                    updates.append(f"expected_delivery_date = ${param_idx}")
                    params.append(req.expected_delivery_date)
                    param_idx += 1

                if req.actual_delivery_date is not None:
                    updates.append(f"actual_delivery_date = ${param_idx}")
                    params.append(req.actual_delivery_date)
                    param_idx += 1

                if req.status is not None:
                    updates.append(f"status = ${param_idx}")
                    params.append(req.status)
                    param_idx += 1

                if req.priority is not None:
                    updates.append(f"priority = ${param_idx}")
                    params.append(req.priority)
                    param_idx += 1

                if req.total_amount is not None:
                    updates.append(f"total_amount = ${param_idx}")
                    params.append(req.total_amount)
                    param_idx += 1

                if req.paid_amount is not None:
                    updates.append(f"paid_amount = ${param_idx}")
                    params.append(req.paid_amount)
                    param_idx += 1

                if req.payment_terms is not None:
                    updates.append(f"payment_terms = ${param_idx}")
                    params.append(req.payment_terms)
                    param_idx += 1

                if req.notes is not None:
                    updates.append(f"notes = ${param_idx}")
                    params.append(req.notes)
                    param_idx += 1

                if req.approved_by is not None:
                    updates.append(f"approved_by = ${param_idx}")
                    params.append(req.approved_by)
                    param_idx += 1

                if req.last_updated_by is not None:
                    updates.append(f"last_updated_by = ${param_idx}")
                    params.append(req.last_updated_by)
                    param_idx += 1

                updates.append(f"last_updated = NOW()")

                if updates:
                    query = f"UPDATE purchase_orders SET {', '.join(updates)} WHERE id = ${param_idx}"
                    params.append(req.id)
                    await conn.execute(query, *params)

                # Update items if provided
                if req.items is not None:
                    # Delete existing items
                    await conn.execute("DELETE FROM purchase_order_items WHERE purchase_order_id = $1", req.id)
                    
                    # Insert new items
                    for item in req.items:
                        await conn.execute(
                            """
                            INSERT INTO purchase_order_items (
                                purchase_order_id, name, type, category, quantity, unit, rate,
                                total_amount, supplier, supplier_contact, supplier_email,
                                brand, grade, description, packing_weight, packing_unit,
                                expected_inward_date, delivery_status, quality_status
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                            """,
                            req.id, item.name, item.type, item.category, item.quantity, item.unit,
                            item.rate, item.total_amount, item.supplier, item.supplier_contact,
                            item.supplier_email, item.brand, item.grade, item.description,
                            item.packing_weight, item.packing_unit, item.expected_inward_date,
                            item.delivery_status, item.quality_status
                        )

                return {"success": True, "message": "Purchase order updated successfully"}

        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Purchase order number already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@purchase_orders_router.post("/delete")
async def delete_purchase_order(req: DeleteRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM purchase_orders WHERE id = $1", req.id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Purchase order not found")
        return {"success": True, "message": "Purchase order deleted successfully"}