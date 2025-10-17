from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_pool import get_db_pool
from decimal import Decimal
from datetime import date, datetime, timedelta

dispatch_router = APIRouter(prefix="/api", tags=["dispatch"])


def _to_float(v) -> float:
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0 if v is None else float(v)


def _row_to_dispatch_order(row, items: List[dict] = None) -> dict:
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
        "dispatchDate": row["dispatch_date"].isoformat() if row.get("dispatch_date") else None,
        "trackingNumber": row.get("tracking_number"),
        "packagingInstructions": row.get("packaging_instructions"),
        "onHoldReason": row.get("on_hold_reason"),
        "onHoldBy": row.get("on_hold_by"),
        "onHoldDate": row["on_hold_date"].isoformat() if row.get("on_hold_date") else None,
        "createdBy": row.get("created_by"),
        "createdDate": row["created_date"].isoformat() if row.get("created_date") else None,
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
        "lastUpdatedBy": row.get("last_updated_by"),
        "items": items or [],
    }


def _row_to_dispatch_item(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "quantity": _to_float(row["quantity"]),
        "unit": row["unit"],
        "weight": _to_float(row["weight"]),
        "weightUnit": row["weight_unit"],
        "unitPrice": _to_float(row["unit_price"]),
        "totalPrice": _to_float(row["total_price"]),
        "dispatchedQuantity": _to_float(row.get("dispatched_quantity", 0)),
    }


def _row_to_finished_good(row) -> dict:
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "sku": row["sku"],
        "currentStock": _to_float(row["current_stock"]),
        "unit": row["unit"],
        "status": row["status"],
        "lastUpdated": row["last_updated"].isoformat() if row.get("last_updated") else None,
    }


def _row_to_work_order(row) -> dict:
    return {
        "id": str(row["id"]),
        "workOrderNumber": row["work_order_number"],
        "recipeName": row.get("recipe_name"),
        "batchSize": _to_float(row.get("batch_size")),
        "targetQuantity": _to_float(row.get("target_quantity")),
        "actualQuantity": _to_float(row.get("actual_quantity")),
        "status": row["status"],
        "priority": row.get("priority"),
        "scheduledDate": row["scheduled_date"].isoformat() if row.get("scheduled_date") else None,
        "completedDate": row["completed_at"].isoformat() if row.get("completed_at") else None,
        "assignedWorker": row.get("assigned_worker"),
    }


@dispatch_router.get("/dispatch-orders")
async def list_dispatch_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
):
    pool = await get_db_pool()
    
    valid_statuses = [
        'Ready for Dispatch', 'Packaging', 'Partially Fulfilled', 
        'Dispatched', 'In Transit', 'On Hold', 'Delayed'
    ]
    
    query = """
        SELECT * FROM sales_orders
        WHERE status = ANY($1)
    """
    params = [valid_statuses]
    param_count = 2

    if status:
        query += f" AND status = ${param_count}"
        params.append(status)
        param_count += 1

    if priority:
        query += f" AND priority = ${param_count}"
        params.append(priority)
        param_count += 1

    if search:
        query += f" AND (order_number ILIKE ${param_count} OR customer_company ILIKE ${param_count} OR customer_name ILIKE ${param_count})"
        params.append(f"%{search}%")
        param_count += 1

    query += " ORDER BY priority DESC, due_date ASC, order_date DESC"
    
    rows = await pool.fetch(query, *params)

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
            items_map[so_id].append(_row_to_dispatch_item(item_row))

    orders = [_row_to_dispatch_order(row, items_map.get(str(row["id"]), [])) for row in rows]

    return {
        "items": orders,
        "total": len(orders)
    }


