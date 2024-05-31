import smtplib

from datetime import datetime
from streamlit import secrets, error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def sendmail_closing_balance(date, card_value, pix_value, money_value, observation):
    portuguese_date = datetime.strftime(datetime.strptime(date, '%Y-%m-%d'), '%d-%m-%Y')

    #Mail
    msg = MIMEMultipart()
    msg['From'] = str(secrets['email'])
    msg['To'] =  str(secrets['email'])
    msg['Subject'] = f"Fechamento de Caixa {portuguese_date}"

    # HTML body for the email
    html_body = f"""
    <html>
    <body>
        <p>Segue o fechamento de caixa:</p>
        <ul>
            <li>Data: {date}</li>
            <li>Valor no Cartão: {card_value}</li>
            <li>Valor no PIX: {pix_value}</li>
            <li>Valor em Dinheiro: {money_value}</li>
            <li>Observação: {observation}</li>
        </ul>
    </body>
    </html>
    """
    # Attach HTML content to the email
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP('smtp.office365.com', 587)
        server.starttls()
        server.login(msg['From'], str(secrets['email-pass']))
        text = msg.as_string()
        server.sendmail(msg['From'], msg['To'], text)
        server.quit()
        return 1
    except smtplib.SMTPException as e:
        print(f"SMTPException: {e}")
        error(f'SMTPException: {e} Falha ao enviar o email: {e}')
        return 0
    except Exception as e:
        print(f"Exception: {e}")
        error(f'Exception: {e} ao enviar o email: {e}')
        return 0