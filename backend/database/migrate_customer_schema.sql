-- Migration script to update customer schema to support multiple contacts/emails/phones/addresses

-- Step 1: Drop old NOT NULL constraints and columns from customers table
ALTER TABLE customers DROP COLUMN IF EXISTS contact_person CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS email CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS phone CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS address CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS city CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS state CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS pincode CASCADE;

-- Step 2: Ensure customer_contacts table exists
CREATE TABLE IF NOT EXISTS customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    contact_person TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);

-- Step 3: Ensure customer_emails table exists
CREATE TABLE IF NOT EXISTS customer_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_emails_customer_id ON customer_emails(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_emails_email ON customer_emails(email);

-- Step 4: Ensure customer_phones table exists
CREATE TABLE IF NOT EXISTS customer_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_phones_customer_id ON customer_phones(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_phones_phone ON customer_phones(phone);

-- Step 5: Ensure customer_addresses table exists
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_city ON customer_addresses(city);