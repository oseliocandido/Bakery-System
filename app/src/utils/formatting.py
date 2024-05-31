import pandas as pd
import streamlit as st
from datetime import datetime


def brazilian_date(df, columns):
    for column in columns:
        df[column] = pd.to_datetime(df[column]).dt.strftime('%d-%m-%Y')
    return df

def print_balance_html_table(data) -> str:
  html = """<!DOCTYPE html><html><head>
  <style>
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        width: 16.66%;
    }
    td {
        background-color: transparent;
        text-align: center;
    }
    th.date, th.type1, th.type2, th.type3, th.total {
        width: auto;
    }
    th {
        color: #fff;  
    }
    th.type1 {
        background-color: #7700ff;
    }
    th.type2 {
        background-color: #08B9C9;
    }
    th.type3 {
        background-color: #FF9C00;
    }
    th.AccDinheiro {
        background-color: #EC3D44;
    }
    th.date, th.total {
        background-color: transparent;
        width: 20%;
    }
    td.total, td.AccDinheiro {
        font-size: 18px;
        font-weight: bold;
    }
</style>
</head>
<body>
    <table>
      <tr>
        <th class="date">Data</th>
        <th class="type1">Cartão</th>
        <th class="type2">PIX</th>
        <th class="type3">Dinheiro</th>
        <th class="total">Total</th>
        <th class="AccDinheiro">💵 Acumulado</th>
      </tr>"""
  for i in range(len(data)):
    casted_total = str(data[i]['total']).replace('.' , ',')
    casted_acc_dinheiro = str(data[i]['AccDinheiro']).replace('.' , ',')
    portuguese_date = datetime.strftime(datetime.strptime(str(data[i]['date']), '%Y-%m-%d'), '%d-%m-%Y')

    html += f"""<tr>
              <td class="date">{portuguese_date}</td>
              <td class="type1">{data[i]['card_value']}</td>
              <td class="type2">{data[i]['pix_value']}</td>
              <td class="type3">{data[i]['money_value']}</td>
              <td class="total">{casted_total}</td>
              <td class="AccDinheiro">{casted_acc_dinheiro}</td>
            </tr>"""
  # Closing HTML tags
  html += "</table></body></html>"

  return html