"""
Migration script to add 'transport' column to customer_addresses table.
Run this once after deploying the updated code.
"""
import asyncio
import os
import sys

# Add parent directory to path so we can import db_pool
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_pool import get_db_pool

async def run_migration():
    try:
        pool = await get_db_pool()
        
        # Add transport column if it doesn't exist
        await pool.execute("""
            ALTER TABLE customer_addresses 
            ADD COLUMN IF NOT EXISTS transport TEXT;
        """)
        print("Migration completed: 'transport' column added to customer_addresses table")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    asyncio.run(run_migration())
