import streamlit as st
import sqlite3
from datetime import datetime
from pytz import timezone
from utils.validation import is_money_format_ok
from utils.authentication import has_balance_update_permission, has_default_permission
from utils.formatting import print_balance_html_table


class CaixaView:
    def __init__(self, user_controller, caixa_controller):
        self.user_controller = user_controller
        self.caixa_controller = caixa_controller
      

    def save_closing_balance(self):
        current_datetime = datetime.now(timezone('America/Sao_Paulo'))
        current_date_dmy = current_datetime.strftime("%d-%m-%Y")
        current_date_ymd = current_datetime.strftime("%Y-%m-%d")

        #Brazilian day of week
        day_of_week = current_datetime.strftime("%A")
        day_names_mapping = {
                            "Monday": "segunda-feira",
                            "Tuesday": "terça-feira",
                            "Wednesday": "quarta-feira",
                            "Thursday": "quinta-feira",
                            "Friday": "sexta-feira",
                            "Saturday": "sábado",
                            "Sunday": "domingo"
                        }
        brazilian_day_week = day_names_mapping.get(day_of_week)


        st.markdown(f'<h3><span style="color:#d05573;">{current_date_dmy} [{brazilian_day_week}]</span></h3>', unsafe_allow_html=True)

        users = self.user_controller.select_info_employees(['numero_identificacao','complete_name','role','status'])
        active_caixa_users = [user for user in users if user.role  == "Atendente de Caixa" and user.status == 'Ativo']
        selected_user = st.selectbox("Funcionário", options=active_caixa_users, format_func=lambda value: f"{value.complete_name}")

        #card_value = st.text_input("💳 Cartão de Crédito", max_chars=7, placeholder="0000,00")
        #pix_value = st.text_input("📱PIX", max_chars=7, placeholder="0000,00")
        money_value = st.text_input("💵 Dinheiro", max_chars=7, placeholder="0000,00")
        period  = st.radio("Período",options=['Dia','Tarde'])
       
        #Defautl Initial State
        #card_value_status = "❌"
        #pix_value_status = "❌"
        money_value_status = "❌"

        # Validations
        #is_card_value_correct = is_money_format_ok(card_value)
        #is_pix_value_correct = is_money_format_ok(pix_value)
        is_money_value_correct = is_money_format_ok(money_value)

        # if not is_card_value_correct:
        #     card_value_status = "❌"
        # elif is_card_value_correct:
        #     card_value_status = "✅"

        # if not is_pix_value_correct:
        #     pix_value_status = "❌"
        # elif is_pix_value_correct:
        #     pix_value_status = "✅"

        if not is_money_value_correct:
            money_value_status = "❌"
        elif is_money_value_correct:
            money_value_status = "✅"

        col1 = st.columns(1)[0]

        # with col1:
        #     if card_value_status == "❌":
        #         st.markdown(f"<div style='text-align: center; background-color: #FFCCCC; color: #910c22; padding: 10px; border-radius: 5px;'>Cartão {card_value_status}</div>", unsafe_allow_html=True)
        #     else:
        #         st.markdown(f"<div style='text-align: center; background-color: #CCFFCC; color: #136f63; padding: 10px; border-radius: 5px;'>Cartão {card_value_status}</div>", unsafe_allow_html=True)

        # with col2:
        #     if pix_value_status == "❌":
        #         st.markdown(f"<div style='text-align: center; background-color: #FFCCCC; color: #910c22; padding: 10px; border-radius: 5px;'>PIX {pix_value_status}</div>", unsafe_allow_html=True)
        #     else:
        #         st.markdown(f"<div style='text-align: center; background-color: #CCFFCC; color: #136f63; padding: 10px; border-radius: 5px;'>PIX {pix_value_status}</div>", unsafe_allow_html=True)

        with col1:
            if money_value_status == "❌":
                st.markdown(f"<div style='text-align: center; background-color: #FFCCCC; color: #910c22; padding: 10px; border-radius: 5px;'>Dinheiro {money_value_status}</div>", unsafe_allow_html=True)
            else:
                st.markdown(f"<div style='text-align: center; background-color: #CCFFCC; color: #136f63; padding: 10px; border-radius: 5px;'>Dinheiro {money_value_status}</div>", unsafe_allow_html=True)

        st.write('')
        observation = st.text_area('Observações Adicionais', placeholder="Texto", height=250)

        conditions_check = [is_money_value_correct]
        
        if all(conditions_check):
            if st.button("Registrar"):
                user_id = selected_user.numero_identificacao
                response = self.caixa_controller.create_closing_balance(user_id,
                                                                         current_date_ymd,
                                                                         period,
                                                                         "0.00",
                                                                         "0.00",
                                                                         money_value.replace(',','.'), 
                                                                         observation,
                                                                         log_call=True)
                if isinstance(response, sqlite3.IntegrityError):
                    st.error("Balanço já foi registrado!")
                elif isinstance(response, sqlite3.Error):
                    st.error("Não foi possível realizar a operação!")
                else:
                    st.success("Balanço salvo com sucesso!")

        
    def update_closing_balance(self):
        st.markdown('<h3 style="color:white;">Atualização do Caixa</h3>', unsafe_allow_html=True)

        app_pass = st.text_input(label=":red[Senha]", type="password", key="update_balance")
        is_correct_password = has_balance_update_permission(app_pass)
        if app_pass != '' and not is_correct_password:
            st.error('Senha Incorreta!')
        if is_correct_password:
            date = st.date_input("Data de Fechamento", format='DD/MM/YYYY', min_value=datetime(1960, 1, 1), max_value=(datetime.now())).strftime('%Y-%m-%d')
            period  = st.radio("Período",options=['Dia','Tarde'])
            closing_values = self.caixa_controller.get_closing_values(date, period)
            if closing_values:
                st.markdown(f'<h3><span style="color:#d05573;">{closing_values.user_name}</span></h3>', unsafe_allow_html=True)
                money_value = st.text_input("💵 Dinheiro", max_chars=7, placeholder="0000,00",value=f"{closing_values.money_value:.2f}".replace('.', ','))
                
                #Initial State
                money_value_status = "❌"

                # Validation
                is_money_value_correct = is_money_format_ok(money_value)

                if not is_money_value_correct:
                    money_value_status = "❌"
                elif is_money_value_correct:
                    money_value_status = "✅"


                if money_value_status == "❌":
                    st.markdown(f"<div style='text-align: center; background-color: #FFCCCC; color: #910c22; padding: 10px; border-radius: 5px;'>Dinheiro {money_value_status}</div>", unsafe_allow_html=True)
                else:
                    st.markdown(f"<div style='text-align: center; background-color: #CCFFCC; color: #136f63; padding: 10px; border-radius: 5px;'>Dinheiro {money_value_status}</div>", unsafe_allow_html=True)

                st.write('')
                observation = st.text_area('Observações Adicionais', placeholder="Texto", height=250,value=closing_values.observation)

                conditions_check = [is_money_value_correct]
                                   
                if all(conditions_check):
                    if st.button("Atualizar"):
                        response = self.caixa_controller.update_closing_balance(date, 
                                                                                period,
                                                                                money_value.replace(',','.'), 
                                                                                observation,
                                                                                log_call=True)
                        if response:
                            st.success("Balanço atualizado com sucesso!")

            elif isinstance(closing_values, sqlite3.Error):
                st.error("Não foi possível realizar a operação!")
            else:
                st.info("Sem dados na data selecionada!")

            
    def reporting_balance(self):
        st.markdown('<h4 style="color:white;">Relatório de Fechamento</h4>', unsafe_allow_html=True)
        app_pass = st.text_input(label=":red[Senha]", type="password")
        is_correct_password = has_default_permission(app_pass)
        if app_pass != '' and not is_correct_password:
            st.error('Senha Incorreta!')

        if is_correct_password:
            date  = st.date_input(label="Data Inicial", format='DD/MM/YYYY', max_value=datetime.now()).strftime('%Y-%m-%d')
            if st.button("Consultar"):
                data = self.caixa_controller.get_reporting_balance(date, log_call=True)
                html_data = print_balance_html_table(data)
                st.markdown(html_data, unsafe_allow_html=True)
