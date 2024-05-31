import streamlit as st
import pandas as pd
from time import sleep
from datetime import datetime
from utils.authentication import has_default_permission
from utils.formatting import brazilian_date
from utils.validation import is_numeric_field, validate_phone_number, is_correct_name, is_6_chars_long
from enum import Enum


class UserRoles(Enum):
    PADEIRO = "Padeiro"
    AUXILAR_PADEIRO = "Auxiliar de Padeiro"
    ATENDENTE_CAIXA = "Atendente de Caixa"
    COZINHEIRA = "Cozinheira"


class UserView:
    roles = [role.value for role in UserRoles]
    column_mapping = {
            'Número de Identificação': 'numero_identificacao',
            'Nome Completo': 'complete_name',
            'Data de Admissão': 'date_admissao',
            'Status':'status',
            'Data de Nascimento': 'date_nascimento',
            'Cargo': 'role',
            'Telefone': 'telephone_number',
            'Observação': 'observation',
        }

    def __init__(self, user_controller):
        self.user_controller = user_controller


    def insert_user(self):
        st.markdown('<h4 style="color:white;">Cadastro de Funcionários</h4>', unsafe_allow_html=True)
        inputs = {
            'numero_identificacao': st.text_input("Número de Identificação", placeholder='Apenas Dígitos Numéricos', max_chars=6),
            'complete_name': st.text_input("Nome Completo", placeholder='Nome'),
            'date_nascimento': st.date_input("Data de Nascimento",format='DD/MM/YYYY', min_value=datetime(1960, 1, 1), max_value=(datetime.now())).strftime('%Y-%m-%d'),
            'date_admissao': st.date_input("Data de Admissão", format='DD/MM/YYYY', max_value=(datetime(datetime.today().year,12,31))).strftime('%Y-%m-%d'),
            'role': st.selectbox("Cargo", UserView.roles),
            'telephone_number': st.text_input("Telefone (859XXXXXXXX)", placeholder="XXXXXXXXXXX", max_chars=11),
            'observation': st.text_area('Observações Adicionais', placeholder="Obs")}
        app_pass = st.text_input(label=":red[Senha]", type="password")
    
        # Input Validations
        is_identificacao_digit_correct = is_numeric_field(inputs['numero_identificacao'])
        is_6_digits_long = is_6_chars_long(inputs['numero_identificacao'])
        is_correct_password = has_default_permission(app_pass)
        is_ok_name = is_correct_name(inputs['complete_name'])
        is_valid_phone_number = validate_phone_number(inputs['telephone_number'])

        #Messages with error validation
        if app_pass != '' and not is_correct_password:
            st.error('Senha Incorreta!')

        if inputs['numero_identificacao'] != '':
            if not is_identificacao_digit_correct:
                st.error("O Número de Identificação deve conter apenas dígitos.")
            elif not is_6_digits_long:
                st.error("O Número de Identificação deve conter exatamente 6 dígitos.")

        if not is_ok_name:
            st.error("Nome Completo é obrigatório.")

        if inputs['telephone_number'] != '' and not is_valid_phone_number:
            st.error('Telefone fornecido é inválido.')

        conditions_check = [is_identificacao_digit_correct,
                            is_correct_password,
                            is_ok_name,
                            is_6_digits_long,
                            is_valid_phone_number]

        if all(conditions_check):
            if st.button("Cadastrar"):
                user_inserted = self.user_controller.insert_employee(inputs, log_call=True)
                if user_inserted:
                    st.success("Usuário adicionado com sucesso!")
    
    
    def select_users(self):
        st.markdown('<h4 style="color:white;">Funcionários Cadastrados</h4>', unsafe_allow_html=True)
        choosen_columns = st.multiselect('Campos', options=[key for key in UserView.column_mapping.keys()])
        database_columns = [UserView.column_mapping[column] for column in choosen_columns]
        inverted_mapping = {value: key for key, value in UserView.column_mapping.items()}

        if choosen_columns:
            if st.button("Consultar"):
                users = self.user_controller.select_info_employees(database_columns)
                user_struct = {}
                for column in database_columns:
                    user_struct[column] = [getattr(user, column) for user in users]
            
                df = pd.DataFrame(user_struct)

                if 'Número de Identificação' in choosen_columns:
                    df['numero_identificacao'] = df['numero_identificacao'].astype(str).str.zfill(6) 

                columns_date_format= []
                for value in database_columns:
                     if value.find('date') > -1:
                        columns_date_format.append(value)
                df = brazilian_date(df, columns_date_format)
                df.rename(columns=inverted_mapping, inplace=True)
                df.fillna('')
                st.dataframe(df, hide_index=True, use_container_width=True)
        

    def updatestatus_users(self):
        st.markdown('<h4 style="color:white;">Status Funcionários</h4>', unsafe_allow_html=True)
        app_pass = st.text_input(label=":red[Senha]", type="password")
        is_correct_password = has_default_permission(app_pass)
        if app_pass != '' and not is_correct_password:
            st.error('Senha Incorreta!')

        if is_correct_password:
            users = self.user_controller.select_info_employees(['numero_identificacao','complete_name','role','status','date_admissao'])
            for user in users:
                user_key = f"User {user.numero_identificacao}"
                with st.expander(f"{user.complete_name} (ID: {user.numero_identificacao:06d})"):
                    user_info_col = st.columns((2,2,1,1))
                    user_info_col[0].write(f"**Cargo:** {user.role}")
                    user_info_col[1].write(f"**Admissão:** {datetime.strftime(datetime.strptime(user.date_admissao,('%Y-%m-%d')),'%d-%m-%Y')}")
                    new_status = user_info_col[3].radio("**Status**", ["Ativo", "Inativo"], index=0 if user.status == "Ativo" else 1, key=f"toggle_{user_key}")
                    if new_status != user.status:
                        response = self.user_controller.update_employees_status(user.numero_identificacao, new_status == "Ativo", log_call=True)
                        if response:
                            st.success("Status Atualizado!")
                            sleep(1)
                            st.rerun()
                    

    def update_user(self):
        st.markdown('<h4 style="color:white;">Alteração de Cadastro</h4>', unsafe_allow_html=True)
        users = self.user_controller.select_info_employees(['numero_identificacao','complete_name'])
        selected_user = st.selectbox("Funcionário", options=users, format_func=lambda value: f"{value.complete_name}")
        user_id = selected_user.numero_identificacao
        choosen_columns = st.multiselect("Campos", options=[
                                                            'Nome Completo',"Data de Nascimento",
                                                            "Data de Admissão","Cargo",
                                                            "Telefone", "Observação"])
        column_input_type = {
        'Número de Identificação': st.text_input,
        'Nome Completo': st.text_input,
        'Data de Nascimento': st.date_input,
        'Data de Admissão': st.date_input,
        'Cargo': st.selectbox,
        'Telefone': st.text_input,
        'Observação': st.text_input,
}
        if len(choosen_columns) == 0:
            pass
        else:
            st.markdown('<h4 style="color:white;">Atualizando</h4>',unsafe_allow_html=True)  
            database_columns = []
            for column in choosen_columns:
                if column == 'Cargo':
                    database_columns.append((UserView.column_mapping[column], column_input_type[column](f"{column}", options=UserView.roles)))
                else:
                    database_columns.append((UserView.column_mapping[column], column_input_type[column](f"{column}")))

            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')

            if is_correct_password:
                if st.button("Atualizar"):
                    returned_user = self.user_controller.update_employee(database_columns, user_id, log_call=True)
                    if returned_user:
                        st.success(f"As informações de {returned_user.complete_name} foram atualizadas")
                        sleep(1.5)
                        st.rerun()