@dispatch_router.get("/dispatch-orders/{order_id}")
async def get_dispatch_order(order_id: str):
    pool = await get_db_pool()

    query = "SELECT * FROM sales_orders WHERE id = $1"
    row = await pool.fetchrow(query, order_id)

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    items_query = "SELECT * FROM sales_order_items WHERE sales_order_id = $1"
    items_rows = await pool.fetch(items_query, row["id"])
    items = [_row_to_dispatch_item(item_row) for item_row in items_rows]

    dispatch_query = """
        SELECT dr.*, 
               COALESCE(json_agg(
                   json_build_object(
                       'id', di.id,
                       'itemName', di.item_name,
                       'quantityDispatched', di.quantity_dispatched
                   )
               ) FILTER (WHERE di.id IS NOT NULL), '[]') as dispatch_items
        FROM dispatch_records dr
        LEFT JOIN dispatch_items di ON dr.id = di.dispatch_record_id
        WHERE dr.sales_order_id = $1
        GROUP BY dr.id
        ORDER BY dr.dispatch_date DESC
    """
    dispatch_rows = await pool.fetch(dispatch_query, row["id"])
    
    dispatch_history = []
    for dr in dispatch_rows:
        dispatch_history.append({
            "id": str(dr["id"]),
            "dispatchId": dr["dispatch_id"],
            "dispatchNumber": dr["dispatch_number"],
            "trackingNumber": dr.get("tracking_number"),
            "dispatchDate": dr["dispatch_date"].isoformat() if dr.get("dispatch_date") else None,
            "status": dr["status"],
            "items": dr.get("dispatch_items", [])
        })

    order_data = _row_to_dispatch_order(row, items)
    order_data["dispatchHistory"] = dispatch_history

    return order_data


@dispatch_router.get("/finished-goods")
async def list_finished_goods(item_names: Optional[str] = None):
    pool = await get_db_pool()

    query = """
        SELECT id, name, sku, current_stock, unit, status, last_updated
        FROM finished_goods
        WHERE 1=1
    """
    params = []

    if item_names:
        names_list = [name.strip() for name in item_names.split(",")]
        query += " AND name = ANY($1)"
        params.append(names_list)

    query += " ORDER BY name ASC"

    rows = await pool.fetch(query, *params) if params else await pool.fetch(query)

    goods = [_row_to_finished_good(row) for row in rows]

    return {
        "items": goods,
        "total": len(goods)
    }


@dispatch_router.get("/work-orders/for-dispatch")
async def list_work_orders_for_dispatch():
    pool = await get_db_pool()

    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)

    query = """
        SELECT wo.id, wo.work_order_number, r.name as recipe_name,
               wo.batch_size, wo.target_quantity, wo.actual_quantity,
               wo.status, wo.priority, wo.scheduled_date, wo.completed_at,
               wo.assigned_worker
        FROM work_orders wo
        LEFT JOIN recipes r ON wo.recipe_id = r.id
        WHERE wo.status = 'In Progress'
           OR (wo.status = 'Completed' AND wo.completed_at >= $1)
        ORDER BY wo.priority DESC, wo.scheduled_date ASC
    """

    rows = await pool.fetch(query, twenty_four_hours_ago)

    work_orders = [_row_to_work_order(row) for row in rows]

    return {
        "items": work_orders,
        "total": len(work_orders)
    }


class HoldOrderRequest(BaseModel):
    reason: str
    held_by: str


