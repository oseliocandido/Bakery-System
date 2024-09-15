import sqlite3
from datetime import datetime
from sql.sql_reader import read_sql_query
from utils.logs import log_function_calls
from utils.logger import logger


class StockController:
    def __init__(self, db_path):
        self.db_path = db_path


    def create_product(self, description, current_stock, min_stock, pack_type, suppliers):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO products (description, current_stock_in_units, min_stock, package_type) VALUES (?, ?, ?, ?)",
                               (description, current_stock, min_stock, pack_type))
                lastrowid = cursor.lastrowid

                for supplier_id in suppliers:
                    cursor.execute("INSERT INTO suppliers_products (supplier_id, product_id) VALUES (?, ?)",
                               (supplier_id, lastrowid))
                cursor.close()
                return True
        except sqlite3.Error as e:
            logger.error(f"Create New Product - {description} -> {str(e)}")
            return None
    

    @log_function_calls
    def create_order(self, order_items: list) -> bool:
        now = datetime.now()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO orders (order_date, supplier_id) VALUES (?, ?)",
                                (now, order_items[0][0]))
                lastrowid = cursor.lastrowid

                for item in order_items:
                    product_id, quantity, price = item[1], item[2], item[3]
                    cursor.execute("INSERT INTO orders_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                                (lastrowid, product_id, quantity, price))
                cursor.close()
                return True
        except sqlite3.Error as e:
            logger.error(f"Create New Order - Order Id {lastrowid} -> {str(e)}")
            return None


    def get_stock_product_association(self, selected_product_id):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                                SELECT 
                                    s.id AS supplier_id,
                                    s.description,
                                    sp.current_price,
                                    CASE WHEN sp.status = 'Ativo' THEN 1 ELSE 0 END AS Status
                                FROM 
                                    suppliers s 
                                CROSS JOIN 
                                    products p 
                                LEFT JOIN 
                                    suppliers_products sp  
                                ON  sp.supplier_id = s.id AND sp.product_id = p.id 
                                WHERE p.id = ?""",
                                (selected_product_id,))
                prod_supp_associ = cursor.fetchall()
                cursor.close()  
                return prod_supp_associ
        except sqlite3.Error as e:
            logger.error(f"Get Product-Supp Association -> Product Id {selected_product_id} -> {str(e)}")
            return None


    @log_function_calls
    def update_stock_product_association(self, update_dataframe, selected_product_id):
        supplier_ids = update_dataframe["ID"].values.tolist()
        current_price = update_dataframe["Preco Atual"].values.tolist()
        new_status = update_dataframe["Status"].values.tolist()

        rows_to_update = [(current_price, supplier_id, selected_product_id) 
                           for current_price, supplier_id, status 
                           in zip(current_price, supplier_ids, new_status) if not status]
        rows_to_insert_replace = [(current_price, supplier_id, selected_product_id) 
                           for current_price, supplier_id, status 
                           in zip(current_price, supplier_ids, new_status) if status]
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.executemany("UPDATE suppliers_products SET status = 'Inativo', current_price = ? WHERE supplier_id = ? AND product_id = ?", 
                                    rows_to_update)
                cursor.executemany("INSERT OR REPLACE INTO suppliers_products (current_price, supplier_id, product_id, status) VALUES (?, ?, ?, 'Ativo')", 
                                    rows_to_insert_replace)
                cursor.close()  
                return True
        except sqlite3.Error as e:
            logger.error(f"Update Product-Supp Association -> Product Id {selected_product_id} -> {str(e)}")
            return None
    

    @log_function_calls
    def update_stock_qt(self, update_dataframe):
        product_current_stock = update_dataframe["Estoque Atual"].values.tolist()
        product_ids = update_dataframe["ID"].values.tolist()
        now = datetime.now()
        data = [(updated_stock, now, id) for updated_stock, id in zip(product_current_stock, product_ids)]
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.executemany("UPDATE products SET current_stock_in_units = ?, last_update_stock = ?  WHERE id = ?", 
                        (data))
                cursor.close()
                return True
        except sqlite3.IntegrityError as e:
            logger.error(f"Update Stock Qt Null. -> {str(e)}")
            return e
        except sqlite3.Error as e:
            logger.error(f"Update Stock Qt. -> {str(e)}")
            return e
             

    def get_product_info(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, description, current_stock_in_units, package_type, last_update_stock FROM products")
                product_info = cursor.fetchall()
                cursor.close()  
            return product_info
        except sqlite3.Error as e:
            logger.error(f"Get Product Info -> {str(e)}")
            return None


    @log_function_calls
    def update_product_info(self, update_dataframe):
        products_description = update_dataframe["Descrição"].values.tolist()
        products_min_stock = update_dataframe["Estoque Minimo"].values.tolist()
        products_status= update_dataframe["Status"].values.tolist()
        products_ids = update_dataframe["Id"].values.tolist()
        data = [(desc, min_stock, status, id) for desc, min_stock, status, id in zip(
                                                                                        products_description, 
                                                                                        products_min_stock,
                                                                                        products_status,
                                                                                        products_ids)]
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.executemany("UPDATE products SET description = ?, min_stock = ?, status = ? WHERE id = ?", 
                        (data))
                cursor.close()
                return True
        except sqlite3.Error as e:
            logger.error(f"Update Product Info. -> {str(e)}")
            return None


    def get_product_update_info(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""SELECT 
                                        id,
                                        description,
                                        min_stock, 
                                        status
                                  FROM products""")
                product_info = cursor.fetchall()
                cursor.close()  
                return product_info
        except sqlite3.Error as e:
            logger.error(f"Get All Product Info -> {str(e)}")
            return None


    def get_suppliers_info(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, description FROM suppliers")
                suppplier_info = cursor.fetchall()
                cursor.close()  
                return suppplier_info
        except sqlite3.Error as e:
            logger.error(f"Get Suppliers Info -> {str(e)}")
            return None
    

    def get_suppliers_products_info(self, product_id):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""SELECT
                                        s.id,
                                        s.description
                                        FROM suppliers_products sp
                                        INNER JOIN suppliers s ON s.id  = sp.supplier_id 
                                        WHERE sp.product_id = ?""", (product_id,))
                result = cursor.fetchall()
                cursor.close()  
                return result
        except sqlite3.Error as e:
            logger.error(f"Get Suppliers-Product Info -> {str(e)}")
            return None
    

    @log_function_calls
    def update_order_status(self, order_id):
        try:
            with sqlite3.connect(self.db_path) as conn:
                now = datetime.now()
                cursor = conn.cursor()
                cursor.execute("UPDATE orders SET status = 'Entregue', delivery_date = ?, last_update = ?  WHERE id = ? ", 
                        (now, now, order_id))
                cursor.close()
                return True
        except sqlite3.Error as e:
            logger.error(f"Update Order Status - Order ID {order_id} -> {str(e)}")
            return None
        

    @log_function_calls
    def cancel_order(self, order_id):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE orders SET status = 'Cancelado' WHERE id = ? ", 
                        (order_id,))
                cursor.close()
                return True
        except sqlite3.Error as e:
            logger.error(f"Cancel Order {order_id} -> {str(e)}")
            return None
        

    def get_pending_orders_items(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""SELECT DISTINCT 
                                        oi.order_id,
                                        o.order_date,
                                        s.description supp_desc,
                                        p.description prod_desc
                                        FROM orders o
                                        INNER JOIN orders_items oi ON o.id  = oi.order_id 
                                        INNER JOIN suppliers s ON o.supplier_id = s.id  
                                        INNER JOIN products p  ON oi.product_id  = p.id 
                                        where o.status  = "Pendente"
                               """)
                result = cursor.fetchall()
                cursor.close()  
                return result
        except sqlite3.Error as e:
            logger.error(f"Get Orders Items-> {str(e)}")
            return None


    @log_function_calls
    def calculate_recommended_orders_items(self):
        raw_sql = read_sql_query("sql/stock/get_lowest_current_price.sql")
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(raw_sql)
                data = cursor.fetchall()
                cursor.close()  
                return data
        except sqlite3.Error as e:
            logger.error(f"Calculate Recommended Orders -> {str(e)}")
            return None
