import sqlite3
from models.balance import Balance
from utils.logs import log_function_calls
from utils.logger import logger


class CaixaController:
    def __init__(self, db_path):
        self.db_path = db_path


    @log_function_calls
    def create_closing_balance(self, id, date, period, card_value, pix_value, money_value, observation):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("INSERT INTO balance (user_id, date, period, card_value, pix_value, money_value, observation) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                        (id, date, period, card_value, pix_value, money_value, observation))
            return True
        except sqlite3.IntegrityError as e:
            logger.error(f"Save Balance Twice or More - Date {date} -> {str(e)}")
            return e
        except sqlite3.Error as e:
            logger.error(f"Save Balance - Date {date} -> {str(e)}")
            return e
  

    @log_function_calls
    def update_closing_balance(self, date, period, card_value, pix_value, money_value, observation):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                            UPDATE balance 
                            SET card_value = ?, pix_value = ?, money_value = ?, observation = ? 
                            WHERE date = ? and period = ? """, 
                            (card_value, pix_value, money_value, observation, date, period))
            return True 
        except sqlite3.Error as e:
            logger.error(f"Update Balance - Date {date} -> {str(e)}")
            return None
    

    def get_closing_values(self, date, period):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT card_value, pix_value, money_value, observation FROM balance WHERE date = ? AND period = ?", (date, period))
                row = cursor.fetchone()
                cursor.close()
            return Balance(None, date, row[0], row[1], row[2], row[3])  if not row is None else None
        except sqlite3.Error as e:
            logger.error(f"Get Balance of Date {date} -> {str(e)}")
            return None
     

    @log_function_calls
    def get_reporting_balance(self, date):
        balances = []
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""SELECT 	
                                    date,
                                    card_value,
                                    money_value,
                                    pix_value,
                                    (card_value + pix_value + money_value) as total,
                                    SUM(money_value) OVER (ORDER BY DATE ASC) as 'AccDinheiro'
                                FROM balance b
                                WHERE date >= ?
                                ORDER BY date DESC""", (date,))
                rows = cursor.fetchall()
            for row in rows:
                balance = dict(zip([column[0] for column in cursor.description], row))
                balances.append(balance)
            cursor.close()
            return balances
        except sqlite3.Error as e:
            logger.error(f"Get Reporting Balance - Selected Date {date} -> {str(e)}")
            return None
        