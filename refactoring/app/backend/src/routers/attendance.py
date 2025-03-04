from fastapi import APIRouter, HTTPException, Depends
# from app.models.users import UserCreate, UserResponse, UserDTO
# from app.services.database import get_db
# import psycopg

router = APIRouter()

# @router.post("/", response_model=UserResponse)
# async def insert_employee(user: UserCreate, db: psycopg.Connection = Depends(get_db)):
#     insert_query = """INSERT INTO users (numero_identificacao, complete_name, 
#                             date_nascimento, date_admissao, role, telephone_number, observation) 
#                             VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING numero_identificacao"""
#     try:
#         with db.cursor() as cursor:
#             cursor.execute(insert_query, (
#                 user.numero_identificacao, user.complete_name, user.date_nascimento, 
#                 user.date_admissao, user.role, user.telephone_number, user.observation))
#             # Commit is not needed here because the context manager automatically handles the transaction
#             row = cursor.fetchone()
#         return UserResponse(numero_identificacao=row[0], complete_name=user.complete_name)
#     except psycopg.Error as e:
#         raise HTTPException(status_code=400, detail=f"Error inserting employee: {str(e)}")


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
