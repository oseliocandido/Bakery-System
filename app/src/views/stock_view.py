import streamlit as st
import pandas as pd
import sqlite3
from datetime import datetime
from utils.authentication import has_default_permission
from time import sleep


class StockView:
    def __init__(self, stock_controller):
        self.stock_controller = stock_controller

    def crud_products(self):
        tab_create, tab_update = st.tabs(["Cadastrar", "Atualizar"])
        with tab_create:
            st.markdown('<h4 style="color:white;">Cadastrar</h4>', unsafe_allow_html=True)

            description = st.text_input("Descrição",placeholder="Descritivo", max_chars=100)
            current_stock = st.number_input("Estoque Atual",placeholder="Quantidade",value=None,min_value=0)
            min_stock = st.number_input("Estoque Mínimo",placeholder="Quantidade",value=None, min_value=0)
            pack_type = st.selectbox("Tipo de Pacote", ["Fardo", "Unidade"])

            suppliers = self.stock_controller.get_suppliers_info()
            choosen_suppliers= st.multiselect("Fornecedores", options=suppliers, format_func=lambda value: f"{value[1]}")
            suppliers_id = [supplier[0] for supplier in choosen_suppliers]

            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
            if is_correct_password:
                if st.button("Cadastrar"):
                    if not choosen_suppliers:
                        st.error('Selecione ao menos um fornecedor')
                        st.stop()
                        
                    product_id = self.stock_controller.create_product(description, 
                                                                      current_stock, 
                                                                      min_stock,
                                                                      pack_type,
                                                                      suppliers_id)
                    if product_id:
                        st.success(f"Produto adicionado com sucesso!")
                 
    
        with tab_update:
            st.markdown('<h4 style="color:white;">Atualizar</h4>', unsafe_allow_html=True)
            products = self.stock_controller.get_product_update_info()
            id_column, desc_column, min_stock_colum, status_column = ('Id','Descrição','Estoque Minimo','Status')

            # Display product information in a table
            database_info = pd.DataFrame(products, columns=[id_column, desc_column, min_stock_colum, status_column])
            update_dataframe = st.data_editor(database_info, 
                                        hide_index=True, 
                                        use_container_width=True,
                                        height=400,
                                        disabled=(id_column,),
                            column_config={
                                            id_column: st.column_config.NumberColumn(width=5),
                                            desc_column: st.column_config.TextColumn(width="medium"),
                                            min_stock_colum: st.column_config.NumberColumn(width="small"),                  
                                            status_column: st.column_config.TextColumn(width="small")
                                        })

            app_pass = st.text_input(label=":red[Senha]", type="password",key="Update Product")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')

            if is_correct_password:
                if st.button("Atualizar",key="Update Products"):
                    retorno = self.stock_controller.update_product_info(update_dataframe, log_call=True)
                    if retorno:
                        st.success(f"Produtos atualizados com sucesso!")
    

    def update_stock_and_pending_orders(self):
        #Related to update_order_status
        st.markdown('<h4 style="color:#d93d3d;">Pedidos Pendentes</h4>', unsafe_allow_html=True)
        orders_items = self.stock_controller.get_pending_orders_items()

        orders_df = pd.DataFrame(orders_items, columns=['order_id','order_date','supp_desc','Produtos'])
        orders_df['order_date'] = pd.to_datetime(orders_df['order_date']).dt.strftime('%d/%m')
        unique_combinations = orders_df.groupby(['order_id','order_date', 'supp_desc'])

        for (order_id, order_date, supp_desc), group in unique_combinations:
            with st.expander(f"{order_id} 🔖 {supp_desc} 📦 {order_date}"):
                col1, col2 = st.columns([3,1])
                with col1:
                    st.dataframe(group[['Produtos']], hide_index=True,)
                with col2:
                    if st.button("Confirmar Entrega",key={f'{order_id}_confirm'}):
                        retorno = self.stock_controller.update_order_status(str(order_id), log_call=True)
                        if retorno:
                            st.success("Entrega confirmada!")
                        else:
                            st.error("Não foi possível realizar a operação!")
                        sleep(0.7)
                        st.rerun()
                        
                        
        #Related to update stock
        products_info = self.stock_controller.get_product_info()
        updated_stock_time = products_info[0][-1]
        # Convert string to datetime object
        datetime_object = datetime.strptime(updated_stock_time, '%Y-%m-%d %H:%M:%S.%f')
        formatted_time = datetime_object.strftime("%d/%m %H:%M:%S")
    
        st.write('')
        st.write('')
        st.markdown(f'<h4 style="color: #5cb4f2; display: inline;">Estoque</h4> <h4 style="font-size: 16px; color: #FFFFFF; display: inline;">Última Att. [{formatted_time}]</h4>', unsafe_allow_html=True)
        st.write('')
        id_column, desc_column, stock_colum, new_stock_column = ('ID','Descrição','Último Estoque','Estoque Atual')
        product_without_date_package = [item[:-2] for item in products_info]

        # Display product information in a table
        database_info = pd.DataFrame(product_without_date_package, columns=[id_column, desc_column, stock_colum])
        database_info[new_stock_column] = None

        update_dataframe = st.data_editor(database_info, 
                                            hide_index=True, 
                                            use_container_width=True,
                                            disabled=(id_column, desc_column, stock_colum),
                                column_config={
                                        id_column: st.column_config.NumberColumn(
                                                            width=10),
                                        desc_column: st.column_config.TextColumn(
                                                            width="medium"),
                                        stock_colum: st.column_config.NumberColumn(
                                                            width="small"),                  
                                        new_stock_column: st.column_config.NumberColumn(
                                                            width="medium",
                                                            min_value=0,
                                                            required=True)
                                            })
        if st.button("Atualizar"):
            retorno = self.stock_controller.update_stock_qt(update_dataframe, log_call=True)
            if isinstance(retorno, sqlite3.IntegrityError):
                st.error("É necessário preencher todos os produtos!")
            elif isinstance(retorno, sqlite3.Error):
                st.error("Não foi possível realizar a operação!")
            else:
                st.success(f"Estoque atualizado com sucesso!")


    def manage_orders(self):
        tab_create_order, tab_associate_products_suppliers, tab_cancel_order = st.tabs(["Solicitar Pedido", "Associar Produtos", "Cancelar Pedido"])

        #Show for one time login authorization pass once is correct, otherwise stop the app.
        if "first_time" not in st.session_state:
            app_pass = st.text_input(label=":red[Senha]", type="password")
            is_correct_password = has_default_permission(app_pass)
            if app_pass != '' and not is_correct_password:
                st.error('Senha Incorreta!')
                st.stop()
            elif is_correct_password:
                st.session_state["first_time"] = 1
           

        with tab_create_order:
            recommended_products_to_buy = self.stock_controller.calculate_recommended_orders_items(log_call=True)
            prod_id_column, prod_desc_column, supplier_id_column, supp_desc_column, order_date_column, unit_price_column, current_price_column  = ('prod_id',
                                                                                                                        'prod_desc',
                                                                                                                        'supplier_id',
                                                                                                                        'supp_desc',
                                                                                                                        'order_date',
                                                                                                                        'unit_price',
                                                                                                                        'current_price')
            df_recommended_products_to_buy = pd.DataFrame(recommended_products_to_buy, columns=[prod_id_column,
                                                                                                prod_desc_column,
                                                                                                supplier_id_column,
                                                                                                supp_desc_column,
                                                                                                order_date_column,
                                                                                                unit_price_column,
                                                                                                current_price_column
                                                                                                ])
            df_recommended_products_to_buy[order_date_column] = pd.to_datetime(df_recommended_products_to_buy[order_date_column],format='ISO8601').dt.strftime('%d/%m')
            df_recommended_products_to_buy[order_date_column].fillna('-', inplace=True)
            
            # Group by supplier_id and iterate over groups
            colors = iter(['blue','green','orange','red','violet'])
            total_price_suppliers = []
            for supplier_id, group in df_recommended_products_to_buy.groupby('supplier_id'):
                color = next(colors)
                with st.expander(f":{color}[{group['supp_desc'].iloc[0]}]"):
                    color_style = f"color: {color};"
                    # Iterate over each product in the group
                    products = []
                    for index, row in group.iterrows():
                        with st.container():
                            # Display product details
                            package_emoji = '📦' 
                            st.write(
                                f"<div style='display: flex; justify-content: space-between; align-items: center;'>"
                                    f"{package_emoji}&nbsp;&nbsp;&nbsp;<div style='flex-grow: 1; {color_style}'>{row[prod_desc_column]}</div>"
                                    f"<div>📅 {row[order_date_column]} 💲{row[unit_price_column]}</div>"
                                    f"</div>",
                            unsafe_allow_html=True)

                            col1, col2 = st.columns([1, 1])
                            
                            # Input Quantity
                            with col1:
                                quantity = st.number_input(f"Quantidade", min_value=0.5, step=1.0, key=f"quant_{index}")
                            with col2:
                                unit_price = st.number_input(f"Preço Unitário", value=row[current_price_column], disabled = True, key=f"price_{index}")
                            st.write('')
                            products.append((supplier_id, row[prod_id_column], quantity, unit_price))

                    total_amount_order = round(sum(qt*price for _, _, qt, price in products),2)
                    total_price_suppliers.append(total_amount_order)
                    st.write(f"<h4 style='text-align: right;'>💵 • R$ {total_amount_order:.2f}</h4>", unsafe_allow_html=True)
        
                    if st.button("Solicitar", key=f"button_{index}"):
                        retorno = self.stock_controller.create_order(products, log_call=True)
                        if retorno:
                            st.success("Pedido realizado com sucesso!")
                            sleep(1.5)
                            st.rerun()
                        else:
                            st.error("Não foi possível realizar a operação!")
            st.write(f"<h3 style='text-align: left;'>💵 • R$ {sum(total_price_suppliers):.2f}</h3>", unsafe_allow_html=True)
                        
        with tab_associate_products_suppliers:
            products = self.stock_controller.get_product_info()  

            emoji = {"Fardo":'📦', "Unidade":'ⓤ'} 

            selected_product = st.selectbox("Selecionar Produto", 
                                            options=products,
                                            format_func=lambda value: f"{value[1]} {emoji.get(value[3])}")  
            selected_product_id = selected_product[0]
            association_prod_supp = self.stock_controller.get_stock_product_association(selected_product_id) 
            supp_id_column, supp_desc_column, current_price_column, status_column  = ('ID', 'Fornecedor', 'Preco Atual','Status')
            df_association_prod_supp = pd.DataFrame(association_prod_supp, columns=[supp_id_column, supp_desc_column, current_price_column, status_column])
            st.write('')
            update_dataframe = st.data_editor(df_association_prod_supp,
                                            use_container_width=False,
                                            hide_index=True,
                                            disabled=(supp_id_column, supp_desc_column),
                                            column_config={
                                                supp_id_column: st.column_config.NumberColumn(width=50),
                                                supp_desc_column: st.column_config.TextColumn(width="medium"),
                                                current_price_column: st.column_config.NumberColumn(width="medium"),
                                                status_column: st.column_config.CheckboxColumn(width="small"),
                                            })
            if st.button("Atualizar"):
                retorno = self.stock_controller.update_stock_product_association(update_dataframe, selected_product_id, log_call=True)  
                if retorno:
                    st.success("Associação realizada com sucesso!")
                else:
                    st.error("Não foi possível realizar a operação!")

        with tab_cancel_order:
            st.markdown('<h4 style="color:#d93d3d;">Cancelar Pedidos</h4>', unsafe_allow_html=True)
            orders_items = self.stock_controller.get_pending_orders_items()

            orders_df = pd.DataFrame(orders_items, columns=["order_id","order_date","supp_desc","Produtos"])
            orders_df['order_date'] = pd.to_datetime(orders_df['order_date']).dt.strftime('%d/%m')

            unique_combinations = orders_df.groupby(['order_id','order_date', 'supp_desc'])
            for (order_id, order_date, supp_desc), group in unique_combinations:
                with st.expander(f"{order_id} 🔖 {supp_desc} 📦 {order_date}"):
                    col1, col2 = st.columns([3,1])
                    with col1:
                        st.dataframe(group[['Produtos']], hide_index=True,)
                    with col2:
                        if st.button("Cancelar",key={f'{order_id}_cancel'}):
                            retorno = self.stock_controller.cancel_order(str(order_id), log_call=True)
                            if retorno:
                                st.success("Pedido cancelado com sucesso!")
                            else:
                                st.error("Não foi possível realizar a operação!")
                            sleep(0.7)
                            st.rerun()


    def show_products_history(self) -> None:
        st.markdown('<h4 style="color:white; text-align: center;">Histórico do Estoque</h4>', unsafe_allow_html=True)
        records = self.stock_controller.get_product_history(log_call=True)
        st.dataframe(data=pd.DataFrame(records,columns=['ID','Descrição','Estoque','Data de Término']),
                     hide_index=True,
                     use_container_width=True)
        