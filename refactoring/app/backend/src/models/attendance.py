from pydantic import BaseModel
from datetime import datetime


class BaseAttendance(BaseModel):
    user_id: int
    datetime: datetime
    type: str

class Attendance(BaseAttendance):
    id: int
