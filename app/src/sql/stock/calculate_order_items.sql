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
	    (po.product_id IS NULL) -- Exclude products with pending orders
	    
	    --  MAX(last_update_stock) works no problem because its same value for all products. In frontend, it has to update everything at once
	    -- Include if current stock is less than min_stock and max delivery date is less than max last update stock date.
		-- Include cases where the product was neever delivery too
	    AND (p.current_stock_in_units < p.min_stock) 
	    AND (ldd.product_id IS NULL OR ldd.max_delivery_date < (SELECT MAX(last_update_stock) FROM products))

	    -- Only Active Products
	    AND p.status = 'Ativo'
),
--Rank the order_items only from neecssary products aacordingly, ranking by lastest order and least price for each combination of product-supplier
latest_ordered_prices  AS (
    SELECT 
    	oi.product_id,
    	o.supplier_id,
        o.order_date,
        oi.unit_price,
        ROW_NUMBER() OVER(PARTITION BY oi.product_id, o.supplier_id ORDER BY o.order_date DESC, oi.unit_price ASC) AS supplier_price_rank
    FROM 
        orders_items oi
    JOIN 
        orders o ON oi.order_id = o.id
    JOIN necessary_products_to_buy ON necessary_products_to_buy.id = oi.product_id
),
--From lastest order with lowest price for each supplier of each product, it will create rank to be filtered to get cheapest supplier of each product
--but only to current active associated product-supplier
cheapest_supplier_per_product AS (
    SELECT 
        latest.product_id,
        latest.supplier_id,
        latest.order_date,
        latest.unit_price,
        ROW_NUMBER() OVER(PARTITION BY latest.product_id ORDER BY latest.unit_price ASC) AS cheapest_supplier_rank
    FROM latest_ordered_prices latest
    INNER JOIN suppliers_products sp ON 
    sp.supplier_id = latest.supplier_id 
     AND sp.product_id = latest.product_id
    WHERE latest.supplier_price_rank = 1
    AND sp.status = 'Ativo'
),
calculated_cheapest_prod_suppliers AS (
select 
ch.product_id,
p.description as prod_description,
ch.supplier_id,
s.description AS supplier_description,
ch.order_date,
p.package_type,
ch.unit_price
from cheapest_supplier_per_product ch
INNER JOIN products p  ON p.id  = ch.product_id
INNER JOIN suppliers s ON s.id = ch.supplier_id
where cheapest_supplier_rank = 1
),
products_never_ordered AS (
	SELECT
		p.id as product_id ,
		p.description AS prod_description,
		s.id as supplier_id,
		s.description AS supplier_description,
		NULL AS order_date,
		p.package_type,
		sp.initial_price AS unit_price,
		ROW_NUMBER () OVER(PARTITION BY p.id ORDER BY sp.initial_price ASC) AS rnk
		FROM products p 
		LEFT JOIN orders_items oi ON oi.product_id  = p.id 
		INNER JOIN suppliers_products sp  ON sp.product_id  = p.id 
		INNER JOIN suppliers s ON s.id = sp.supplier_id 
		WHERE oi.order_item_id IS NULL AND sp.status = 'Ativo'
		and sp.initial_price IS NOT NULL
		and p.status = 'Ativo'
		and p.current_stock_in_units < p.min_stock 
)

SELECT 
	product_id,
	prod_description,
	supplier_id,
	supplier_description,
	order_date,
	package_type,
	unit_price
	FROM calculated_cheapest_prod_suppliers
UNION ALL 
SELECT 
	product_id,
	prod_description,
	supplier_id,
	supplier_description,
	order_date,
	package_type,
	unit_price
FROM products_never_ordered
WHERE rnk  = 1