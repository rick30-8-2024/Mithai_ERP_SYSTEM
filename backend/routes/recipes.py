from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError
from decimal import Decimal

recipes_router = APIRouter(prefix="/api/recipes", tags=["recipes"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


class RecipeIngredient(BaseModel):
    id: Optional[str] = None
    ingredient_name: str
    quantity: float
    unit: str
    grade: Optional[str] = None
    cost: float = 0.0
    sort_order: int = 0


class RecipeInstruction(BaseModel):
    instruction: str
    step_number: int


def _row_to_recipe(row, ingredients: List[dict] = None, instructions: List[str] = None) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "sku": row["sku"],
        "total_yield": _to_float(row["total_yield"]),
        "yield_unit": row["yield_unit"],
        "preparation_time": int(row["preparation_time"]) if row["preparation_time"] else 0,
        "cooking_time": int(row["cooking_time"]) if row["cooking_time"] else 0,
        "brand": row.get("brand"),
        "grade": row.get("grade"),
        "packing_weight": _to_float(row["packing_weight"]) if row.get("packing_weight") else None,
        "total_cost": _to_float(row["total_cost"]),
        "last_updated": row["last_updated"].isoformat() if row["last_updated"] else None,
        "last_updated_by": row.get("last_updated_by"),
        "ingredients": ingredients or [],
        "instructions": instructions or [],
    }


class ListRequest(BaseModel):
    query: Optional[str] = ""
    limit: int = 50
    offset: int = 0


class GetRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None


class CreateRequest(BaseModel):
    name: str
    sku: str
    total_yield: float
    yield_unit: str
    preparation_time: int
    cooking_time: int
    brand: Optional[str] = None
    grade: Optional[str] = None
    packing_weight: Optional[float] = None
    ingredients: List[RecipeIngredient] = []
    instructions: List[str] = []
    last_updated_by: Optional[str] = None


class UpdateRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    new_sku: Optional[str] = None
    total_yield: Optional[float] = None
    yield_unit: Optional[str] = None
    preparation_time: Optional[int] = None
    cooking_time: Optional[int] = None
    brand: Optional[str] = None
    grade: Optional[str] = None
    packing_weight: Optional[float] = None
    ingredients: Optional[List[RecipeIngredient]] = None
    instructions: Optional[List[str]] = None
    last_updated_by: Optional[str] = None


@recipes_router.post("/list")
async def list_recipes(payload: ListRequest):
    try:
        q = (payload.query or "").strip()
        pattern = f"%{q}%"
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, name, sku, total_yield, yield_unit, preparation_time, cooking_time,
                       brand, grade, packing_weight, total_cost, last_updated, last_updated_by
                FROM recipes
                WHERE ($1 = '' OR name ILIKE $2 OR sku ILIKE $2 OR brand ILIKE $2)
                ORDER BY name
                LIMIT $3 OFFSET $4
                """,
                q, pattern, payload.limit, payload.offset
            )
        
        items = []
        for row in rows:
            # Get ingredients for each recipe
            async with pool.acquire() as conn:
                ingredient_rows = await conn.fetch(
                    """
                    SELECT ingredient_name, quantity, unit, grade, cost
                    FROM recipe_ingredients
                    WHERE recipe_id = $1
                    ORDER BY sort_order
                    """,
                    row["id"]
                )
                ingredients = [
                    {
                        "ingredient_name": ing["ingredient_name"],
                        "quantity": _to_float(ing["quantity"]),
                        "unit": ing["unit"],
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    }
                    for ing in ingredient_rows
                ]
                
                instruction_rows = await conn.fetch(
                    """
                    SELECT instruction
                    FROM recipe_instructions
                    WHERE recipe_id = $1
                    ORDER BY step_number
                    """,
                    row["id"]
                )
                instructions = [inst["instruction"] for inst in instruction_rows]
            
            items.append(_row_to_recipe(row, ingredients, instructions))
            print({"items": items, "count": len(items)})
        
        return {"items": items, "count": len(items)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list recipes: {str(e)}")


@recipes_router.post("/get")
async def get_recipe(payload: GetRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id'")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.sku:
                row = await conn.fetchrow(
                    """
                    SELECT id, name, sku, total_yield, yield_unit, preparation_time, cooking_time,
                           brand, grade, packing_weight, total_cost, last_updated, last_updated_by
                    FROM recipes WHERE sku = $1
                    """,
                    payload.sku
                )
            else:
                row = await conn.fetchrow(
                    """
                    SELECT id, name, sku, total_yield, yield_unit, preparation_time, cooking_time,
                           brand, grade, packing_weight, total_cost, last_updated, last_updated_by
                    FROM recipes WHERE id = $1::uuid
                    """,
                    payload.id
                )
        
        if not row:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        # Get ingredients
        async with pool.acquire() as conn:
            ingredient_rows = await conn.fetch(
                """
                SELECT ingredient_name, quantity, unit, grade, cost
                FROM recipe_ingredients
                WHERE recipe_id = $1
                ORDER BY sort_order
                """,
                row["id"]
            )
            ingredients = [
                {
                    "ingredient_name": ing["ingredient_name"],
                    "quantity": _to_float(ing["quantity"]),
                    "unit": ing["unit"],
                    "grade": ing.get("grade"),
                    "cost": _to_float(ing["cost"]),
                }
                for ing in ingredient_rows
            ]
            
            instruction_rows = await conn.fetch(
                """
                SELECT instruction
                FROM recipe_instructions
                WHERE recipe_id = $1
                ORDER BY step_number
                """,
                row["id"]
            )
            instructions = [inst["instruction"] for inst in instruction_rows]
        
        return _row_to_recipe(row, ingredients, instructions)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recipe: {str(e)}")


@recipes_router.post("/create")
async def create_recipe(payload: CreateRequest):
    try:
        # Calculate total cost from ingredients
        total_cost = sum(ing.cost for ing in payload.ingredients)
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Create recipe
                row = await conn.fetchrow(
                    """
                    INSERT INTO recipes (name, sku, total_yield, yield_unit, preparation_time,
                                       cooking_time, brand, grade, packing_weight, total_cost, last_updated_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id, name, sku, total_yield, yield_unit, preparation_time, cooking_time,
                              brand, grade, packing_weight, total_cost, last_updated, last_updated_by
                    """,
                    payload.name, payload.sku, payload.total_yield, payload.yield_unit,
                    payload.preparation_time, payload.cooking_time,
                    payload.brand, payload.grade, payload.packing_weight, total_cost, payload.last_updated_by
                )
                
                recipe_id = row["id"]
                
                # Add ingredients
                for idx, ing in enumerate(payload.ingredients):
                    await conn.execute(
                        """
                        INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, grade, cost, sort_order)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        """,
                        recipe_id, ing.ingredient_name, ing.quantity, ing.unit, ing.grade, ing.cost, idx
                    )
                
                # Add instructions
                for idx, instruction in enumerate(payload.instructions):
                    await conn.execute(
                        """
                        INSERT INTO recipe_instructions (recipe_id, instruction, step_number)
                        VALUES ($1, $2, $3)
                        """,
                        recipe_id, instruction, idx + 1
                    )
                
                # Get ingredients for response
                ingredient_rows = await conn.fetch(
                    """
                    SELECT ingredient_name, quantity, unit, grade, cost
                    FROM recipe_ingredients
                    WHERE recipe_id = $1
                    ORDER BY sort_order
                    """,
                    recipe_id
                )
                ingredients = [
                    {
                        "ingredient_name": ing["ingredient_name"],
                        "quantity": _to_float(ing["quantity"]),
                        "unit": ing["unit"],
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    }
                    for ing in ingredient_rows
                ]
                
                instruction_rows = await conn.fetch(
                    """
                    SELECT instruction
                    FROM recipe_instructions
                    WHERE recipe_id = $1
                    ORDER BY step_number
                    """,
                    recipe_id
                )
                instructions = [inst["instruction"] for inst in instruction_rows]
        
        return _row_to_recipe(row, ingredients, instructions)
    except UniqueViolationError:
        raise HTTPException(status_code=409, detail="SKU already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create recipe: {str(e)}")


@recipes_router.post("/update")
async def update_recipe(payload: UpdateRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id' to identify the recipe")
    
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                if payload.sku:
                    row = await conn.fetchrow("SELECT id FROM recipes WHERE sku = $1", payload.sku)
                else:
                    row = await conn.fetchrow("SELECT id FROM recipes WHERE id = $1::uuid", payload.id)
                
                if not row:
                    raise HTTPException(status_code=404, detail="Recipe not found")
                recipe_id = row["id"]
                
                if payload.new_sku is not None:
                    existing = await conn.fetchrow(
                        "SELECT id FROM recipes WHERE sku = $1 AND id != $2",
                        payload.new_sku, recipe_id
                    )
                    if existing:
                        raise HTTPException(status_code=409, detail="SKU already exists")
    
                fields = []
                values = []
                
                if payload.new_sku is not None:
                    fields.append("sku = ${}")
                    values.append(payload.new_sku)
                if payload.name is not None:
                    fields.append("name = ${}")
                    values.append(payload.name)
                if payload.total_yield is not None:
                    fields.append("total_yield = ${}")
                    values.append(payload.total_yield)
                if payload.yield_unit is not None:
                    fields.append("yield_unit = ${}")
                    values.append(payload.yield_unit)
                if payload.preparation_time is not None:
                    fields.append("preparation_time = ${}")
                    values.append(payload.preparation_time)
                if payload.cooking_time is not None:
                    fields.append("cooking_time = ${}")
                    values.append(payload.cooking_time)
                if payload.brand is not None:
                    fields.append("brand = ${}")
                    values.append(payload.brand)
                if payload.grade is not None:
                    fields.append("grade = ${}")
                    values.append(payload.grade)
                if payload.packing_weight is not None:
                    fields.append("packing_weight = ${}")
                    values.append(payload.packing_weight)
                if payload.last_updated_by is not None:
                    fields.append("last_updated_by = ${}")
                    values.append(payload.last_updated_by)
                
                if payload.ingredients is not None:
                    total_cost = sum(ing.cost for ing in payload.ingredients)
                    fields.append("total_cost = ${}")
                    values.append(total_cost)
                
                if not fields and payload.ingredients is None and payload.instructions is None:
                    raise HTTPException(status_code=400, detail="No fields provided to update")
                
                if fields:
                    set_clauses = []
                    for idx, clause in enumerate(fields, start=1):
                        set_clauses.append(clause.replace("${}", f"${idx}"))
                    set_sql = ", ".join(set_clauses) + ", last_updated = NOW()"
                    
                    sql = f"""
                        UPDATE recipes
                        SET {set_sql}
                        WHERE id = ${len(values) + 1}
                        RETURNING id
                    """
                    row = await conn.fetchrow(sql, *values, recipe_id)
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Recipe not found")
                else:
                    await conn.execute("UPDATE recipes SET last_updated = NOW() WHERE id = $1", recipe_id)
                
                # Update ingredients if provided
                if payload.ingredients is not None:
                    await conn.execute("DELETE FROM recipe_ingredients WHERE recipe_id = $1", recipe_id)
                    for idx, ing in enumerate(payload.ingredients):
                        await conn.execute(
                            """
                            INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, grade, cost, sort_order)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                            """,
                            recipe_id, ing.ingredient_name, ing.quantity, ing.unit, ing.grade, ing.cost, idx
                        )
                
                # Update instructions if provided
                if payload.instructions is not None:
                    await conn.execute("DELETE FROM recipe_instructions WHERE recipe_id = $1", recipe_id)
                    for idx, instruction in enumerate(payload.instructions):
                        await conn.execute(
                            """
                            INSERT INTO recipe_instructions (recipe_id, instruction, step_number)
                            VALUES ($1, $2, $3)
                            """,
                            recipe_id, instruction, idx + 1
                        )
                
                # Get updated recipe
                row = await conn.fetchrow(
                    """
                    SELECT id, name, sku, total_yield, yield_unit, preparation_time, cooking_time,
                           brand, grade, packing_weight, total_cost, last_updated, last_updated_by
                    FROM recipes WHERE id = $1
                    """,
                    recipe_id
                )
                
                # Get ingredients
                ingredient_rows = await conn.fetch(
                    """
                    SELECT ingredient_name, quantity, unit, grade, cost
                    FROM recipe_ingredients
                    WHERE recipe_id = $1
                    ORDER BY sort_order
                    """,
                    recipe_id
                )
                ingredients = [
                    {
                        "ingredient_name": ing["ingredient_name"],
                        "quantity": _to_float(ing["quantity"]),
                        "unit": ing["unit"],
                        "grade": ing.get("grade"),
                        "cost": _to_float(ing["cost"]),
                    }
                    for ing in ingredient_rows
                ]
                
                instruction_rows = await conn.fetch(
                    """
                    SELECT instruction
                    FROM recipe_instructions
                    WHERE recipe_id = $1
                    ORDER BY step_number
                    """,
                    recipe_id
                )
                instructions = [inst["instruction"] for inst in instruction_rows]
        
        return _row_to_recipe(row, ingredients, instructions)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update recipe: {str(e)}")


class DeleteRequest(BaseModel):
    sku: Optional[str] = None
    id: Optional[str] = None


@recipes_router.post("/delete")
async def delete_recipe(payload: DeleteRequest):
    if not payload.sku and not payload.id:
        raise HTTPException(status_code=400, detail="Provide either 'sku' or 'id' to identify the recipe")
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            if payload.sku:
                result = await conn.execute(
                    "DELETE FROM recipes WHERE sku = $1",
                    payload.sku
                )
            else:
                result = await conn.execute(
                    "DELETE FROM recipes WHERE id = $1::uuid",
                    payload.id
                )
        
        rows_deleted = int(result.split()[-1]) if result else 0
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        return {"success": True, "message": "Recipe deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete recipe: {str(e)}")