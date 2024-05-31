import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta


def moving_months(month_translation):  
    today = datetime.today()
    first_day_of_next_month = today.replace(day=1) + relativedelta(months=1)
    two_months_ago = today - relativedelta(months=12)

    months_options = {f"{month_translation[dt.strftime('%B')]} {dt.strftime('%Y')}": dt.strftime('%B %Y')
                    for dt in pd.date_range(two_months_ago, first_day_of_next_month, freq='M')}
    
    return months_options
