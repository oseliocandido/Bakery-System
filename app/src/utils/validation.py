import re 

def is_numeric_field(value):
    return str(value).isdigit()

def is_6_chars_long(value):
    return  len(value) == 6

def validate_phone_number(value):
    pattern = r'^\d{11}$'
    match = re.match(pattern, value)
    return True if match else False

def is_correct_name(value):
    return False if value is None or value == '' else True

def is_money_format_ok(value):
    pattern = r'^\d+,\d{2}$'
    match = re.match(pattern, value)
    return True if match else False 