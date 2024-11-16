import streamlit as st
from controllers.user_controller import UserController
from controllers.attendance_controller import AttendanceController
from controllers.caixa_controller import CaixaController
from controllers.stock_controller import StockController
from views.user_view import UserView
from views.attendance_view import AttendanceView
from views.caixa_view import CaixaView
from views.stock_view import StockView
from database.path import db_path
from utils.authentication import check_login_password


class App:
    # Controllers
    user_controller = UserController(db_path)
    attendance_controller = AttendanceController(db_path)
    caixa_controller = CaixaController(db_path)
    stock_controller = StockController(db_path)

    # Views
    user_view = UserView(user_controller)
    attendance_view = AttendanceView(user_controller, attendance_controller)
    caixa_view = CaixaView(user_controller, caixa_controller)
    stock_view = StockView(stock_controller)

    actions = {
    "Gestão de Funcionários": {
        "Cadastrar": user_view.insert_user,
        "Consultar": user_view.select_users,
        "Alterar": user_view.update_user,
        "Ativar / Desativar": user_view.updatestatus_users
    },
    "Controle de Ponto": {
        "Registrar Ponto": attendance_view.create_attendance,
        "Consultar Registros": attendance_view.get_attendances,
        "Alterar Registros": attendance_view.change_attendance,
        "Deletar Registros": attendance_view.delete_attendance
    },
    "Caixa": {
        "Fechamento": caixa_view.save_closing_balance,
        "Atualização": caixa_view.update_closing_balance,
        "Relatório": caixa_view.reporting_balance
    },
    "Produtos": {
        "Att. Estoque/Pedido": stock_view.update_stock_and_pending_orders,
        "Gerenciar Pedidos": stock_view.manage_orders,
        "Gerenciar Produtos": stock_view.crud_products,
        "Visualizar Histórico": stock_view.show_products_history
    }
    }

    @staticmethod
    def run() -> None:
        st.set_page_config(
            page_title="Sistema Avenida",
            page_icon="📋",
            initial_sidebar_state="expanded"
        )   

        if "opened_browser" not in st.session_state:
            if check_login_password():
                st.session_state["opened_browser"] = 1
            else:
                st.stop()
      
        st.sidebar.markdown("<h1><font color='#e8516f'>Sistema Avenida</font></h1>", unsafe_allow_html=True)
        st.sidebar.write('')
        
        funcionalidade = st.sidebar.radio("Categoria",[key for key in App.actions])
        st.sidebar.write('')
        page = st.sidebar.selectbox("Funcionalidade", [key for key in App.actions[funcionalidade]])

        #Showing selected page                       
        App.actions[funcionalidade][page]()


if __name__ == '__main__':
    app = App()
    app.run()
