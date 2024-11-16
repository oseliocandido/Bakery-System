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
