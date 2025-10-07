import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("POSTGRES_CONNECTION_URL")

async def initialize_database():
    """
    Initialize the database by running the SQL file.
    Creates tables if they don't exist.
    """
    try:
        # Connect to the database
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Read the SQL file
        sql_file_path = os.path.join(os.path.dirname(__file__), 'init_db.sql')
        with open(sql_file_path, 'r') as f:
            sql_script = f.read()
        
        # Execute the SQL script
        await conn.execute(sql_script)
        
        print("✓ Database tables initialized successfully")
        
        # Close the connection
        await conn.close()
        
    except FileNotFoundError:
        print("✗ Error: init_db.sql file not found")
        raise
    except asyncpg.PostgresError as e:
        print(f"✗ Database error during initialization: {e}")
        raise
    except Exception as e:
        print(f"✗ Unexpected error during database initialization: {e}")
        raise