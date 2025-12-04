from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError
from decimal import Decimal

inventory_router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


def _compute_status(current: float, minimum: float) -> str:
    if current <= 0:
        return "Out of Stock"
    if current < minimum:
        return "Low Stock"
    return "In Stock"


def _row_to_item(row) -> dict:
    current = _to_float(row["current_stock"])
    min_s = _to_float(row["min_stock"])
    max_s = _to_float(row["max_stock"])
    cost = _to_float(row.get("cost_per_unit", 0))
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "sku": row["sku"],
        "category": row["category"],
        "unit": row["unit"],
        "current_stock": current,
        "min_stock": min_s,
        "max_stock": max_s,
        "cost_per_unit": cost,
        "status": _compute_status(current, min_s),
        "last_updated": row["last_updated"].isoformat() if row["last_updated"] else None,
        "last_updated_by": row.get("last_updated_by"),
        # Shared fields
        "brand": row.get("brand"),
        "grade": row.get("grade"),
        "packing_weight": row.get("packing_weight"),
        # Raw Material specific
        "supplier": row.get("supplier"),
        # Finished Good specific
        "category_type": row.get("category_type"),
        "packing_qty": row.get("packing_qty"),
        # Factory field
        "factory": row.get("factory"),
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    category: Optional[str] = None
    status: Optional[str] = None
    factory: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    name: str
    sku: str
    category: str  # "Raw Material" | "Finished Good"
    unit: str      # e.g., "kg" | "L" | "pcs"
    current_stock: float = 0
    min_stock: float = 0
    max_stock: float
    cost_per_unit: float = 0
    last_updated_by: Optional[str] = None
    # Shared fields
    brand: Optional[str] = None
    grade: Optional[str] = None
    packing_weight: Optional[str] = None
    # Raw Material specific
    supplier: Optional[str] = None
    # Finished Good specific
    category_type: Optional[str] = None
    packing_qty: Optional[str] = None
    # Factory field
    factory: Optional[str] = None


class UpdateRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    min_stock: Optional[float] = None
    max_stock: Optional[float] = None
    cost_per_unit: Optional[float] = None
    last_updated_by: Optional[str] = None
    # Shared fields
    brand: Optional[str] = None
    grade: Optional[str] = None
    packing_weight: Optional[str] = None
    # Raw Material specific
    supplier: Optional[str] = None
    # Finished Good specific
    category_type: Optional[str] = None
    packing_qty: Optional[str] = None
    # Factory field
    factory: Optional[str] = None


