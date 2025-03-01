CREATE TABLE users
                (numero_identificacao INTEGER PRIMARY KEY,
                complete_name TEXT,
                date_nascimento DATE,
                date_admissao DATE,
                role TEXT,
                telephone_number TEXT,
                observation TEXT,
                status TEXT DEFAULT 'Ativo');
CREATE TABLE attendance
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                type TEXT,
                time TEXT,
                FOREIGN KEY (user_id) REFERENCES users (numero_identificacao),
                UNIQUE (user_id, type, date));
CREATE TABLE logs
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                    function_type TEXT,
                    action TEXT,
                    log_date TEXT, 
                    log_time TEXT);
CREATE TABLE suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        date_registration DATE DEFAULT CURRENT_TIMESTAMP,
        last_update DATE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_date DATE NOT NULL,
        supplier_id INTEGER NOT NULL,
        delivery_date DATE NULL,
        status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente','Entregue','Cancelado')),
        last_update DATE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
             );
CREATE TABLE orders_items (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL GENERATED ALWAYS AS (quantity * unit_price) STORED,
        FOREIGN KEY (order_id) REFERENCES orders (id),	
        FOREIGN KEY (product_id) REFERENCES products (id)
            );
CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        date_registration DATE DEFAULT CURRENT_TIMESTAMP,
        current_stock_in_units REAL NOT NULL,
        min_stock INTEGER NOT NULL,
        status TEXT DEFAULT 'Ativo',
        package_type TEXT CHECK (package_type IN ('Fardo','Unidade')),
        --last_update_stock DATE DEFAULT CURRENT_TIMESTAMP,
        last_update_stock DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
        CONSTRAINT status_check CHECK (status in ('Ativo','Inativo'))
    );
CREATE TABLE IF NOT EXISTS "balance" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    period INTEGER,
    card_value REAL,
    pix_value REAL,
    money_value REAL,
    observation TEXT,
    UNIQUE (date, period)
);
CREATE TABLE IF NOT EXISTS "suppliers_products" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    initial_price NUMERIC NULL,   
    status TEXT DEFAULT 'Ativo',
    current_price NUMERIC DEFAULT 0,  -- Default value of 0 for current_price
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    UNIQUE(supplier_id, product_id),
    CONSTRAINT status_check_sp CHECK (status in ('Ativo', 'Inativo'))
);
CREATE TABLE products_history (
    id INTEGER,
    description TEXT,
    stock_in_units INTEGER,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_to DATETIME
);
CREATE TRIGGER trg_products_history_update
AFTER UPDATE OF current_stock_in_units ON products
FOR EACH ROW
BEGIN
    -- Mark the previous record in products_history as no longer valid
    UPDATE products_history
    SET valid_to = CURRENT_TIMESTAMP
    WHERE id = OLD.id AND valid_to IS NULL;

    -- Insert the new historical record
    INSERT INTO products_history (id, description, stock_in_units, valid_from, valid_to)
    VALUES (NEW.id, NEW.description, NEW.current_stock_in_units, CURRENT_TIMESTAMP, NULL);
END;
/* No STAT tables available */