@dispatch_router.patch("/dispatch-orders/{order_id}/hold")
async def hold_order(order_id: str, req: HoldOrderRequest):
    pool = await get_db_pool()

    try:
        query = "SELECT id, status FROM sales_orders WHERE id = $1"
        row = await pool.fetchrow(query, order_id)

        if not row:
            raise HTTPException(status_code=404, detail="Order not found")

        if row["status"] == "On Hold":
            raise HTTPException(status_code=400, detail="Order is already on hold")

        update_query = """
            UPDATE sales_orders
            SET status = 'On Hold',
                on_hold_reason = $1,
                on_hold_by = $2,
                on_hold_date = NOW(),
                last_updated = NOW()
            WHERE id = $3
            RETURNING *
        """
        updated_row = await pool.fetchrow(update_query, req.reason, req.held_by, order_id)

        items_query = "SELECT * FROM sales_order_items WHERE sales_order_id = $1"
        items_rows = await pool.fetch(items_query, updated_row["id"])
        items = [_row_to_dispatch_item(item_row) for item_row in items_rows]

        return {
            "success": True,
            "message": "Order put on hold successfully",
            "order": _row_to_dispatch_order(updated_row, items)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@dispatch_router.patch("/dispatch-orders/{order_id}/resume")
async def resume_order(order_id: str):
    pool = await get_db_pool()

    try:
        query = "SELECT id, status FROM sales_orders WHERE id = $1"
        row = await pool.fetchrow(query, order_id)

        if not row:
            raise HTTPException(status_code=404, detail="Order not found")

        if row["status"] != "On Hold":
            raise HTTPException(status_code=400, detail="Order is not on hold")

        update_query = """
            UPDATE sales_orders
            SET status = 'Ready for Dispatch',
                on_hold_reason = NULL,
                on_hold_by = NULL,
                on_hold_date = NULL,
                last_updated = NOW()
            WHERE id = $1
            RETURNING *
        """
        updated_row = await pool.fetchrow(update_query, order_id)

        items_query = "SELECT * FROM sales_order_items WHERE sales_order_id = $1"
        items_rows = await pool.fetch(items_query, updated_row["id"])
        items = [_row_to_dispatch_item(item_row) for item_row in items_rows]

        return {
            "success": True,
            "message": "Order resumed successfully",
            "order": _row_to_dispatch_order(updated_row, items)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


class SkuAssignment(BaseModel):
    sku: str
    quantity: float


class InventoryAssignment(BaseModel):
    item_id: int
    sku_assignments: List[SkuAssignment]


class LogisticsAllocation(BaseModel):
    transport_service: str
    vehicle_number: str
    driver_name: str
    driver_contact: str
    comments: Optional[str] = None
    item_allocations: Dict[str, float]


class CompleteDispatchRequest(BaseModel):
    inventory_assignments: List[InventoryAssignment]
    logistics: List[LogisticsAllocation]
    created_by: str


@dispatch_router.post("/dispatch-orders/{order_id}/complete-dispatch")
async def complete_dispatch(order_id: str, req: CompleteDispatchRequest):
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                order_query = "SELECT * FROM sales_orders WHERE id = $1 FOR UPDATE"
                order = await conn.fetchrow(order_query, order_id)

                if not order:
                    raise HTTPException(status_code=404, detail="Order not found")

                if order["status"] not in ['Ready for Dispatch', 'Packaging', 'Partially Fulfilled']:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Order cannot be dispatched from status: {order['status']}"
                    )

                items_query = "SELECT * FROM sales_order_items WHERE sales_order_id = $1"
                items = await conn.fetch(items_query, order_id)

                item_assignments = {}
                for inv_assign in req.inventory_assignments:
                    item_assignments[inv_assign.item_id] = inv_assign.sku_assignments

                sku_stock_map = {}
                for inv_assign in req.inventory_assignments:
                    for sku_assign in inv_assign.sku_assignments:
                        if sku_assign.sku not in sku_stock_map:
                            stock_query = "SELECT current_stock FROM finished_goods WHERE sku = $1 FOR UPDATE"
                            stock_row = await conn.fetchrow(stock_query, sku_assign.sku)
                            if not stock_row:
                                raise HTTPException(
                                    status_code=400,
                                    detail=f"SKU {sku_assign.sku} not found in inventory"
                                )
                            sku_stock_map[sku_assign.sku] = float(stock_row["current_stock"])

                for inv_assign in req.inventory_assignments:
                    for sku_assign in inv_assign.sku_assignments:
                        if sku_stock_map[sku_assign.sku] < sku_assign.quantity:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Insufficient stock for SKU {sku_assign.sku}. Available: {sku_stock_map[sku_assign.sku]}, Required: {sku_assign.quantity}"
                            )
                        sku_stock_map[sku_assign.sku] -= sku_assign.quantity

                item_assigned_totals = {}
                for inv_assign in req.inventory_assignments:
                    total = sum(sku_assign.quantity for sku_assign in inv_assign.sku_assignments)
                    item_assigned_totals[inv_assign.item_id] = total

                for logistics in req.logistics:
                    for item_id_str, alloc_qty in logistics.item_allocations.items():
                        item_id = int(item_id_str)
                        if alloc_qty > item_assigned_totals.get(item_id, 0):
                            raise HTTPException(
                                status_code=400,
                                detail=f"Logistics allocation ({alloc_qty}) exceeds assigned quantity ({item_assigned_totals.get(item_id, 0)}) for item {item_id}"
                            )

                order_number = order["order_number"]
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                year = datetime.now().year

                dispatch_id = f"DISP-{order_number}-{timestamp}"
                dispatch_number = f"DN-{order_number}-{year}"
                tracking_number = f"TRK-{order_number}-{year}"

                dispatch_insert = """
                    INSERT INTO dispatch_records (
                        dispatch_id, dispatch_number, sales_order_id, tracking_number,
                        dispatch_date, status, created_by
                    ) VALUES ($1, $2, $3, $4, NOW(), 'Dispatched', $5)
                    RETURNING id
                """
                dispatch_row = await conn.fetchrow(
                    dispatch_insert,
                    dispatch_id, dispatch_number, order_id, tracking_number, req.created_by
                )
                dispatch_record_id = dispatch_row["id"]

                for item in items:
                    item_id = item["id"]
                    if item_id in item_assigned_totals:
                        dispatch_item_insert = """
                            INSERT INTO dispatch_items (
                                dispatch_record_id, sales_order_item_id, item_name, quantity_dispatched
                            ) VALUES ($1, $2, $3, $4)
                            RETURNING id
                        """
                        dispatch_item_row = await conn.fetchrow(
                            dispatch_item_insert,
                            dispatch_record_id,
                            item_id,
                            item["name"],
                            item_assigned_totals[item_id]
                        )
                        dispatch_item_id = dispatch_item_row["id"]

                        if item_id in item_assignments:
                            for sku_assign in item_assignments[item_id]:
                                sku_assignment_insert = """
                                    INSERT INTO dispatch_sku_assignments (
                                        dispatch_item_id, sku, quantity_assigned
                                    ) VALUES ($1, $2, $3)
                                """
                                await conn.execute(
                                    sku_assignment_insert,
                                    dispatch_item_id,
                                    sku_assign.sku,
                                    sku_assign.quantity
                                )

                for logistics in req.logistics:
                    logistics_insert = """
                        INSERT INTO dispatch_logistics (
                            dispatch_record_id, transport_service, vehicle_number,
                            driver_name, driver_contact, comments
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id
                    """
                    logistics_row = await conn.fetchrow(
                        logistics_insert,
                        dispatch_record_id,
                        logistics.transport_service,
                        logistics.vehicle_number,
                        logistics.driver_name,
                        logistics.driver_contact,
                        logistics.comments
                    )
                    logistics_id = logistics_row["id"]

                    for item_id_str, alloc_qty in logistics.item_allocations.items():
                        item_id = int(item_id_str)
                        allocation_insert = """
                            INSERT INTO dispatch_logistics_allocations (
                                dispatch_logistics_id, sales_order_item_id, quantity_allocated
                            ) VALUES ($1, $2, $3)
                        """
                        await conn.execute(
                            allocation_insert,
                            logistics_id,
                            item_id,
                            alloc_qty
                        )

                for inv_assign in req.inventory_assignments:
                    for sku_assign in inv_assign.sku_assignments:
                        deduct_stock_query = """
                            UPDATE finished_goods
                            SET current_stock = current_stock - $1,
                                last_updated = NOW()
                            WHERE sku = $2
                            RETURNING current_stock
                        """
                        updated_stock_row = await conn.fetchrow(
                            deduct_stock_query,
                            sku_assign.quantity,
                            sku_assign.sku
                        )
                        
                        new_stock = float(updated_stock_row["current_stock"])
                        
                        if new_stock == 0:
                            new_status = 'Out of Stock'
                        elif new_stock < 50:
                            new_status = 'Low Stock'
                        else:
                            new_status = 'In Stock'
                        
                        update_status_query = """
                            UPDATE finished_goods
                            SET status = $1
                            WHERE sku = $2
                        """
                        await conn.execute(update_status_query, new_status, sku_assign.sku)

                for item_id, qty_dispatched in item_assigned_totals.items():
                    update_item_query = """
                        UPDATE sales_order_items
                        SET dispatched_quantity = COALESCE(dispatched_quantity, 0) + $1
                        WHERE id = $2
                    """
                    await conn.execute(update_item_query, qty_dispatched, item_id)

                updated_items = await conn.fetch(items_query, order_id)
                
                all_fully_dispatched = True
                any_partially_dispatched = False
                
                for item in updated_items:
                    dispatched = float(item.get("dispatched_quantity") or 0)
                    quantity = float(item["quantity"])
                    
                    if dispatched < quantity:
                        all_fully_dispatched = False
                    if dispatched > 0:
                        any_partially_dispatched = True

                if all_fully_dispatched:
                    new_status = 'Dispatched'
                elif any_partially_dispatched:
                    new_status = 'Partially Fulfilled'
                else:
                    new_status = 'Ready for Dispatch'

                update_order_query = """
                    UPDATE sales_orders
                    SET status = $1,
                        dispatch_date = NOW(),
                        tracking_number = $2,
                        last_updated = NOW()
                    WHERE id = $3
                """
                await conn.execute(update_order_query, new_status, tracking_number, order_id)

                return {
                    "success": True,
                    "message": "Dispatch completed successfully",
                    "dispatchId": dispatch_id,
                    "dispatchNumber": dispatch_number,
                    "trackingNumber": tracking_number,
                    "status": new_status
                }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@dispatch_router.get("/dispatch-records/order/{order_id}")
