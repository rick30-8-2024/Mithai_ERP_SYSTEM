import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_CONNECTION_URL")

async def drop_all_tables():
    """
    Drop all tables from the database.
    This will permanently delete all tables and their data.
    """
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Drop all tables in the public schema
        await conn.execute("""
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO public;
        """)
        
        print("✓ All tables dropped successfully")
        
        await conn.close()
        
    except asyncpg.PostgresError as e:
        print(f"✗ Database error while dropping tables: {e}")
        raise
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(drop_all_tables())