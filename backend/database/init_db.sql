-- Initialize database tables for Mithai ERP System

-- ============================================
-- ROLE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS Role (
    role TEXT PRIMARY KEY,
    access TEXT NOT NULL
);

INSERT INTO Role (role, access) VALUES 
    ('Admin', 'full'),
    ('Production Manager', 'production'),
    ('Kitchen Staff', 'kitchen'),
    ('Inventory Manager', 'inventory'),
    ('Sales Manager', 'sales'),
    ('Accountant', 'finance'),
    ('Quality Inspector', 'quality'),
    ('Logistics Coordinator', 'logistics'),
    ('HR Manager', 'hr'),
    ('Trainee', 'limited')
ON CONFLICT (role) DO NOTHING;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    permissions TEXT[],
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT,
    FOREIGN KEY (role) REFERENCES Role(role)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 0,
    max_stock NUMERIC NOT NULL,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT,
    brand TEXT,
    grade TEXT,
    packing_weight TEXT,
    supplier TEXT,
    category_type TEXT,
    packing_qty TEXT,
    factory TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);

-- ============================================
-- RECIPE MANAGEMENT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    total_yield NUMERIC NOT NULL,
    yield_unit TEXT NOT NULL,
    preparation_time INTEGER NOT NULL,
    cooking_time INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    brand TEXT,
    grade TEXT,
    packing_weight NUMERIC,
    packing_unit TEXT,
    packing_quantity_apx INTEGER,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipes_sku ON recipes(sku);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes(status);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    supplier TEXT,
    grade TEXT,
    cost NUMERIC NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

CREATE TABLE IF NOT EXISTS recipe_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    instruction TEXT NOT NULL,
    step_number INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);

-- ============================================
-- WORK ORDER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_number TEXT NOT NULL UNIQUE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
    batch_size INTEGER NOT NULL DEFAULT 1,
    target_quantity NUMERIC NOT NULL,
    actual_quantity NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    priority TEXT NOT NULL DEFAULT 'Medium',
    scheduled_date DATE,
    due_date DATE,
    assigned_worker TEXT,
    estimated_cost NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT,
    started_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    elapsed_time INTEGER DEFAULT 0,
    expected_time INTEGER
);

CREATE INDEX IF NOT EXISTS idx_work_orders_number ON work_orders(work_order_number);
CREATE INDEX IF NOT EXISTS idx_work_orders_recipe_id ON work_orders(recipe_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_worker ON work_orders(assigned_worker);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON work_orders(scheduled_date);

CREATE TABLE IF NOT EXISTS work_order_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    required_quantity NUMERIC NOT NULL,
    actual_quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    supplier TEXT,
    grade TEXT,
    cost NUMERIC NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_work_order_ingredients_work_order_id ON work_order_ingredients(work_order_id);

-- ============================================
-- PURCHASE ORDER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    supplier TEXT NOT NULL,
    supplier_contact TEXT,
    supplier_email TEXT,
    supplier_address TEXT,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft',
    priority TEXT NOT NULL DEFAULT 'Medium',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    payment_terms TEXT,
    notes TEXT,
    approved_by TEXT,
    created_by TEXT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_priority ON purchase_orders(priority);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    supplier TEXT,
    supplier_contact TEXT,
    supplier_email TEXT,
    brand TEXT,
    grade TEXT,
    description TEXT,
    packing_weight NUMERIC,
    packing_unit TEXT,
    expected_inward_date DATE,
    delivery_status TEXT NOT NULL DEFAULT 'Pending',
    quality_status TEXT NOT NULL DEFAULT 'Pending'
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);

-- ============================================
-- FACTORY TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS factory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    manager TEXT,
    contact TEXT,
    capacity TEXT,
    specialization TEXT[],
    distance TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_factory_locations_name ON factory_locations(name);
CREATE INDEX IF NOT EXISTS idx_factory_locations_status ON factory_locations(status);

