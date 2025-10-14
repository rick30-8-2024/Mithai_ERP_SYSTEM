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


class TransferItem(BaseModel):
    name: str
    type: str  # 'Raw Material', 'Finished Good', 'Inventory'
    category: str
    current_stock: float
    transfer_quantity: float
    unit: str
    priority: str = 'Medium'
    estimated_value: float
    requires_refrigeration: bool = False
    expiry_date: Optional[str] = None
    brand: Optional[str] = None
    grade: Optional[str] = None


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


def _row_to_transfer(row, items: List[dict] = None) -> dict:
    return {
        "id": str(row["id"]),
        "transferNumber": row["transfer_number"],
        "fromFactory": row["from_factory"],
        "toFactory": row["to_factory"],
        "status": row["status"],
        "priority": row["priority"],
        "requestedDate": row["requested_date"].isoformat() if row.get("requested_date") else None,
        "scheduledDate": row["scheduled_date"].isoformat() if row.get("scheduled_date") else None,
        "actualDeliveryDate": row["actual_delivery_date"].isoformat() if row.get("actual_delivery_date") else None,
        "estimatedDeliveryDate": row["estimated_delivery_date"].isoformat() if row.get("estimated_delivery_date") else None,
        "transportMode": row.get("transport_mode"),
        "driverDetails": row.get("driver_details"),
        "vehicleNumber": row.get("vehicle_number"),
        "trackingNumber": row.get("tracking_number"),
        "totalValue": _to_float(row["total_value"]),
        "notes": row.get("notes"),
        "requestedBy": row.get("requested_by"),
        "approvedBy": row.get("approved_by"),
        "completedBy": row.get("completed_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
        "items": items or [],
    }


def _row_to_transfer_item(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "type": row["type"],
        "category": row["category"],
        "currentStock": _to_float(row["current_stock"]),
        "transferQuantity": _to_float(row["transfer_quantity"]),
        "unit": row["unit"],
        "priority": row["priority"],
        "estimatedValue": _to_float(row["estimated_value"]),
        "requiresRefrigeration": row["requires_refrigeration"],
        "expiryDate": row["expiry_date"].isoformat() if row.get("expiry_date") else None,
        "brand": row.get("brand"),
        "grade": row.get("grade"),
    }


# Factory Locations Endpoints

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


# Transfer Endpoints

class ListTransfersRequest(BaseModel):
    query: Optional[str] = ""
    status: Optional[str] = None
    factory: Optional[str] = None
    priority: Optional[str] = None
    limit: int = 50
    offset: int = 0


class GetTransferRequest(BaseModel):
    transfer_number: Optional[str] = None
    id: Optional[str] = None


class CreateTransferRequest(BaseModel):
    transfer_number: str
    from_factory: str
    to_factory: str
    status: str = "Draft"
    priority: str = "Medium"
    requested_date: str
    scheduled_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    estimated_delivery_date: Optional[str] = None
    transport_mode: Optional[str] = None
    driver_details: Optional[str] = None
    vehicle_number: Optional[str] = None
    tracking_number: Optional[str] = None
    total_value: float = 0
    notes: Optional[str] = None
    requested_by: Optional[str] = None
    approved_by: Optional[str] = None
    completed_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    items: List[TransferItem] = []


class UpdateTransferRequest(BaseModel):
    id: str
    transfer_number: Optional[str] = None
    from_factory: Optional[str] = None
    to_factory: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    requested_date: Optional[str] = None
    scheduled_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    estimated_delivery_date: Optional[str] = None
    transport_mode: Optional[str] = None
    driver_details: Optional[str] = None
    vehicle_number: Optional[str] = None
    tracking_number: Optional[str] = None
    total_value: Optional[float] = None
    notes: Optional[str] = None
    requested_by: Optional[str] = None
    approved_by: Optional[str] = None
    completed_by: Optional[str] = None
    last_updated_by: Optional[str] = None
    items: Optional[List[TransferItem]] = None


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
                ft.id, ft.transfer_number, ft.from_factory, ft.to_factory,
                ft.status, ft.priority, ft.requested_date, ft.scheduled_date,
                ft.actual_delivery_date, ft.estimated_delivery_date,
                ft.transport_mode, ft.driver_details, ft.vehicle_number,
                ft.tracking_number, ft.total_value, ft.notes, ft.requested_by,
                ft.approved_by, ft.completed_by, ft.created_date,
                ft.last_updated, ft.last_updated_by
            FROM factory_transfers ft
            WHERE 1=1
        """

        # Add filters
        if req.query:
            query_parts.append(f"AND (ft.transfer_number ILIKE ${param_idx} OR ft.from_factory ILIKE ${param_idx} OR ft.to_factory ILIKE ${param_idx})")
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

        if req.priority:
            query_parts.append(f"AND ft.priority = ${param_idx}")
            params.append(req.priority)
            param_idx += 1

        # Build final query
        final_query = base_query + " ".join(query_parts) + f" ORDER BY ft.created_date DESC LIMIT ${param_idx} OFFSET ${param_idx + 1}"
        params.extend([req.limit, req.offset])

        rows = await conn.fetch(final_query, *params)
        
        result = []
        for row in rows:
            # Fetch items for this transfer
            items_rows = await conn.fetch(
                """
                SELECT * FROM factory_transfer_items 
                WHERE factory_transfer_id = $1
                ORDER BY name
                """,
                row["id"]
            )
            items = [_row_to_transfer_item(item_row) for item_row in items_rows]
            result.append(_row_to_transfer(row, items))

        # Get total count
        count_query = "SELECT COUNT(*) FROM factory_transfers ft WHERE 1=1 " + " ".join(query_parts)
        count_params = params[:-2]  # Exclude limit and offset
        total = await conn.fetchval(count_query, *count_params)

        return {"items": result, "total": total, "limit": req.limit, "offset": req.offset}


@factory_transfers_router.post("/get")
async def get_transfer(req: GetTransferRequest):
    if not req.transfer_number and not req.id:
        raise HTTPException(status_code=400, detail="Either transfer_number or id must be provided")

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if req.id:
            row = await conn.fetchrow("SELECT * FROM factory_transfers WHERE id = $1", req.id)
        else:
            row = await conn.fetchrow("SELECT * FROM factory_transfers WHERE transfer_number = $1", req.transfer_number)

        if not row:
            raise HTTPException(status_code=404, detail="Transfer not found")

        # Fetch items
        items_rows = await conn.fetch(
            "SELECT * FROM factory_transfer_items WHERE factory_transfer_id = $1 ORDER BY name",
            row["id"]
        )
        items = [_row_to_transfer_item(item_row) for item_row in items_rows]

        return _row_to_transfer(row, items)


@factory_transfers_router.post("/create")
async def create_transfer(req: CreateTransferRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            async with conn.transaction():
                # Insert transfer
                transfer_id = await conn.fetchval(
                    """
                    INSERT INTO factory_transfers (
                        transfer_number, from_factory, to_factory, status, priority,
                        requested_date, scheduled_date, actual_delivery_date,
                        estimated_delivery_date, transport_mode, driver_details,
                        vehicle_number, tracking_number, total_value, notes,
                        requested_by, approved_by, completed_by, last_updated_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    RETURNING id
                    """,
                    req.transfer_number, req.from_factory, req.to_factory, req.status,
                    req.priority, req.requested_date, req.scheduled_date,
                    req.actual_delivery_date, req.estimated_delivery_date,
                    req.transport_mode, req.driver_details, req.vehicle_number,
                    req.tracking_number, req.total_value, req.notes, req.requested_by,
                    req.approved_by, req.completed_by, req.last_updated_by
                )

                # Insert items
                for item in req.items:
                    await conn.execute(
                        """
                        INSERT INTO factory_transfer_items (
                            factory_transfer_id, name, type, category, current_stock,
                            transfer_quantity, unit, priority, estimated_value,
                            requires_refrigeration, expiry_date, brand, grade
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        """,
                        transfer_id, item.name, item.type, item.category, item.current_stock,
                        item.transfer_quantity, item.unit, item.priority, item.estimated_value,
                        item.requires_refrigeration, item.expiry_date, item.brand, item.grade
                    )

                return {"success": True, "id": str(transfer_id), "message": "Transfer created successfully"}

        except UniqueViolationError:
            raise HTTPException(status_code=400, detail="Transfer number already exists")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@factory_transfers_router.post("/update")
async def update_transfer(req: UpdateTransferRequest):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        try:
            async with conn.transaction():
                # Build update query dynamically
                updates = []
                params = []
                param_idx = 1

                if req.transfer_number is not None:
                    updates.append(f"transfer_number = ${param_idx}")
                    params.append(req.transfer_number)
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

                if req.priority is not None:
                    updates.append(f"priority = ${param_idx}")
                    params.append(req.priority)
                    param_idx += 1

                if req.requested_date is not None:
                    updates.append(f"requested_date = ${param_idx}")
                    params.append(req.requested_date)
                    param_idx += 1

                if req.scheduled_date is not None:
                    updates.append(f"scheduled_date = ${param_idx}")
                    params.append(req.scheduled_date)
                    param_idx += 1

                if req.actual_delivery_date is not None:
                    updates.append(f"actual_delivery_date = ${param_idx}")
                    params.append(req.actual_delivery_date)
                    param_idx += 1

                if req.estimated_delivery_date is not None:
                    updates.append(f"estimated_delivery_date = ${param_idx}")
                    params.append(req.estimated_delivery_date)
                    param_idx += 1

                if req.transport_mode is not None:
                    updates.append(f"transport_mode = ${param_idx}")
                    params.append(req.transport_mode)
                    param_idx += 1

                if req.driver_details is not None:
                    updates.append(f"driver_details = ${param_idx}")
                    params.append(req.driver_details)
                    param_idx += 1

                if req.vehicle_number is not None:
                    updates.append(f"vehicle_number = ${param_idx}")
                    params.append(req.vehicle_number)
                    param_idx += 1

                if req.tracking_number is not None:
                    updates.append(f"tracking_number = ${param_idx}")
                    params.append(req.tracking_number)
                    param_idx += 1

                if req.total_value is not None:
                    updates.append(f"total_value = ${param_idx}")
                    params.append(req.total_value)
                    param_idx += 1

                if req.notes is not None:
                    updates.append(f"notes = ${param_idx}")
                    params.append(req.notes)
                    param_idx += 1

                if req.requested_by is not None:
                    updates.append(f"requested_by = ${param_idx}")
                    params.append(req.requested_by)
                    param_idx += 1

                if req.approved_by is not None:
                    updates.append(f"approved_by = ${param_idx}")
                    params.append(req.approved_by)
                    param_idx += 1

                if req.completed_by is not None:
                    updates.append(f"completed_by = ${param_idx}")
                    params.append(req.completed_by)
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

                # Update items if provided
                if req.items is not None:
                    # Delete existing items
                    await conn.execute("DELETE FROM factory_transfer_items WHERE factory_transfer_id = $1", req.id)
                    
                    # Insert new items
                    for item in req.items:
                        await conn.execute(
                            """
                            INSERT INTO factory_transfer_items (
                                factory_transfer_id, name, type, category, current_stock,
                                transfer_quantity, unit, priority, estimated_value,
                                requires_refrigeration, expiry_date, brand, grade
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                            """,
                            req.id, item.name, item.type, item.category, item.current_stock,
                            item.transfer_quantity, item.unit, item.priority, item.estimated_value,
                            item.requires_refrigeration, item.expiry_date, item.brand, item.grade
                        )

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