WITH pending_orders AS (
    SELECT DISTINCT oi.product_id
    FROM orders_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'Pendente'
),

entregue_orders AS (
    SELECT DISTINCT oi.product_id
    FROM orders_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'Entregue'
),

latest_delivery_dates AS (
    SELECT oi.product_id, MAX(o.delivery_date) AS max_delivery_date
    FROM orders_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'Entregue'
    GROUP BY oi.product_id
),

necessary_products_to_buy AS (
    SELECT DISTINCT p.id
    FROM products p
    LEFT JOIN pending_orders po ON p.id = po.product_id
    LEFT JOIN entregue_orders eo ON p.id = eo.product_id
    LEFT JOIN latest_delivery_dates ldd ON p.id = ldd.product_id
    WHERE 
        -- Exclude products with pending orders
        po.product_id IS NULL
        
        -- Include products where current stock is less than min_stock 
        -- and max delivery date is less than max last update stock date.
        -- Also, include cases where the product was never delivered.
        AND (p.current_stock_in_units < p.min_stock) 
        AND (ldd.product_id IS NULL OR ldd.max_delivery_date < (SELECT MAX(last_update_stock) FROM products))

        -- Only include active products
        AND p.status = 'Ativo'
),

latest_order_and_price AS (
    SELECT 
        must_buy.id AS prod_id,
        p.description AS prod_desc,
        sp.supplier_id AS supplier_id,
        s.description AS supp_desc,
        FIRST_VALUE(o.order_date) OVER (PARTITION BY must_buy.id, sp.supplier_id ORDER BY o.order_date DESC) AS order_date,
        FIRST_VALUE(oi.unit_price) OVER (PARTITION BY must_buy.id, sp.supplier_id ORDER BY o.order_date DESC) AS unit_price,
        sp.current_price,
        ROW_NUMBER() OVER (PARTITION BY must_buy.id ORDER BY sp.current_price ASC) AS rn
    FROM necessary_products_to_buy must_buy
    LEFT JOIN orders_items oi 
        ON must_buy.id = oi.product_id
    LEFT JOIN orders o 
        ON oi.order_id = o.id
    INNER JOIN suppliers_products sp 
        ON sp.product_id = must_buy.id
    INNER JOIN suppliers s
        ON s.id = sp.supplier_id 
    INNER JOIN products p 
        ON p.id = must_buy.id
    WHERE sp.status = 'Ativo'
)

SELECT 
    prod_id,
    prod_desc,
    supplier_id,
    supp_desc,
    order_date,
    unit_price,
    current_price
FROM latest_order_and_price
WHERE rn = 1;