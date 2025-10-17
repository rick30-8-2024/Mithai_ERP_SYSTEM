import os
import asyncpg
import bcrypt
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_CONNECTION_URL")

async def initialize_database():
    """
    Initialize the database by running the SQL file.
    Creates tables if they don't exist.
    Creates a default admin user if one doesn't exist.
    """
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        sql_file_path = os.path.join(os.path.dirname(__file__), 'init_db.sql')
        with open(sql_file_path, 'r') as f:
            sql_script = f.read()
        
        await conn.execute(sql_script)
        
        print("✓ Database tables initialized successfully")
        
        admin_exists = await conn.fetchrow(
            "SELECT id FROM users WHERE role = 'Admin' LIMIT 1"
        )
        
        if not admin_exists:
            print("⚙ No admin user found, creating default admin...")
            
            default_admin_username = "admin@mithai.com"
            default_admin_password = "Admin@123"
            
            password_bytes = default_admin_password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            all_permissions = [
                'Inventory', 'Recipe Management', 'Work Order', 'My Work Orders',
                'Kitchen Display', 'Purchase Order', 'Send to Factory',
                'Sales Order', 'Sales Order Approval', 'Sales Order Dispatch',
                'Gate Pass/Inward', 'User Management', 'Customer Management',
                'Accounting', 'Logistics & Routes', 'Quality Check',
                'Payment Tracking', 'CRM'
            ]
            
            await conn.execute(
                """
                INSERT INTO users (username, password, name, email, role, status, is_active, permissions)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """,
                default_admin_username,
                hashed_password,
                "System Administrator",
                default_admin_username,
                "Admin",
                "Active",
                True,
                all_permissions
            )
            
            print(f"✓ Default admin user created successfully")
            print(f"  Username: {default_admin_username}")
            print(f"  Password: {default_admin_password}")
            print(f"  Permissions: All {len(all_permissions)} cards enabled")
            print(f"  ⚠ IMPORTANT: Please change this password after first login!")
        else:
            print("✓ Admin user already exists")
        
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