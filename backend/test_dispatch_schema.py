import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_CONNECTION_URL")

async def test_schema():
    """
    Test that all dispatch-related tables and columns exist
    """
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        print("Testing Sales Order Dispatch Schema...")
        print("=" * 60)
        
        sales_order_columns = [
            'approved_date', 'dispatch_date', 'estimated_delivery_date',
            'dispatch_team', 'vehicle_number', 'driver_name', 'driver_contact',
            'tracking_number', 'special_instructions', 'delivery_type',
            'distance', 'estimated_travel_time', 'on_hold_reason',
            'on_hold_by', 'on_hold_date'
        ]
        
        print("\n1. Checking sales_orders table columns...")
        for col in sales_order_columns:
            result = await conn.fetchval(
                """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_name='sales_orders' AND column_name=$1
                """,
                col
            )
            status = "✓" if result > 0 else "✗"
            print(f"   {status} {col}")
        
        order_items_columns = ['dispatched_quantity', 'weight', 'weight_unit']
        print("\n2. Checking sales_order_items table columns...")
        for col in order_items_columns:
            result = await conn.fetchval(
                """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_name='sales_order_items' AND column_name=$1
                """,
                col
            )
            status = "✓" if result > 0 else "✗"
            print(f"   {status} {col}")
        
        tables = [
            'finished_goods',
            'dispatch_records',
            'dispatch_items',
            'dispatch_sku_assignments',
            'dispatch_logistics',
            'dispatch_logistics_allocations'
        ]
        
        print("\n3. Checking dispatch tables...")
        for table in tables:
            result = await conn.fetchval(
                """
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_name=$1
                """,
                table
            )
            status = "✓" if result > 0 else "✗"
            print(f"   {status} {table}")
        
        print("\n4. Checking finished_goods sample data...")
        count = await conn.fetchval("SELECT COUNT(*) FROM finished_goods")
        print(f"   ✓ {count} items in finished_goods table")
        
        print("\n5. Checking indexes...")
        indexes = [
            'idx_finished_goods_sku',
            'idx_finished_goods_name',
            'idx_dispatch_records_dispatch_id',
            'idx_dispatch_records_sales_order_id',
            'idx_dispatch_items_dispatch_id',
            'idx_dispatch_sku_assignments_dispatch_item_id',
            'idx_dispatch_logistics_dispatch_id',
            'idx_dispatch_logistics_allocations_logistics_id'
        ]
        
        for idx in indexes:
            result = await conn.fetchval(
                """
                SELECT COUNT(*) FROM pg_indexes
                WHERE indexname=$1
                """,
                idx
            )
            status = "✓" if result > 0 else "✗"
            print(f"   {status} {idx}")
        
        await conn.close()
        
        print("\n" + "=" * 60)
        print("✓ Schema test completed successfully!")
        
    except asyncpg.PostgresError as e:
        print(f"\n✗ Database error: {e}")
        raise
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_schema())