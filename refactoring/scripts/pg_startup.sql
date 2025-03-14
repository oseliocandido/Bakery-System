-----------------BUSINESS TABLES----------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    numero_identificacao INTEGER,  -- Changed INTEGER to SERIAL
    complete_name TEXT,
    date_nascimento DATE,
    date_admissao DATE,
    role TEXT,
    telephone_number TEXT,
    observation TEXT,
    status TEXT DEFAULT 'Ativo',
    UNIQUE (numero_identificacao)
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    user_id INTEGER,
    date DATE,  -- Changed TEXT to DATE for proper date handling
    type TEXT,
    time TIME,  -- Changed TEXT to TIME for time handling
    FOREIGN KEY (user_id) REFERENCES users (numero_identificacao),
    UNIQUE (user_id, type, date)
);

CREATE TABLE IF NOT EXISTS balance (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    user_id INTEGER,
    date DATE,  -- Changed TEXT to DATE
    period INTEGER,
    card_value NUMERIC,  -- Changed REAL to NUMERIC
    pix_value NUMERIC,  -- Changed REAL to NUMERIC
    money_value NUMERIC,  -- Changed REAL to NUMERIC
    observation TEXT,
    UNIQUE (date, period)
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    description TEXT NOT NULL,
    date_registration TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- Changed DATE to TIMESTAMP
    current_stock_in_units NUMERIC NOT NULL,  -- Changed REAL to NUMERIC for precision
    min_stock INTEGER NOT NULL,
    status TEXT DEFAULT 'Ativo',
    package_type TEXT CHECK (package_type IN ('Fardo','Unidade')),
    last_update_stock TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- Changed SQLite-specific DATETIME function
    CONSTRAINT status_check CHECK (status IN ('Ativo','Inativo'))
);


CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    description TEXT,
    date_registration TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- Changed DATE to TIMESTAMP
    last_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Changed DATE to TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers_products (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    initial_price NUMERIC,  -- Changed NULL to allow default NULL behavior
    status TEXT DEFAULT 'Ativo',
    current_price NUMERIC DEFAULT 0,  -- Changed NUMERIC DEFAULT 0 (kept behavior)
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),  -- Fixed supplier_id reference
    FOREIGN KEY (product_id) REFERENCES products(id),  -- Fixed product_id reference
    UNIQUE (supplier_id, product_id),
    CONSTRAINT status_check_sp CHECK (status IN ('Ativo', 'Inativo'))
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    order_date DATE NOT NULL,
    supplier_id INTEGER NOT NULL,
    delivery_date DATE,  -- Removed NULL since DATE allows NULL by default
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente','Entregue','Cancelado')),
    last_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- Changed DATE to TIMESTAMP
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);


CREATE TABLE IF NOT EXISTS orders_items (
    order_item_id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity NUMERIC NOT NULL,  -- Changed REAL to NUMERIC for precision
    unit_price NUMERIC NOT NULL,  -- Changed REAL to NUMERIC for precision
    total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,  -- Kept as is
    FOREIGN KEY (order_id) REFERENCES orders (id),    
    FOREIGN KEY (product_id) REFERENCES products (id)
);


----------- Analytics (SCD type II)----------- 
CREATE TABLE IF NOT EXISTS products_history (
    id INTEGER,
    description TEXT,
    stock_in_units INTEGER,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- Changed DATETIME to TIMESTAMP
    valid_to TIMESTAMPTZ  -- Changed DATETIME to TIMESTAMP
);

----------- Analytics (SCD type II)----------- 
CREATE OR REPLACE FUNCTION update_products_history()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products_history
    SET valid_to = CURRENT_TIMESTAMP
    WHERE id = OLD.id AND valid_to IS NULL;

    INSERT INTO products_history (id, description, stock_in_units, valid_from, valid_to)
    VALUES (NEW.id, NEW.description, NEW.current_stock_in_units, CURRENT_TIMESTAMP, NULL);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----------- Analytics (SCD type II)----------- 
CREATE TRIGGER trg_products_history_update
AFTER UPDATE OF current_stock_in_units ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_history();

----------- IT WILL BE REMOVED SOON----------- 
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,  -- Changed INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL
    function_type TEXT,
    action TEXT,
    log_date DATE,  -- Changed TEXT to DATE
    log_time TIME  -- Changed TEXT to TIME
);
