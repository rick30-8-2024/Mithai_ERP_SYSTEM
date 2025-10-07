import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("POSTGRES_CONNECTION_URL")

# Global connection pool
_pool = None

async def get_db_pool():
    """
    Get or create the database connection pool.
    Returns the global connection pool instance.
    """
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
    return _pool

async def close_db_pool():
    """
    Close the database connection pool.
    """
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None

async def get_db_connection():
    """
    Get a connection from the pool.
    Usage:
        async with get_db_connection() as conn:
            # use conn
    """
    pool = await get_db_pool()
    return pool.acquire()