@inventory_router.post("/list")
async def list_inventory(payload: ListRequest):
    try:
        q = (payload.query or "").strip()
        pattern = f"%{q}%"
        status = payload.status or None
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            total_count_query = """
            SELECT COUNT(*) FROM inventory
            WHERE ($1 = '' OR name ILIKE $2 OR sku ILIKE $2)
              AND ($3::text IS NULL OR category = $3)
              AND ($4::text IS NULL OR status = $4)
              AND ($5::text IS NULL OR factory = $5)
            """
            
            total_count = await conn.fetchval(
                total_count_query,
                q, pattern, payload.category, status, payload.factory
            )
            
            rows = await conn.fetch(
                """
                SELECT id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                       brand, grade, packing_weight, supplier, category_type, packing_qty, factory, status
                FROM inventory
                WHERE ($1 = '' OR name ILIKE $2 OR sku ILIKE $2)
                  AND ($3::text IS NULL OR category = $3)
                  AND ($4::text IS NULL OR status = $4)
                  AND ($5::text IS NULL OR factory = $5)
                ORDER BY name
                LIMIT $6 OFFSET $7
                """,
                q, pattern, payload.category, status, payload.factory, payload.limit, payload.offset
            )
        items = [_row_to_item(r) for r in rows]
        return {
            "items": items,
            "count": len(items),
            "total": total_count,
            "limit": payload.limit,
            "offset": payload.offset,
            "hasMore": (payload.offset + len(items)) < total_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list inventory: {str(e)}")


@inventory_router.post("/get")
async def get_inventory_item(payload: GetRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id'")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.sku:
                row = await conn.fetchrow(
                    """
                    SELECT id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                           brand, grade, packing_weight, supplier, category_type, packing_qty, factory
                    FROM inventory WHERE sku = $1
                    """,
                    payload.sku
                )
            else:
                row = await conn.fetchrow(
                    """
                    SELECT id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                           brand, grade, packing_weight, supplier, category_type, packing_qty, factory
                    FROM inventory WHERE id = $1::uuid
                    """,
                    payload.id
                )
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        return _row_to_item(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch item: {str(e)}")


@inventory_router.post("/create")
async def create_inventory_item(payload: CreateRequest):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO inventory (name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated_by,
                                     brand, grade, packing_weight, supplier, category_type, packing_qty, factory)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                          brand, grade, packing_weight, supplier, category_type, packing_qty, factory
                """,
                payload.name, payload.sku, payload.category, payload.unit,
                payload.current_stock, payload.min_stock, payload.max_stock, payload.cost_per_unit, payload.last_updated_by,
                payload.brand, payload.grade, payload.packing_weight, payload.supplier, payload.category_type, payload.packing_qty, payload.factory
            )
        return _row_to_item(row)
    except UniqueViolationError:
        raise HTTPException(status_code=409, detail="SKU already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create item: {str(e)}")


@inventory_router.post("/update")
async def update_inventory_item(payload: UpdateRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id' to identify the item")
    # Build dynamic update set
    fields = []
    values = []
    if payload.name is not None:
        fields.append("name = ${}")
        values.append(payload.name)
    if payload.sku is not None and payload.id is not None:
        fields.append("sku = ${}")
        values.append(payload.sku)
    if payload.category is not None:
        fields.append("category = ${}")
        values.append(payload.category)
    if payload.unit is not None:
        fields.append("unit = ${}")
        values.append(payload.unit)
    if payload.current_stock is not None:
        fields.append("current_stock = ${}")
        values.append(payload.current_stock)
    if payload.min_stock is not None:
        fields.append("min_stock = ${}")
        values.append(payload.min_stock)
    if payload.max_stock is not None:
        fields.append("max_stock = ${}")
        values.append(payload.max_stock)
    if payload.cost_per_unit is not None:
        fields.append("cost_per_unit = ${}")
        values.append(payload.cost_per_unit)
    if payload.last_updated_by is not None:
        fields.append("last_updated_by = ${}")
        values.append(payload.last_updated_by)
    if payload.brand is not None:
        fields.append("brand = ${}")
        values.append(payload.brand)
    if payload.grade is not None:
        fields.append("grade = ${}")
        values.append(payload.grade)
    if payload.packing_weight is not None:
        fields.append("packing_weight = ${}")
        values.append(payload.packing_weight)
    if payload.supplier is not None:
        fields.append("supplier = ${}")
        values.append(payload.supplier)
    if payload.category_type is not None:
        fields.append("category_type = ${}")
        values.append(payload.category_type)
    if payload.packing_qty is not None:
        fields.append("packing_qty = ${}")
        values.append(payload.packing_qty)
    if payload.factory is not None:
        fields.append("factory = ${}")
        values.append(payload.factory)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    # Replace ${} with proper positional parameters
    set_clauses = []
    for idx, clause in enumerate(fields, start=1):
        set_clauses.append(clause.replace("${}", f"${idx}"))
    set_sql = ", ".join(set_clauses) + ", last_updated = NOW()"

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.id:
                where_param_index = len(values) + 1
                sql = f"""
                    UPDATE inventory
                    SET {set_sql}
                    WHERE id = ${where_param_index}::uuid
                    RETURNING id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                              brand, grade, packing_weight, supplier, category_type, packing_qty, factory
                """
                row = await conn.fetchrow(sql, *values, payload.id)
            else:
                where_param_index = len(values) + 1
                sql = f"""
                    UPDATE inventory
                    SET {set_sql}
                    WHERE sku = ${where_param_index}
                    RETURNING id, name, sku, category, unit, current_stock, min_stock, max_stock, cost_per_unit, last_updated, last_updated_by,
                              brand, grade, packing_weight, supplier, category_type, packing_qty, factory
                """
                row = await conn.fetchrow(sql, *values, payload.sku)

        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        return _row_to_item(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update item: {str(e)}")


class DeleteRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None


@inventory_router.post("/delete")
async def delete_inventory_item(payload: DeleteRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id' to identify the item")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.sku:
                result = await conn.execute(
                    "DELETE FROM inventory WHERE sku = $1",
                    payload.sku
                )
            else:
                result = await conn.execute(
                    "DELETE FROM inventory WHERE id = $1::uuid",
                    payload.id
                )
        
        # Extract the number of rows deleted from result string (e.g., "DELETE 1")
        rows_deleted = int(result.split()[-1]) if result else 0
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        
        return {"success": True, "message": "Item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")