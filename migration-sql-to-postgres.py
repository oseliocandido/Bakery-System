import sqlite3
import psycopg
import logging
from psycopg.rows import dict_row
from datetime import datetime

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Manages database connections."""
    def __init__(self, sqlite_db_path, postgres_dsn):
        self.sqlite_db_path = sqlite_db_path
        self.postgres_dsn = postgres_dsn
        self.sqlite_conn = None
        self.pg_conn = None

    def connect(self):
        """Establish connections to SQLite and PostgreSQL."""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_db_path)
            self.pg_conn = psycopg.connect(self.postgres_dsn, row_factory=dict_row)
            logger.info("Database connections established.")
        except Exception as e:
            logger.error(f"Error connecting to databases: {e}")
            raise

    def close(self):
        """Closes database connections."""
        if self.sqlite_conn:
            self.sqlite_conn.close()
            logger.info("SQLite connection closed.")
        if self.pg_conn:
            self.pg_conn.close()
            logger.info("PostgreSQL connection closed.")

class ETLProcess:
    """Handles the ETL process for database migration."""
    
    def __init__(self, db_connector, batch_size=100):
        self.db = db_connector
        self.batch_size = batch_size  # Batch size for inserts
        self.transform_funcs = {
            "date": self.convert_date,
            "datetime": self.convert_datetime,
            "numeric": self.convert_numeric,
            "boolean": self.convert_boolean
        }
        
        self.tables = {
            "users": {
                "query": "SELECT numero_identificacao, complete_name, date_nascimento, date_admissao, role, telephone_number, observation, status FROM users",
                "columns": [
                    {"name": "numero_identificacao", "type": "int"},
                    {"name": "complete_name", "type": "text"},
                    {"name": "date_nascimento", "type": "date"},
                    {"name": "date_admissao", "type": "date"},
                    {"name": "role", "type": "text"},
                    {"name": "telephone_number", "type": "text"},
                    {"name": "observation", "type": "text"},
                    {"name": "status", "type": "text"}
                ]
            },
            "attendance": {
                "query": "SELECT user_id, date, type, time FROM attendance",
                "columns": [
                    {"name": "user_id", "type": "int"},
                    {"name": "date", "type": "date"},
                    {"name": "type", "type": "text"},
                    {"name": "time", "type": "time"}
                ]
            },
            "balance": {
                "query": "SELECT id, user_id, date, period, card_value, pix_value, money_value, observation FROM balance",
                "columns": [
                    {"name": "id", "type": "int"},
                    {"name": "user_id", "type": "int"},
                    {"name": "date", "type": "date"},
                    {"name": "period", "type": "int"},
                    {"name": "card_value", "type": "numeric"},
                    {"name": "pix_value", "type": "numeric"},
                    {"name": "money_value", "type": "numeric"},
                    {"name": "observation", "type": "text"}
                ]
            },
            "products": {
                "query": "SELECT id, description, date_registration, current_stock_in_units, min_stock, status, package_type, last_update_stock FROM products",
                "columns": [
                    {"name": "id", "type": "int"},
                    {"name": "description", "type": "text"},
                    {"name": "date_registration", "type": "datetime"},
                    {"name": "current_stock_in_units", "type": "numeric"},
                    {"name": "min_stock", "type": "int"},
                    {"name": "status", "type": "text"},
                    {"name": "package_type", "type": "text"},
                    {"name": "last_update_stock", "type": "datetime"}
                ]
            },
            "suppliers": {
                "query": "SELECT id, description, date_registration, last_update FROM suppliers",
                "columns": [
                    {"name": "id", "type": "int"},
                    {"name": "description", "type": "text"},
                    {"name": "date_registration", "type": "datetime"},
                    {"name": "last_update", "type": "datetime"}
                ]
            },
            "orders": {
                "query": "SELECT id, order_date, supplier_id, delivery_date, status, last_update FROM orders",
                "columns": [
                    {"name": "id", "type": "int"},
                    {"name": "order_date", "type": "date"},
                    {"name": "supplier_id", "type": "int"},
                    {"name": "delivery_date", "type": "date"},
                    {"name": "status", "type": "text"},
                    {"name": "last_update", "type": "datetime"}
                ]
            },
            "suppliers_products": {
                "query": "SELECT id, supplier_id, product_id, initial_price, status, current_price FROM suppliers_products",
                "columns": [
                    {"name": "id", "type": "int"},
                    {"name": "supplier_id", "type": "int"},
                    {"name": "product_id", "type": "int"},
                    {"name": "initial_price", "type": "numeric"},
                    {"name": "status", "type": "text"},
                    {"name": "current_price", "type": "numeric"}
                ]
            },
            "orders_items": {
                "query": "SELECT order_item_id, order_id, product_id, quantity, unit_price FROM orders_items",
                "columns": [
                    {"name": "order_item_id", "type": "int"},
                    {"name": "order_id", "type": "int"},
                    {"name": "product_id", "type": "int"},
                    {"name": "quantity", "type": "numeric"},
                    {"name": "unit_price", "type": "numeric"}
                ]
            }
        }
    
    def convert_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else None

    def convert_datetime(self, datetime_str):
        return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S") if datetime_str else None

    def convert_numeric(self, value):
        return float(value) if value is not None else None

    def convert_boolean(self, value):
        return True if value in (1, "1", "true", "True") else False

    def migrate_table(self, table_name, table_info):
 
        try:
            sqlite_cursor = self.db.sqlite_conn.cursor()
            pg_cursor = self.db.pg_conn.cursor()

            sqlite_cursor.execute(f'{table_info["query"]};')
            records = sqlite_cursor.fetchall()
            
            logger.info(f"Starting migration for {table_name}. Total records to process: {len(records)}.")
            
            transformed_data = []
            for idx, row in enumerate(records):
                transformed_row = []
                for i, column_info in enumerate(table_info["columns"]):
                    column_name = column_info["name"]
                    column_type = column_info["type"]
                    value = row[i]
                    transformed_value = self.transform_funcs.get(column_type, lambda x: x)(value)
                    transformed_row.append(transformed_value)
                
                transformed_data.append(transformed_row)
                
                # Insert the batch when the batch size is reached or at the last record
                if len(transformed_data) >= self.batch_size or idx == len(records) - 1:
                    columns = ', '.join([column["name"] for column in table_info["columns"]])
                    placeholders = ', '.join(['%s'] * len(table_info["columns"]))
                    insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
                    
                    # Attempt to insert the transformed data into PostgreSQL
                    for record in transformed_data:
                        try:
                            pg_cursor.execute(insert_query, record)
                        except Exception as e:
                            # Log which record is causing the error
                            logger.error(f"Error inserting record {record} into {table_name}: {e}")
                            continue  # Skip this record and continue processing others
                    
                    try:
                        self.db.pg_conn.commit()  # Commit the batch to PostgreSQL
                    except Exception as e:
                        logger.error(f"Error committing batch for {table_name}: {e}")
                    else:
                        logger.info(f"Inserted batch of {len(transformed_data)} records into {table_name}.")
                    transformed_data = []  # Reset the batch list for the next batch

            logger.info(f"Migration for {table_name} completed successfully.\n\n")
        except Exception as e:
            logger.error(f"Error migrating {table_name}: {e}")
            raise


    def run_migrations(self):
        self.db.connect()
        for table_name, table_info in self.tables.items():
            try:
                # Special handling for attendance to create attendance_test entries
                if table_name == 'users':
                    continue
                if table_name == "attendance":
                    self.migrate_attendance_to_test()
                    break
                if table_name not in ('users','attendance'):
                    break
    
                self.migrate_table(table_name, table_info)
            except Exception as e:
                logger.error(f"ETL process failed for {table_name}: {e}")  # Log the error for better debugging
                continue
                
        logger.info("ETL process completed successfully for all tables.")
        self.db.close()
        
    def migrate_attendance_to_test(self):
        """Migrates attendance data from SQLite to PostgreSQL attendance_test table, combining date and time."""
        try:
            sqlite_cursor = self.db.sqlite_conn.cursor()
            pg_cursor = self.db.pg_conn.cursor()
            
            # Query for all attendance records
            sqlite_cursor.execute("SELECT user_id, date, type, time FROM attendance;")
            records = sqlite_cursor.fetchall()
            
            logger.info(f"Starting migration for attendance_test. Total records to process: {len(records)}.")
            
            transformed_data = []
            for idx, row in enumerate(records):
                user_id, date_str, attendance_type, time_str = row
                
                # Combine date and time into a single datetime object
                if date_str and time_str:
                    try:
                        # Create a datetime string in the format "YYYY-MM-DD HH:MM:SS"
                        datetime_str = f"{date_str} {time_str}"
                        datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
                    except Exception as e:
                        logger.error(f"Error parsing datetime {date_str} {time_str}: {e}")
                        continue  # Skip this record
                else:
                    logger.warning(f"Skipping record with missing date or time: {row}")
                    continue
                
                transformed_row = (user_id, datetime_obj, attendance_type)
                transformed_data.append(transformed_row)
                
                # Insert the batch when the batch size is reached or at the last record
                if len(transformed_data) >= self.batch_size or idx == len(records) - 1:
                    insert_query = "INSERT INTO attendance_test (user_id, datetime, type) VALUES (%s, %s, %s)"
                    
                    # Attempt to insert the transformed data into PostgreSQL
                    for record in transformed_data:
                        try:
                            pg_cursor.execute(insert_query, record)
                        except Exception as e:
                            logger.error(f"Error inserting record {record} into attendance_test: {e}")
                            continue  # Skip this record and continue processing others
                    
                    try:
                        self.db.pg_conn.commit()  # Commit the batch to PostgreSQL
                    except Exception as e:
                        logger.error(f"Error committing batch for attendance_test: {e}")
                    else:
                        logger.info(f"Inserted batch of {len(transformed_data)} records into attendance_test.")
                    
                    transformed_data = []  # Reset the batch list for the next batch
            
            logger.info("Migration for attendance_test completed successfully.\n\n")
        except Exception as e:
            logger.error(f"Error migrating attendance to attendance_test: {e}")
            raise

if __name__ == "__main__":
    db_connector = DatabaseConnector("./letscheck.db", "postgresql://postgres:my_super_secret_password@localhost/postgres")
    etl = ETLProcess(db_connector, batch_size=100)  # Batch size of 100 records per insert
    etl.run_migrations()
