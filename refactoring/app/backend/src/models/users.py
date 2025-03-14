from pydantic import BaseModel
from datetime import datetime


class BaseUser(BaseModel):
    numero_identificacao: int
    complete_name: str
    date_nascimento: datetime
    date_admissao: datetime
    role: str
    telephone_number: str
    observation: str
    status: str  

class User(BaseUser):
    id: int
