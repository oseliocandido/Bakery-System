import streamlit as st
import pandas as pd
import sqlite3
from streamlit_extras.let_it_rain import rain
from datetime import datetime
from utils.authentication import has_default_permission
from utils.formatting import brazilian_date
from utils.correctperiods import moving_months
from dateutil.relativedelta import relativedelta
from pytz import timezone
from enum import Enum


class AttendanceceOptions(Enum):
    ENTRADA = "Entrada"
    ENTRADA_ALMOCO = "Entrada Almoço"
    SAIDA_ALMOCO = "Saída Almoço"
    SAIDA = "Saída"


class AttendanceView:
    options = [option.value for option in AttendanceceOptions]
    select_info_columns = ['numero_identificacao','complete_name','status']
    month_translation = {'January': 'Janeiro', 'February': 'Fevereiro','March': 'Março','April': 'Abril',
                        'May': 'Maio','June': 'Junho','July': 'Julho','August': 'Agosto',
                        'September': 'Setembro','October': 'Outubro','November': 'Novembro','December': 'Dezembro'}
    

    def __init__(self, user_controller, attendance_controller):
        self.user_controller = user_controller
        self.attendance_controller = attendance_controller


    def create_attendance(self):
        st.markdown('<h4 style="color:white;">Registrar Ponto</h4>', unsafe_allow_html=True)
        users = self.user_controller.select_info_employees(AttendanceView.select_info_columns)
        active_users = [user for user in users if user.status == "Ativo"]
        selected_user = st.selectbox("Funcionários Ativos", options=active_users, format_func=lambda value: f"{value.complete_name}")
        
        current_datetime = datetime.now(timezone('America/Sao_Paulo'))
        current_date_dmy = current_datetime.strftime("%d-%m-%Y")
        current_date_ymd = current_datetime.strftime("%Y-%m-%d")
        current_time = current_datetime.strftime("%H:%M")

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

        st.markdown(f'<h3 style="color:white;"> 📅 <span style="color:#d05573;">{current_date_dmy} [{brazilian_day_week}]</span></h3>', unsafe_allow_html=True)
        st.markdown(f'<h3 style="color:white;"> ⏰ <span style="color:green;">{current_time}</span> </h3>', unsafe_allow_html=True)

        col1, col2, col3, col4 = st.columns(4)
        point_type = col1.radio("Tipo de Ponto", AttendanceView.options)

        if st.button("Registrar"):
                user_id = selected_user.numero_identificacao
                attendance = self.attendance_controller.create_attendance(user_id, current_date_ymd, point_type, current_time, log_call=True)
                if isinstance(attendance, sqlite3.IntegrityError):
                    st.error("Ponto já foi registrado. Escolha outro!")
                elif isinstance(attendance, sqlite3.Error):
                    st.error("Não foi possível realizar a operação!")
                else:
                    st.success(f"Ponto registrado com sucesso, {str(selected_user.complete_name).split()[0]}!")
                    #Ballons if its friday and the employee is leaving
                    if current_datetime.weekday() in [4,5] and point_type == AttendanceceOptions.SAIDA.value:
                        rain(
                                emoji="🍻",
                                font_size=40,
                                falling_speed=3,
                                animation_length="infinite",
                            )
           

    def change_attendance(self):
        st.markdown('<h4 style="color:white;">Alteração de Ponto', unsafe_allow_html=True)
        users = self.user_controller.select_info_employees(['numero_identificacao','complete_name','status'])
        active_users = [user for user in users if user.status == "Ativo"]
        selected_user = st.selectbox("Funcionários Ativos", options=active_users, format_func=lambda value: f"{value.complete_name}")

        point_type = st.selectbox("Tipo de Ponto", AttendanceView.options)
        date = st.date_input(label="Data", format='DD/MM/YYYY', max_value=datetime.now()).strftime('%Y-%m-%d')

        user_id = selected_user.numero_identificacao
        attendance = self.attendance_controller.get_attendance_by_type_and_date(user_id, date, point_type)
        portuguese_date = datetime.strftime(datetime.strptime(date, '%Y-%m-%d'), '%d-%m-%Y')

        if attendance:
            st.info(f'Ponto de {point_type} de {selected_user.complete_name} em {portuguese_date} foi às {attendance.time}.')
            new_time = st.time_input("Novo Horário",step=300).strftime("%H:%M")
            st.warning(f'Ponto de {point_type} de {selected_user.complete_name} em {portuguese_date} será às {new_time}.')

            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
        
            if is_correct_password:
                if st.button("Atualizar"):
                    response = self.attendance_controller.modify_attendance(user_id, date, new_time, point_type, log_call=True)
                    if response:
                        st.success("Ponto atualizado com sucesso!") 
            
        elif isinstance(attendance, sqlite3.Error):
            st.error("Não foi possível realizar a operação!")
        else:
            st.info(f'{selected_user.complete_name} não possui ponto do tipo {point_type} em {portuguese_date}')
            current_datetime = datetime.now(timezone('America/Sao_Paulo'))
            new_time = st.time_input("Novo Horário", step=300, value=current_datetime).strftime("%H:%M")

            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
            if is_correct_password:
                if st.button("Registrar"):
                    response = self.attendance_controller.create_attendance(user_id, date, point_type, new_time, log_call=True)
                    if response:
                        st.success("Ponto inserido com sucesso!")


    def get_attendances(self):
        st.markdown('<h4 style="color:white;">Registros de Pontos', unsafe_allow_html=True)
        months_options = moving_months(AttendanceView.month_translation)
        selected_months_pt = st.multiselect("Período", options=list(months_options.keys())[::-1])  

        if len(selected_months_pt) >= 1:
            all_month_attendances = []  
            for month_pt in selected_months_pt:
                month_english = months_options[month_pt]
                selected_month_datetime = datetime.strptime(month_english, '%B %Y')
                next_month_datetime = selected_month_datetime + relativedelta(months=1)

                selected_month_start = selected_month_datetime.strftime('%Y-%m-%d')
                selected_month_end = next_month_datetime.strftime('%Y-%m-%d')

                attendances = self.attendance_controller.get_attendance_by_periods(selected_month_start, selected_month_end)
                attendance_data = {
                        "User_Id": [attendance.user_id for attendance in attendances],
                        "Data": [attendance.date for attendance in attendances],
                        "Time": [attendance.time for attendance in attendances],
                        "Type": [attendance.type for attendance in attendances]
                    }
                
                month_attendances = pd.DataFrame(attendance_data)
                all_month_attendances.append(month_attendances) 

            all_df = pd.concat(all_month_attendances)
            all_df = all_df.pivot_table(index=['User_Id', 'Data'], columns='Type', values='Time', aggfunc='first').reset_index()
            all_df['Data'] = pd.to_datetime(all_df['Data'],format='%Y-%m-%d')
            all_df = all_df.sort_values(by="Data", ascending=False)
            all_df = brazilian_date(all_df, ['Data'])
            all_df = all_df.fillna('')
  

            users = self.user_controller.select_info_employees(['numero_identificacao','complete_name','role','status','date_admissao'])
            for user in users:
                with st.expander(f"{user.complete_name} (ID: {user.numero_identificacao:06d})"):
                    user_frequencies = all_df[all_df['User_Id'] == user.numero_identificacao]
                    if not user_frequencies.empty:
                        columns_to_include = ['Data']
                        for option in AttendanceceOptions:
                            if option.value in user_frequencies.columns:
                                columns_to_include.append(option.value)
                        st.dataframe(user_frequencies[columns_to_include], hide_index=True, use_container_width=True)
                    else: 
                        st.info(f'Sem dados no(s) período(s)!')
                    
            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
            if is_correct_password:
                csv = all_df.to_csv().encode('utf-8')
                st.download_button(
                                    label="Exportar Frequências",
                                    data=csv,
                                    file_name='pontos_funcionarios.csv',
                                    mime='text/csv')


    def delete_attendance(self):
        st.markdown('<h4 style="color:white;">Deletar Registros', unsafe_allow_html=True)
        users = self.user_controller.select_info_employees(AttendanceView.select_info_columns)
        active_users = [user for user in users if user.status == "Ativo"]
        selected_user = st.selectbox("Funcionários Ativos", options=active_users, format_func=lambda value: f"{value.complete_name}")

        point_type = st.selectbox("Tipo de Ponto", AttendanceView.options)
        date = st.date_input(label="Data", format='DD/MM/YYYY', max_value=datetime.now()).strftime('%Y-%m-%d')
        
        user_id = selected_user.numero_identificacao
        attendance = self.attendance_controller.get_attendance_by_type_and_date(user_id, date, point_type)
        portuguese_date = datetime.strftime(datetime.strptime(date, '%Y-%m-%d'), '%d-%m-%Y')

        if attendance:
            st.info(f'Ponto de {point_type} de {selected_user.complete_name} em {portuguese_date} é {attendance.time}.')
            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
            if is_correct_password:
                if st.button("Deletar"):
                    response = self.attendance_controller.delete_attendance(user_id, date, point_type, log_call=True)
                    if response:
                        st.success("Ponto deletado com sucesso!")
                        
        elif isinstance(attendance, sqlite3.Error):
            st.error("Não foi possível realizar a operação!")
        else:
            st.error(f'{selected_user.complete_name} não possui ponto do tipo {point_type} em {portuguese_date}')