INSERT INTO factory_locations (name, location, manager, contact, capacity, specialization, distance, status)
VALUES
    ('Main Production Unit', 'Mumbai, Maharashtra', 'Rajesh Kumar', '+91 98765 43210', '5000 kg/day', ARRAY['Milk Products', 'Traditional Sweets'], '0 km', 'Active'),
    ('North India Factory', 'Delhi, NCR', 'Priya Sharma', '+91 98765 43211', '3000 kg/day', ARRAY['Dry Fruits', 'Premium Sweets'], '1,400 km', 'Active'),
    ('South Processing Center', 'Bangalore, Karnataka', 'Suresh Reddy', '+91 98765 43212', '4000 kg/day', ARRAY['Traditional Products', 'Regional Sweets'], '840 km', 'Active'),
    ('Western Distribution Hub', 'Pune, Maharashtra', 'Amit Singh', '+91 98765 43213', '2500 kg/day', ARRAY['Packaging', 'Quality Control'], '150 km', 'Maintenance')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS factory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number TEXT NOT NULL UNIQUE,
    from_factory TEXT NOT NULL,
    to_factory TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    priority TEXT NOT NULL DEFAULT 'Medium',
    requested_date DATE NOT NULL,
    scheduled_date DATE,
    actual_delivery_date DATE,
    estimated_delivery_date DATE,
    transport_mode TEXT,
    driver_details TEXT,
    vehicle_number TEXT,
    tracking_number TEXT,
    total_value NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    requested_by TEXT,
    approved_by TEXT,
    completed_by TEXT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_factory_transfers_number ON factory_transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_factory_transfers_from_factory ON factory_transfers(from_factory);
CREATE INDEX IF NOT EXISTS idx_factory_transfers_to_factory ON factory_transfers(to_factory);
CREATE INDEX IF NOT EXISTS idx_factory_transfers_status ON factory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_factory_transfers_priority ON factory_transfers(priority);

CREATE TABLE IF NOT EXISTS factory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_transfer_id UUID NOT NULL REFERENCES factory_transfers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    current_stock NUMERIC NOT NULL DEFAULT 0,
    transfer_quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    estimated_value NUMERIC NOT NULL DEFAULT 0,
    requires_refrigeration BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date DATE,
    brand TEXT,
    grade TEXT
);

CREATE INDEX IF NOT EXISTS idx_factory_transfer_items_transfer_id ON factory_transfer_items(factory_transfer_id);

-- ============================================
-- SALES ORDER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_company TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT,
    customer_email TEXT,
    customer_address TEXT,
    order_date DATE NOT NULL,
    due_date DATE NOT NULL,
    delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'Pending',
    priority TEXT NOT NULL DEFAULT 'Medium',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    sales_rep TEXT,
    discount NUMERIC NOT NULL DEFAULT 0,
    taxes NUMERIC NOT NULL DEFAULT 0,
    final_amount NUMERIC NOT NULL DEFAULT 0,
    created_by TEXT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT,
    approved_date DATE,
    dispatch_date DATE,
    estimated_delivery_date DATE,
    dispatch_team VARCHAR(100),
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    tracking_number VARCHAR(100) UNIQUE,
    special_instructions TEXT,
    delivery_type VARCHAR(20),
    distance VARCHAR(50),
    estimated_travel_time VARCHAR(50),
    on_hold_reason TEXT,
    on_hold_by VARCHAR(100),
    on_hold_date DATE,
    CONSTRAINT sales_orders_delivery_type_check CHECK (delivery_type IN ('Standard', 'Express', 'Same Day', 'Scheduled'))
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_company ON sales_orders(customer_company);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_priority ON sales_orders(priority);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    weight NUMERIC,
    weight_unit TEXT,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    dispatched_quantity NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_sales_order_id ON sales_order_items(sales_order_id);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    customer_type TEXT NOT NULL DEFAULT 'Regular',
    status TEXT NOT NULL DEFAULT 'Active',
    credit_limit NUMERIC DEFAULT 0,
    outstanding_balance NUMERIC DEFAULT 0,
    payment_terms TEXT,
    notes TEXT,
    created_by TEXT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);

