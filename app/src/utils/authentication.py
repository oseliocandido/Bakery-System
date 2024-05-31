import streamlit as st
import hmac

def has_default_permission(password):
    return password == st.secrets['default_permission']

def has_balance_update_permission(password):
    return password == st.secrets['update_closing_balance_permission']

def check_login_password():
    """Returns `True` if the user had a correct password."""

    def login_form():
        """Form with widgets to collect user information"""
        with st.form("Credentials"):
            st.text_input("Usuário", key="username")
            st.text_input("Senha", type="password", key="password")
            st.form_submit_button("Login", on_click=password_entered)

        if "first_try" not in st.session_state:
            st.warning("Insira suas credenciais para prosseguir")
            st.session_state.first_try = 1

    def password_entered():
        """Checks whether a password entered by the user is correct."""
        if st.session_state["username"] in st.secrets[
            "login"
        ] and hmac.compare_digest(
            st.session_state["password"],
            st.secrets.login[st.session_state["username"]],
        ):
            st.session_state["password_correct"] = True
            del st.session_state["password"]  # Don't store the username or password.
            del st.session_state["username"]
        else:
            st.session_state["password_correct"] = False

    # Return True if the username + password is validated.
    if st.session_state.get("password_correct", False):
        return True

    # Show inputs for username + password.
    login_form()
    if "password_correct" in st.session_state:
        st.error('Credencias Incorretas!', icon='🚩')
    return False
