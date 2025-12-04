from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from asyncpg.exceptions import UniqueViolationError, ForeignKeyViolationError
from decimal import Decimal
from datetime import date, datetime

factory_transfers_router = APIRouter(prefix="/api/factory-transfers", tags=["factory_transfers"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


class FactoryLocation(BaseModel):
    name: str
    location: str
    manager: Optional[str] = None
    contact: Optional[str] = None
    capacity: Optional[str] = None
    specialization: Optional[List[str]] = []
    distance: Optional[str] = None
    status: str = 'Active'


def _row_to_factory_location(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "location": row["location"],
        "manager": row.get("manager"),
        "contact": row.get("contact"),
        "capacity": row.get("capacity"),
        "specialization": list(row.get("specialization", [])) if row.get("specialization") else [],
        "distance": row.get("distance"),
        "status": row["status"],
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
    }


def _row_to_transfer(row, inventory_item: dict = None) -> dict:
    return {
        "id": str(row["id"]),
        "transferNumber": row["transfer_number"],
        "inventoryItemId": str(row["inventory_item_id"]),
        "quantity": _to_float(row["quantity"]),
        "fromFactory": row["from_factory"],
        "toFactory": row["to_factory"],
        "status": row["status"],
        "notes": row.get("notes"),
        "requestedBy": row.get("requested_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
        "inventoryItem": inventory_item,
    }


@factory_transfers_router.get("/factories")
async def list_factory_locations():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM factory_locations ORDER BY name"
        )
        return [_row_to_factory_location(row) for row in rows]


@factory_transfers_router.post("/factories/create")
async def create_factory_location(req: FactoryLocation):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            factory_id = await conn.fetchval(
                """
                INSERT INTO factory_locations (
                    name, location, manager, contact, capacity, 
                    specialization, distance, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
                """,
                req.name, req.location, req.manager, req.contact,
                req.capacity, req.specialization, req.distance, req.status
            )
            return {"success": True, "id": str(factory_id), "message": "Factory location created successfully"}
        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Factory name already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


class InventorySearchRequest(BaseModel):
    query: str = ""
    limit: int = 20


class InventoryItemSimple(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    unit: str
    current_stock: float
    factory: Optional[str] = None


@factory_transfers_router.post("/inventory/search")
async def search_inventory_items(req: InventorySearchRequest):
    """Search inventory items for autocomplete in transfer form."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, name, sku, category, unit, current_stock, factory 
            FROM inventory 
            WHERE (name ILIKE $1 OR sku ILIKE $1)
            AND current_stock > 0
            ORDER BY name
            LIMIT $2
            """,
            f"%{req.query}%", req.limit
        )
        return [
            {
                "id": str(row["id"]),
                "name": row["name"],
                "sku": row["sku"],
                "category": row["category"],
                "unit": row["unit"],
                "currentStock": _to_float(row["current_stock"]),
                "factory": row.get("factory"),
            }
            for row in rows
        ]


@factory_transfers_router.get("/factories/by-inventory/{inventory_item_id}")
async def get_factories_by_inventory_item(inventory_item_id: str):
    """Get factories where the specified inventory item is available."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        inventory_row = await conn.fetchrow(
            "SELECT id, factory, current_stock FROM inventory WHERE id = $1",
            inventory_item_id
        )
        
        if not inventory_row:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        factory_name = inventory_row.get("factory")
        
        if not factory_name:
            return []
        
        factory_rows = await conn.fetch(
            "SELECT * FROM factory_locations WHERE name = $1 AND status = 'Active'",
            factory_name
        )
        
        return [_row_to_factory_location(row) for row in factory_rows]


class ListTransfersRequest(BaseModel):
    query: Optional[str] = ""
    status: Optional[str] = None
    factory: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetTransferRequest(BaseModel):
    transfer_number: Optional[str] = None
    id: Optional[str] = None


class CreateTransferRequest(BaseModel):
    transfer_number: str
    inventory_item_id: str
    quantity: float
    from_factory: str
    to_factory: str
    status: str = "Draft"
    notes: Optional[str] = None
    requested_by: Optional[str] = None
    last_updated_by: Optional[str] = None


class UpdateTransferRequest(BaseModel):
    id: str
    transfer_number: Optional[str] = None
    inventory_item_id: Optional[str] = None
    quantity: Optional[float] = None
    from_factory: Optional[str] = None
    to_factory: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    requested_by: Optional[str] = None
    last_updated_by: Optional[str] = None


class DeleteTransferRequest(BaseModel):
    id: str


@factory_transfers_router.post("/list")
async def list_transfers(req: ListTransfersRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        query_parts = []
        params = []
        param_idx = 1

        base_query = """
            SELECT 
                ft.id, ft.transfer_number, ft.inventory_item_id, ft.quantity,
                ft.from_factory, ft.to_factory, ft.status, ft.notes, 
                ft.requested_by, ft.created_date, ft.last_updated, ft.last_updated_by,
                i.name as item_name, i.sku as item_sku, i.category as item_category,
                i.unit as item_unit, i.current_stock as item_current_stock
            FROM factory_transfers ft
            LEFT JOIN inventory i ON ft.inventory_item_id = i.id
            WHERE 1=1
        """

        if req.query:
            query_parts.append(f"AND (ft.transfer_number ILIKE ${param_idx} OR ft.from_factory ILIKE ${param_idx} OR ft.to_factory ILIKE ${param_idx} OR i.name ILIKE ${param_idx})")
            params.append(f"%{req.query}%")
            param_idx += 1

        if req.status:
            query_parts.append(f"AND ft.status = ${param_idx}")
            params.append(req.status)
            param_idx += 1

        if req.factory:
            query_parts.append(f"AND (ft.from_factory = ${param_idx} OR ft.to_factory = ${param_idx})")
            params.append(req.factory)
            param_idx += 1

        final_query = base_query + " ".join(query_parts) + f" ORDER BY ft.created_date DESC LIMIT ${param_idx} OFFSET ${param_idx + 1}"
        params.extend([req.limit, req.offset])

        rows = await conn.fetch(final_query, *params)
        
        result = []
        for row in rows:
            inventory_item = {
                "id": str(row["inventory_item_id"]),
                "name": row["item_name"],
                "sku": row["item_sku"],
                "category": row["item_category"],
                "unit": row["item_unit"],
                "currentStock": _to_float(row["item_current_stock"]),
            } if row["item_name"] else None
            result.append(_row_to_transfer(row, inventory_item))

        count_query = """
            SELECT COUNT(*) FROM factory_transfers ft
            LEFT JOIN inventory i ON ft.inventory_item_id = i.id
            WHERE 1=1 
        """ + " ".join(query_parts)
        count_params = params[:-2]
        total = await conn.fetchval(count_query, *count_params)

        return {"items": result, "total": total, "limit": req.limit, "offset": req.offset}


@factory_transfers_router.post("/get")
async def get_transfer(req: GetTransferRequest):
    if not req.transfer_number and not req.id:
        raise HTTPException(status_code=400, detail="Either transfer_number or id must be provided")

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if req.id:
            row = await conn.fetchrow(
                """
                SELECT ft.*, i.name as item_name, i.sku as item_sku, 
                       i.category as item_category, i.unit as item_unit, 
                       i.current_stock as item_current_stock
                FROM factory_transfers ft
                LEFT JOIN inventory i ON ft.inventory_item_id = i.id
                WHERE ft.id = $1
                """, 
                req.id
            )
        else:
            row = await conn.fetchrow(
                """
                SELECT ft.*, i.name as item_name, i.sku as item_sku, 
                       i.category as item_category, i.unit as item_unit, 
                       i.current_stock as item_current_stock
                FROM factory_transfers ft
                LEFT JOIN inventory i ON ft.inventory_item_id = i.id
                WHERE ft.transfer_number = $1
                """, 
                req.transfer_number
            )

        if not row:
            raise HTTPException(status_code=404, detail="Transfer not found")

        inventory_item = {
            "id": str(row["inventory_item_id"]),
            "name": row["item_name"],
            "sku": row["item_sku"],
            "category": row["item_category"],
            "unit": row["item_unit"],
            "currentStock": _to_float(row["item_current_stock"]),
        } if row["item_name"] else None

        return _row_to_transfer(row, inventory_item)


@factory_transfers_router.post("/create")
async def create_transfer(req: CreateTransferRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            inventory_row = await conn.fetchrow(
                "SELECT id, current_stock, factory FROM inventory WHERE id = $1",
                req.inventory_item_id
            )
            
            if not inventory_row:
                raise HTTPException(status_code=400, detail="Inventory item not found")
            
            if _to_float(inventory_row["current_stock"]) < req.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock. Available: {inventory_row['current_stock']}, Requested: {req.quantity}"
                )
            
            transfer_id = await conn.fetchval(
                """
                INSERT INTO factory_transfers (
                    transfer_number, inventory_item_id, quantity,
                    from_factory, to_factory, status, notes,
                    requested_by, last_updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
                """,
                req.transfer_number, req.inventory_item_id, req.quantity,
                req.from_factory, req.to_factory, req.status, req.notes,
                req.requested_by, req.last_updated_by
            )

            return {"success": True, "id": str(transfer_id), "message": "Transfer created successfully"}

        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Transfer number already exists")
        except ForeignKeyViolationError:
            raise HTTPException(status_code=400, detail="Invalid inventory item or factory reference")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@factory_transfers_router.post("/update")
async def update_transfer(req: UpdateTransferRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            updates = []
            params = []
            param_idx = 1

            if req.transfer_number is not None:
                updates.append(f"transfer_number = ${param_idx}")
                params.append(req.transfer_number)
                param_idx += 1

            if req.inventory_item_id is not None:
                updates.append(f"inventory_item_id = ${param_idx}")
                params.append(req.inventory_item_id)
                param_idx += 1

            if req.quantity is not None:
                updates.append(f"quantity = ${param_idx}")
                params.append(req.quantity)
                param_idx += 1

            if req.from_factory is not None:
                updates.append(f"from_factory = ${param_idx}")
                params.append(req.from_factory)
                param_idx += 1

            if req.to_factory is not None:
                updates.append(f"to_factory = ${param_idx}")
                params.append(req.to_factory)
                param_idx += 1

            if req.status is not None:
                updates.append(f"status = ${param_idx}")
                params.append(req.status)
                param_idx += 1

            if req.notes is not None:
                updates.append(f"notes = ${param_idx}")
                params.append(req.notes)
                param_idx += 1

            if req.requested_by is not None:
                updates.append(f"requested_by = ${param_idx}")
                params.append(req.requested_by)
                param_idx += 1

            if req.last_updated_by is not None:
                updates.append(f"last_updated_by = ${param_idx}")
                params.append(req.last_updated_by)
                param_idx += 1

            updates.append(f"last_updated = NOW()")

            if updates:
                query = f"UPDATE factory_transfers SET {', '.join(updates)} WHERE id = ${param_idx}"
                params.append(req.id)
                await conn.execute(query, *params)

            return {"success": True, "message": "Transfer updated successfully"}

        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Transfer number already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@factory_transfers_router.post("/delete")
async def delete_transfer(req: DeleteTransferRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM factory_transfers WHERE id = $1", req.id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Transfer not found")
        return {"success": True, "message": "Transfer deleted successfully"}