-- ============================================
-- FINISHED GOODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS finished_goods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finished_goods_status_check CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock'))
);

CREATE INDEX IF NOT EXISTS idx_finished_goods_sku ON finished_goods(sku);
CREATE INDEX IF NOT EXISTS idx_finished_goods_name ON finished_goods(name);

INSERT INTO finished_goods (name, sku, current_stock, unit, status)
VALUES
    ('Kaju Katli', 'FG-KK-001', 150.00, 'kg', 'In Stock'),
    ('Gulab Jamun', 'FG-GJ-002', 200.00, 'kg', 'In Stock'),
    ('Rasgulla', 'FG-RG-003', 180.00, 'kg', 'In Stock'),
    ('Jalebi', 'FG-JL-004', 120.00, 'kg', 'In Stock'),
    ('Soan Papdi', 'FG-SP-005', 90.00, 'kg', 'Low Stock'),
    ('Barfi Mix', 'FG-BM-006', 160.00, 'kg', 'In Stock'),
    ('Ladoo Assorted', 'FG-LA-007', 140.00, 'kg', 'In Stock'),
    ('Peda', 'FG-PD-008', 110.00, 'kg', 'In Stock'),
    ('Kalakand', 'FG-KL-009', 95.00, 'kg', 'Low Stock'),
    ('Sandesh', 'FG-SD-010', 130.00, 'kg', 'In Stock')
ON CONFLICT (sku) DO NOTHING;

-- ============================================
-- DISPATCH TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS dispatch_records (
    id SERIAL PRIMARY KEY,
    dispatch_id VARCHAR(50) UNIQUE NOT NULL,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    dispatch_number VARCHAR(50) UNIQUE NOT NULL,
    dispatch_date DATE NOT NULL,
    tracking_number VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_records_dispatch_id ON dispatch_records(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_records_sales_order_id ON dispatch_records(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_records_dispatch_number ON dispatch_records(dispatch_number);
CREATE INDEX IF NOT EXISTS idx_dispatch_records_status ON dispatch_records(status);

CREATE TABLE IF NOT EXISTS dispatch_items (
    id SERIAL PRIMARY KEY,
    dispatch_id INTEGER REFERENCES dispatch_records(id) ON DELETE CASCADE,
    order_item_id INTEGER,
    item_name VARCHAR(200) NOT NULL,
    quantity_dispatched DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_items_dispatch_id ON dispatch_items(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_items_order_item_id ON dispatch_items(order_item_id);

CREATE TABLE IF NOT EXISTS dispatch_sku_assignments (
    id SERIAL PRIMARY KEY,
    dispatch_item_id INTEGER REFERENCES dispatch_items(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    quantity_assigned DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_sku_assignments_dispatch_item_id ON dispatch_sku_assignments(dispatch_item_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_sku_assignments_sku ON dispatch_sku_assignments(sku);

CREATE TABLE IF NOT EXISTS dispatch_logistics (
    id SERIAL PRIMARY KEY,
    dispatch_id INTEGER REFERENCES dispatch_records(id) ON DELETE CASCADE,
    transport_service VARCHAR(100) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_logistics_dispatch_id ON dispatch_logistics(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_logistics_vehicle_number ON dispatch_logistics(vehicle_number);

CREATE TABLE IF NOT EXISTS dispatch_logistics_allocations (
    id SERIAL PRIMARY KEY,
    logistics_id INTEGER REFERENCES dispatch_logistics(id) ON DELETE CASCADE,
    dispatch_item_id INTEGER REFERENCES dispatch_items(id) ON DELETE CASCADE,
    quantity_allocated DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatch_logistics_allocations_logistics_id ON dispatch_logistics_allocations(logistics_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_logistics_allocations_dispatch_item_id ON dispatch_logistics_allocations(dispatch_item_id);
