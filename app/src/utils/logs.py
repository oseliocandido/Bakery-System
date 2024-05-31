import sqlite3
from datetime import datetime
from database.path import db_path
from pytz import timezone
from utils.logger import logger


mapping_controller_functions = {
    'insert_employee': ('Cadastro', 'Inserir Funcionário'),
    'update_employee': ('Cadastro', 'Atualizar Informacoes'),
    'update_employees_status': ('Cadastro', 'Atualizar Status'),

    'create_attendance': ('Frequência', 'Registrar Frequência'),
    'modify_attendance': ('Frequência', 'Alterar Frequência'),
    'delete_attendance': ('Frequência', 'Deletar Frequência'),

    'create_closing_balance':('Caixa', 'Fechamento Caixa'),
    'update_closing_balance':('Caixa', 'Atualizar Fechamento'),
    'get_reporting_balance':('Caixa', 'Puxar Relatório'),

    'create_order':('Estoque', 'Solicitar Pedido'),
    'update_stock_product_association':('Estoque', 'Atualizar Assoc. Prod-For'),
    'update_stock_qt':('Estoque', 'Atualizar Qt. Estoque'),
    'update_product_info':('Estoque', 'Atualizar Prod. Info'),
    'update_order_status':('Estoque', 'Atualizar Status do Pedido'),
    'cancel_order':('Estoque', 'Cancelar Pedido'),
    'calculate_recommended_orders_items':('Estoque', 'Mostrar Produtos Recomendados')
     }


def log_function_calls(func):
    def wrapper(*args,**kwargs):    
        log_call = kwargs.pop('log_call', False)
        if log_call:
            function_type = mapping_controller_functions.get(str(func.__name__))[0]
            action = mapping_controller_functions.get(str(func.__name__))[1]

            log_date = datetime.now().strftime('%Y-%m-%d')
            log_time = datetime.now(timezone('America/Sao_Paulo')).strftime("%H:%M")
            try:
                with sqlite3.connect(db_path) as conn:
                    conn.execute("""INSERT INTO logs (function_type, action, log_date, log_time) 
                                VALUES (?, ?, ?, ?)""",
                        (function_type, action, log_date, log_time))
            except sqlite3.Error as e:
                logger.error(f"Create Logs [{function_type} - {action}]:-> {str(e)}")
        return func(*args)
    return wrapper
