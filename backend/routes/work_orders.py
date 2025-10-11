from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError, ForeignKeyViolationError
from decimal import Decimal
from datetime import date

work_orders_router = APIRouter(prefix="/api/work-orders", tags=["work_orders"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


class WorkOrderIngredient(BaseModel):
    ingredient_name: str
    required_quantity: float
    actual_quantity: float
    unit: str
    supplier: Optional[str] = None
    grade: Optional[str] = None
    cost: float = 0.0


class RecipeInfo(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    total_yield: float
    yield_unit: str


def _row_to_work_order(row, recipe_info: dict = None, ingredients: List[dict] = None) -> dict:
    return {
        "id": str(row["id"]),
        "work_order_number": row["work_order_number"],
        "recipe_id": str(row["recipe_id"]),
        "recipe": recipe_info,
        "batch_size": int(row["batch_size"]),
        "target_quantity": _to_float(row["target_quantity"]),
        "actual_quantity": _to_float(row["actual_quantity"]),
        "status": row["status"],
        "priority": row["priority"],
        "scheduled_date": row["scheduled_date"].isoformat() if row.get("scheduled_date") else None,
        "due_date": row["due_date"].isoformat() if row.get("due_date") else None,
        "assigned_worker": row.get("assigned_worker"),
        "estimated_cost": _to_float(row["estimated_cost"]),
        "notes": row.get("notes"),
        "created_date": row["created_date"].isoformat() if row["created_date"] else None,
        "last_updated": row["last_updated"].isoformat() if row["last_updated"] else None,
        "last_updated_by": row.get("last_updated_by"),
        "ingredients": ingredients or [],
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_worker: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetRequest(BaseModel):
    work_order_number: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    work_order_number: str
    recipe_id: str
    batch_size: int = 1
    target_quantity: float
    actual_quantity: float = 0
    status: str = "Draft"
    priority: str = "Medium"
    scheduled_date: Optional[str] = None
    due_date: Optional[str] = None
    assigned_worker: Optional[str] = None
    estimated_cost: float = 0
    notes: Optional[str] = None
    ingredients: List[WorkOrderIngredient] = []
    last_updated_by: Optional[str] = None


class UpdateRequest(BaseModel):
    work_order_number: Optional[str] = None
    id: Optional[str] = None
    recipe_id: Optional[str] = None
    batch_size: Optional[int] = None
    target_quantity: Optional[float] = None
    actual_quantity: Optional[float] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    scheduled_date: Optional[str] = None
    due_date: Optional[str] = None
    assigned_worker: Optional[str] = None
    estimated_cost: Optional[float] = None
    notes: Optional[str] = None
    ingredients: Optional[List[WorkOrderIngredient]] = None
    last_updated_by: Optional[str] = None


@work_orders_router.post("/list")
async def list_work_orders(payload: ListRequest):
    try:
        q = (payload.query or "").strip()
        pattern = f"%{q}%"
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT wo.id, wo.work_order_number, wo.recipe_id, wo.batch_size, wo.target_quantity,
                       wo.actual_quantity, wo.status, wo.priority, wo.scheduled_date, wo.due_date,
                       wo.assigned_worker, wo.estimated_cost, wo.notes, wo.created_date,
                       wo.last_updated, wo.last_updated_by,
                       r.name as recipe_name, r.sku as recipe_sku, r.category as recipe_category,
                       r.total_yield as recipe_total_yield, r.yield_unit as recipe_yield_unit
                FROM work_orders wo
                LEFT JOIN recipes r ON wo.recipe_id = r.id
                WHERE ($1 = '' OR wo.work_order_number ILIKE $2 OR r.name ILIKE $2 OR wo.assigned_worker ILIKE $2)
                  AND ($3::text IS NULL OR wo.status = $3)
                  AND ($4::text IS NULL OR wo.priority = $4)
                  AND ($5::text IS NULL OR wo.assigned_worker = $5)
                ORDER BY wo.created_date DESC
                LIMIT $6 OFFSET $7
                """,
                q, pattern, payload.status, payload.priority, payload.assigned_worker,
                payload.limit, payload.offset
            )
            
            # Get all work order IDs
            work_order_ids = [row["id"] for row in rows]
            
            # Fetch all ingredients in a single query if there are work orders
            ingredients_map = {}
            if work_order_ids:
                ingredient_rows = await conn.fetch(
                    """
                    SELECT work_order_id, ingredient_name, required_quantity, actual_quantity, unit, supplier, grade, cost
                    FROM work_order_ingredients
                    WHERE work_order_id = ANY($1::uuid[])
                    """,
                    work_order_ids
                )
                
                # Group ingredients by work_order_id
                for ing in ingredient_rows:
                    wo_id = str(ing["work_order_id"])
                    if wo_id not in ingredients_map:
                        ingredients_map[wo_id] = []
                    ingredients_map[wo_id].append({
                        "ingredient_name": ing["ingredient_name"],
                        "required_quantity": _to_float(ing["required_quantity"]),
                        "actual_quantity": _to_float(ing["actual_quantity"]),
                        "unit": ing["unit"],
                        "supplier": ing.get("supplier"),
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    })
        
        items = []
        for row in rows:
            recipe_info = {
                "id": str(row["recipe_id"]),
                "name": row["recipe_name"],
                "sku": row["recipe_sku"],
                "category": row["recipe_category"],
                "total_yield": _to_float(row["recipe_total_yield"]),
                "yield_unit": row["recipe_yield_unit"],
            }
            
            ingredients = ingredients_map.get(str(row["id"]), [])
            items.append(_row_to_work_order(row, recipe_info, ingredients))
        
        return {"items": items, "count": len(items)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list work orders: {str(e)}")


@work_orders_router.post("/get")
async def get_work_order(payload: GetRequest):
    if not payload.work_order_number and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'work_order_number' or 'id'")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.work_order_number:
                row = await conn.fetchrow(
                    """
                    SELECT wo.id, wo.work_order_number, wo.recipe_id, wo.batch_size, wo.target_quantity, 
                           wo.actual_quantity, wo.status, wo.priority, wo.scheduled_date, wo.due_date,
                           wo.assigned_worker, wo.estimated_cost, wo.notes, wo.created_date, 
                           wo.last_updated, wo.last_updated_by,
                           r.name as recipe_name, r.sku as recipe_sku, r.category as recipe_category,
                           r.total_yield as recipe_total_yield, r.yield_unit as recipe_yield_unit
                    FROM work_orders wo
                    LEFT JOIN recipes r ON wo.recipe_id = r.id
                    WHERE wo.work_order_number = $1
                    """,
                    payload.work_order_number
                )
            else:
                row = await conn.fetchrow(
                    """
                    SELECT wo.id, wo.work_order_number, wo.recipe_id, wo.batch_size, wo.target_quantity, 
                           wo.actual_quantity, wo.status, wo.priority, wo.scheduled_date, wo.due_date,
                           wo.assigned_worker, wo.estimated_cost, wo.notes, wo.created_date, 
                           wo.last_updated, wo.last_updated_by,
                           r.name as recipe_name, r.sku as recipe_sku, r.category as recipe_category,
                           r.total_yield as recipe_total_yield, r.yield_unit as recipe_yield_unit
                    FROM work_orders wo
                    LEFT JOIN recipes r ON wo.recipe_id = r.id
                    WHERE wo.id = $1::uuid
                    """,
                    payload.id
                )
        
        if not row:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        recipe_info = {
            "id": str(row["recipe_id"]),
            "name": row["recipe_name"],
            "sku": row["recipe_sku"],
            "category": row["recipe_category"],
            "total_yield": _to_float(row["recipe_total_yield"]),
            "yield_unit": row["recipe_yield_unit"],
        }
        
        # Get ingredients
        async with pool.acquire() as conn:
            ingredient_rows = await conn.fetch(
                """
                SELECT ingredient_name, required_quantity, actual_quantity, unit, supplier, grade, cost
                FROM work_order_ingredients
                WHERE work_order_id = $1
                """,
                row["id"]
            )
            ingredients = [
                {
                    "ingredient_name": ing["ingredient_name"],
                    "required_quantity": _to_float(ing["required_quantity"]),
                    "actual_quantity": _to_float(ing["actual_quantity"]),
                    "unit": ing["unit"],
                    "supplier": ing.get("supplier"),
                    "grade": ing.get("grade"),
                    "cost": _to_float(ing["cost"]),
                }
                for ing in ingredient_rows
            ]
        
        return _row_to_work_order(row, recipe_info, ingredients)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch work order: {str(e)}")


@work_orders_router.post("/create")
async def create_work_order(payload: CreateRequest):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Create work order
                row = await conn.fetchrow(
                    """
                    INSERT INTO work_orders (work_order_number, recipe_id, batch_size, target_quantity,
                                           actual_quantity, status, priority, scheduled_date, due_date,
                                           assigned_worker, estimated_cost, notes, last_updated_by)
                    VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id, work_order_number, recipe_id, batch_size, target_quantity, actual_quantity,
                              status, priority, scheduled_date, due_date, assigned_worker, estimated_cost,
                              notes, created_date, last_updated, last_updated_by
                    """,
                    payload.work_order_number, payload.recipe_id, payload.batch_size, payload.target_quantity,
                    payload.actual_quantity, payload.status, payload.priority, payload.scheduled_date,
                    payload.due_date, payload.assigned_worker, payload.estimated_cost, payload.notes,
                    payload.last_updated_by
                )
                
                work_order_id = row["id"]
                
                # Add ingredients
                for ing in payload.ingredients:
                    await conn.execute(
                        """
                        INSERT INTO work_order_ingredients (work_order_id, ingredient_name, required_quantity,
                                                          actual_quantity, unit, supplier, grade, cost)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        """,
                        work_order_id, ing.ingredient_name, ing.required_quantity, ing.actual_quantity,
                        ing.unit, ing.supplier, ing.grade, ing.cost
                    )
                
                # Get recipe info
                recipe_row = await conn.fetchrow(
                    "SELECT id, name, sku, category, total_yield, yield_unit FROM recipes WHERE id = $1::uuid",
                    payload.recipe_id
                )
                
                if not recipe_row:
                    raise HTTPException(status_code=404, detail="Recipe not found")
                
                recipe_info = {
                    "id": str(recipe_row["id"]),
                    "name": recipe_row["name"],
                    "sku": recipe_row["sku"],
                    "category": recipe_row["category"],
                    "total_yield": _to_float(recipe_row["total_yield"]),
                    "yield_unit": recipe_row["yield_unit"],
                }
                
                # Get ingredients for response
                ingredient_rows = await conn.fetch(
                    """
                    SELECT ingredient_name, required_quantity, actual_quantity, unit, supplier, grade, cost
                    FROM work_order_ingredients
                    WHERE work_order_id = $1
                    """,
                    work_order_id
                )
                ingredients = [
                    {
                        "ingredient_name": ing["ingredient_name"],
                        "required_quantity": _to_float(ing["required_quantity"]),
                        "actual_quantity": _to_float(ing["actual_quantity"]),
                        "unit": ing["unit"],
                        "supplier": ing.get("supplier"),
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    }
                    for ing in ingredient_rows
                ]
        
        return _row_to_work_order(row, recipe_info, ingredients)
    except UniqueViolationError:
        raise HTTPException(status_code=409, detail="Work order number already exists")
    except ForeignKeyViolationError:
        raise HTTPException(status_code=404, detail="Recipe not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create work order: {str(e)}")


@work_orders_router.post("/update")
async def update_work_order(payload: UpdateRequest):
    if not payload.work_order_number and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'work_order_number' or 'id' to identify the work order")
    
    # Build dynamic update
    fields = []
    values = []
    
    if payload.recipe_id is not None:
        fields.append("recipe_id = ${}::uuid")
        values.append(payload.recipe_id)
    if payload.batch_size is not None:
        fields.append("batch_size = ${}")
        values.append(payload.batch_size)
    if payload.target_quantity is not None:
        fields.append("target_quantity = ${}")
        values.append(payload.target_quantity)
    if payload.actual_quantity is not None:
        fields.append("actual_quantity = ${}")
        values.append(payload.actual_quantity)
    if payload.status is not None:
        fields.append("status = ${}")
        values.append(payload.status)
    if payload.priority is not None:
        fields.append("priority = ${}")
        values.append(payload.priority)
    if payload.scheduled_date is not None:
        fields.append("scheduled_date = ${}")
        values.append(payload.scheduled_date)
    if payload.due_date is not None:
        fields.append("due_date = ${}")
        values.append(payload.due_date)
    if payload.assigned_worker is not None:
        fields.append("assigned_worker = ${}")
        values.append(payload.assigned_worker)
    if payload.estimated_cost is not None:
        fields.append("estimated_cost = ${}")
        values.append(payload.estimated_cost)
    if payload.notes is not None:
        fields.append("notes = ${}")
        values.append(payload.notes)
    if payload.last_updated_by is not None:
        fields.append("last_updated_by = ${}")
        values.append(payload.last_updated_by)
    
    if not fields and payload.ingredients is None:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Update work order if fields provided
                if fields:
                    set_clauses = []
                    for idx, clause in enumerate(fields, start=1):
                        set_clauses.append(clause.replace("${}", f"${idx}"))
                    set_sql = ", ".join(set_clauses) + ", last_updated = NOW()"
                    
                    if payload.work_order_number:
                        where_param_index = len(values) + 1
                        sql = f"""
                            UPDATE work_orders
                            SET {set_sql}
                            WHERE work_order_number = ${where_param_index}
                            RETURNING id
                        """
                        row = await conn.fetchrow(sql, *values, payload.work_order_number)
                    else:
                        where_param_index = len(values) + 1
                        sql = f"""
                            UPDATE work_orders
                            SET {set_sql}
                            WHERE id = ${where_param_index}::uuid
                            RETURNING id
                        """
                        row = await conn.fetchrow(sql, *values, payload.id)
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Work order not found")
                    work_order_id = row["id"]
                else:
                    # Get work order ID
                    if payload.work_order_number:
                        row = await conn.fetchrow("SELECT id FROM work_orders WHERE work_order_number = $1", payload.work_order_number)
                    else:
                        row = await conn.fetchrow("SELECT id FROM work_orders WHERE id = $1::uuid", payload.id)
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Work order not found")
                    work_order_id = row["id"]
                    
                    # Update last_updated
                    await conn.execute("UPDATE work_orders SET last_updated = NOW() WHERE id = $1", work_order_id)
                
                # Update ingredients if provided
                if payload.ingredients is not None:
                    await conn.execute("DELETE FROM work_order_ingredients WHERE work_order_id = $1", work_order_id)
                    for ing in payload.ingredients:
                        await conn.execute(
                            """
                            INSERT INTO work_order_ingredients (work_order_id, ingredient_name, required_quantity,
                                                              actual_quantity, unit, supplier, grade, cost)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                            """,
                            work_order_id, ing.ingredient_name, ing.required_quantity, ing.actual_quantity,
                            ing.unit, ing.supplier, ing.grade, ing.cost
                        )
                
                # Get updated work order
                row = await conn.fetchrow(
                    """
                    SELECT wo.id, wo.work_order_number, wo.recipe_id, wo.batch_size, wo.target_quantity, 
                           wo.actual_quantity, wo.status, wo.priority, wo.scheduled_date, wo.due_date,
                           wo.assigned_worker, wo.estimated_cost, wo.notes, wo.created_date, 
                           wo.last_updated, wo.last_updated_by,
                           r.name as recipe_name, r.sku as recipe_sku, r.category as recipe_category,
                           r.total_yield as recipe_total_yield, r.yield_unit as recipe_yield_unit
                    FROM work_orders wo
                    LEFT JOIN recipes r ON wo.recipe_id = r.id
                    WHERE wo.id = $1
                    """,
                    work_order_id
                )
                
                recipe_info = {
                    "id": str(row["recipe_id"]),
                    "name": row["recipe_name"],
                    "sku": row["recipe_sku"],
                    "category": row["recipe_category"],
                    "total_yield": _to_float(row["recipe_total_yield"]),
                    "yield_unit": row["recipe_yield_unit"],
                }
                
                # Get ingredients
                ingredient_rows = await conn.fetch(
                    """
                    SELECT ingredient_name, required_quantity, actual_quantity, unit, supplier, grade, cost
                    FROM work_order_ingredients
                    WHERE work_order_id = $1
                    """,
                    work_order_id
                )
                ingredients = [
                    {
                        "ingredient_name": ing["ingredient_name"],
                        "required_quantity": _to_float(ing["required_quantity"]),
                        "actual_quantity": _to_float(ing["actual_quantity"]),
                        "unit": ing["unit"],
                        "supplier": ing.get("supplier"),
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    }
                    for ing in ingredient_rows
                ]
        
        return _row_to_work_order(row, recipe_info, ingredients)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update work order: {str(e)}")


class DeleteRequest(BaseModel):
    work_order_number: Optional[str] = None
    id: Optional[str] = None


@work_orders_router.post("/delete")
async def delete_work_order(payload: DeleteRequest):
    if not payload.work_order_number and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'work_order_number' or 'id' to identify the work order")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.work_order_number:
                result = await conn.execute(
                    "DELETE FROM work_orders WHERE work_order_number = $1",
                    payload.work_order_number
                )
            else:
                result = await conn.execute(
                    "DELETE FROM work_orders WHERE id = $1::uuid",
                    payload.id
                )
        
        rows_deleted = int(result.split()[-1]) if result else 0
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        return {"success": True, "message": "Work order deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete work order: {str(e)}")