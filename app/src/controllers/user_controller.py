import sqlite3
import datetime
from models.user import UserDTO
from utils.logs import log_function_calls
from utils.logger import logger


class UserController:
    def __init__(self, db_path):
        self.db_path = db_path


    @log_function_calls
    def insert_employee(self, inputs):
        insert_query = """INSERT INTO users (numero_identificacao, complete_name, 
                            date_nascimento, date_admissao, role, telephone_number, observation) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(insert_query, tuple(inputs[key] for key in inputs.keys()))
                return True
        except sqlite3.Error as e:
            logger.error(f"Insert Employee - {inputs['complete_name']} -> {str(e)}")
            return None
   

    def select_info_employees(self, selected_columns):
        columns_str = ", ".join(selected_columns)
        query = f"SELECT {columns_str} FROM users"
        users = []
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(query)
                rows = cursor.fetchall()
                cursor.close()
            for row in rows:
                user_data = dict(zip(selected_columns, row))
                user = UserDTO(**user_data)
                users.append(user)
            return users
        except sqlite3.Error as e:
            logger.error(f"Get Employee Info -> {str(e)}")
            return None
        

    @log_function_calls
    def update_employees_status(self, id, status):
        status_str = "Ativo" if status else "Inativo"
        update_query = "UPDATE users SET status=? WHERE numero_identificacao=?"
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(update_query, (status_str, id))
                return True
        except sqlite3.Error as e:
            logger.error(f"Update Employee Status - Employee Id {id} -> {str(e)}")
            return None


    @log_function_calls
    def update_employee(self, selected_columns, user_id):
         # Prepare the other columns and values for the update query
        columns_values_for_update = [(column, value) for column, value in selected_columns if column != 'numero_identificacao']
        set_clause = ", ".join(f"{column} = ?" for column, _ in columns_values_for_update)
        update_query = f"UPDATE users SET {set_clause} WHERE numero_identificacao = ?"
        get_name_query = "SELECT complete_name FROM users WHERE numero_identificacao = ?"

        values = [new_value.isoformat() if isinstance(new_value, datetime.date) else new_value for _, new_value in columns_values_for_update]
        values.append(user_id)

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(update_query, values)
                cursor.execute(get_name_query, (user_id,))
                row = cursor.fetchone()
                cursor.close()
            user_data = dict(zip([column[0] for column in cursor.description], row))
            user = UserDTO(**user_data)
            return user
        except sqlite3.Error as e:
            logger.error(f"Update Employee Info - Employee Id {user_id} -> {str(e)}")
            return None           
