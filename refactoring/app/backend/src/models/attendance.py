from pydantic import BaseModel
from datetime import datetime, time


class BaseAttendance(BaseModel):
    user_id: int
    date: datetime
    type: str
    time: time

class Attendance(BaseAttendance):
    id: int
