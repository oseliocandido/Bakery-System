








from fastapi import APIRouter, HTTPException, Depends
# from src.models.users import UserCreate, UserResponse, UserDTO
from src.services.database import get_db
from pydantic import BaseModel
import psycopg
from datetime import datetime 

router = APIRouter(tags=['users'],prefix='/users')


fake_data = [
    {"user_id": 1, "nome": "Oselio",    "age": 35, "money": 4.20},
    {"user_id": 2, "nome": "Stephanie", "age": 27, "money": 3.45},
]

class BaseUser(BaseModel):
    numero_identificacao: str
    complete_name: str 
    date_nascimento: datetime
    date_admissao: datetime
    role: str
    telephone_number: str
    observation: str
    status: str

class NiceUser(BaseUser):
    dog: str

class CreateUser(BaseModel):
    nome: str 
    age: int 
    money: float



class UserTest(BaseModel):
    user_id: int 
    nome: str 
    age: int 
    money: float


# CREATE TABLE users
#                 (numero_identificacao INTEGER PRIMARY KEY,
#                 complete_name TEXT,
#                 date_nascimento DATE,
#                 date_admissao DATE,
#                 role TEXT,
#                 telephone_number TEXT,
#                 observation TEXT,
#                 status TEXT DEFAULT 'Ativo');

@router.get("/all")
def get_users() -> list[UserTest]:
    """Endpoint to get information about users."""
    try:
        if not fake_data:
            raise HTTPException(status_code=404, detail="No users found.")
    except Exception:
        raise Exception("Something bad happended")
    return fake_data


@router.get("/{user_id}")
def get_user(user_id: int) -> UserTest:
    """DOCSTRING"""
    for user in fake_data:
        if user["user_id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found.")
 

@router.post("/create_user/")
def create_user(user: CreateUser):
    nomezim = user.nome
    return {'dados':f"{nomezim}"}


# @router.post("/create_user/")
# def create_user(user: CreateUser, db: psycopg.Connection = Depends(get_db)):
#     # insert_query = """INSERT INTO users (nome, age, money)
#     #                   VALUES (%s, %s, %s) RETURNING nome"""
#     insert_query = """INSERT INTO users (nome, age, money)
#                     VALUES (%s, %s, %s) RETURNING nome"""
#     nomezim = CreateUser.nome
#     return {'dados':f"{nomezim}"}

    # try:
    #     with db.cursor() as cursor:
    #         cursor.execute(insert_query, (user.user_id, user.nome, user.age, user.money))
    #         row = cursor.fetchone()
    #     return UserResponse(numero_identificacao=row[0], complete_name=user.complete_name)
    # except psycopg.Error as e:
    #     raise HTTPException(status_code=400, detail=f"Error inserting employee: {str(e)}")







# @router.get("/all", response_model=list[UserDTO])
# async def get_users(selected_columns: list[str] = None, db: psycopg.Connection = Depends(get_db)):
#     selected_columns = selected_columns or ["numero_identificacao", "complete_name"]
#     columns_str = ", ".join(selected_columns)
#     query = f"SELECT {columns_str} FROM users"
#     try:
#         with db.cursor() as cursor:
#             cursor.execute(query)
#             rows = cursor.fetchall()
#         users = [UserDTO(**dict(zip(selected_columns, row))) for row in rows]
#         return users
#     except psycopg.Error as e:
#         raise HTTPException(status_code=400, detail=f"Error fetching users: {str(e)}")


# @router.put("/{user_id}", response_model=UserDTO)
# async def update_employee(user_id: str, user: UserCreate, db: psycopg.Connection = Depends(get_db)):
#     update_query = """UPDATE users SET complete_name = %s, date_nascimento = %s, date_admissao = %s,
#                       role = %s, telephone_number = %s, observation = %s WHERE numero_identificacao = %s"""
#     try:
#         with db.cursor() as cursor:
#             cursor.execute(update_query, (
#                 user.complete_name, user.date_nascimento, user.date_admissao, 
#                 user.role, user.telephone_number, user.observation, user_id))
#             # Commit is not needed here because the context manager automatically handles the transaction
#         return user
#     except psycopg.Error as e:
#         raise HTTPException(status_code=400, detail=f"Error updating employee: {str(e)}")


# @router.patch("/{user_id}", response_model=UserDTO)
# async def update_employee_status(user_id: str, status: bool, db: psycopg.Connection = Depends(get_db)):
#     status_str = "Ativo" if status else "Inativo"
#     update_query = "UPDATE users SET status = %s WHERE numero_identificacao = %s"
#     try:
#         with db.cursor() as cursor:
#             cursor.execute(update_query, (status_str, user_id))
#             # Commit is not needed here because the context manager automatically handles the transaction
#         return {"numero_identificacao": user_id, "status": status_str}
#     except psycopg.Error as e:
#         raise HTTPException(status_code=400, detail=f"Error updating employee status: {str(e)}")