async def get_dispatch_records_by_order(order_id: str):
    pool = await get_db_pool()

    dispatch_query = """
        SELECT dr.*
        FROM dispatch_records dr
        WHERE dr.sales_order_id = $1
        ORDER BY dr.dispatch_date DESC
    """
    dispatch_rows = await pool.fetch(dispatch_query, order_id)

    if not dispatch_rows:
        return {
            "items": [],
            "total": 0
        }

    dispatch_records = []
    for dr in dispatch_rows:
        items_query = """
            SELECT di.*, dsa.sku, dsa.quantity_assigned
            FROM dispatch_items di
            LEFT JOIN dispatch_sku_assignments dsa ON di.id = dsa.dispatch_item_id
            WHERE di.dispatch_record_id = $1
        """
        items_rows = await pool.fetch(items_query, dr["id"])

        items_map = {}
        for item_row in items_rows:
            item_id = str(item_row["id"])
            if item_id not in items_map:
                items_map[item_id] = {
                    "id": item_id,
                    "itemName": item_row["item_name"],
                    "quantityDispatched": _to_float(item_row["quantity_dispatched"]),
                    "skuAssignments": []
                }
            
            if item_row.get("sku"):
                items_map[item_id]["skuAssignments"].append({
                    "sku": item_row["sku"],
                    "quantity": _to_float(item_row["quantity_assigned"])
                })

        logistics_query = """
            SELECT dl.*, dla.sales_order_item_id, dla.quantity_allocated
            FROM dispatch_logistics dl
            LEFT JOIN dispatch_logistics_allocations dla ON dl.id = dla.dispatch_logistics_id
            WHERE dl.dispatch_record_id = $1
        """
        logistics_rows = await pool.fetch(logistics_query, dr["id"])

        logistics_map = {}
        for log_row in logistics_rows:
            log_id = str(log_row["id"])
            if log_id not in logistics_map:
                logistics_map[log_id] = {
                    "id": log_id,
                    "transportService": log_row["transport_service"],
                    "vehicleNumber": log_row["vehicle_number"],
                    "driverName": log_row["driver_name"],
                    "driverContact": log_row["driver_contact"],
                    "comments": log_row.get("comments"),
                    "allocations": []
                }
            
            if log_row.get("sales_order_item_id"):
                logistics_map[log_id]["allocations"].append({
                    "itemId": str(log_row["sales_order_item_id"]),
                    "quantity": _to_float(log_row["quantity_allocated"])
                })

        dispatch_records.append({
            "id": str(dr["id"]),
            "dispatchId": dr["dispatch_id"],
            "dispatchNumber": dr["dispatch_number"],
            "trackingNumber": dr.get("tracking_number"),
            "dispatchDate": dr["dispatch_date"].isoformat() if dr.get("dispatch_date") else None,
            "status": dr["status"],
            "createdBy": dr.get("created_by"),
            "items": list(items_map.values()),
            "logistics": list(logistics_map.values())
        })

    return {
        "items": dispatch_records,
        "total": len(dispatch_records)
    }