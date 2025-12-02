import asyncio
import asyncpg
import os

async def run_migration():
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/mithai_erp')
    
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    print("Reading migration script...")
    with open('database/migrate_customer_schema.sql', 'r') as f:
        migration_sql = f.read()
    
    print("Running migration...")
    try:
        await conn.execute(migration_sql)
        print("✅ Migration completed successfully!")
        print("The old columns have been removed and new tables created.")
        print("You can now restart your backend server and try creating a customer again.")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    print("=== Customer Schema Migration ===")
    print("This will update the customers table schema to support multiple contacts/emails/phones/addresses")
    print()
    asyncio.run(run_migration())