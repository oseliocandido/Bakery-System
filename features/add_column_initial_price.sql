BEGIN TRANSACTION;

CREATE TABLE suppliers_products_new (
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


INSERT INTO suppliers_products_new (id, supplier_id, product_id, initial_price, status, current_price)
SELECT id, supplier_id, product_id, initial_price, status, COALESCE(current_price, 0)
FROM suppliers_products;

DROP TABLE suppliers_products;

ALTER TABLE suppliers_products_new RENAME TO suppliers_products;

COMMIT;
