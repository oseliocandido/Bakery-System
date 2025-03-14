import psycopg
from fastapi import APIRouter, HTTPException, Depends, Query


from src.models.users import BaseUser, User
from src.services.database import get_db


router = APIRouter(tags=['users'], prefix='/users')


@router.get("/")
def get_all_users(
    db: psycopg.Connection = Depends(get_db),
    status: str = Query(None, description="Filter users by status (optional, pass 'Ativo' or 'Inativo')")
) -> list[User]:
    """
    Fetch all users from the database, optionally filtered by status.

    Args:
        db: Database connection object.
        status: Optional query parameter to filter users by status. If not provided, returns all users.

    Returns:
        List of User objects.
    """
    query = "SELECT * FROM users"
    
    # If a status is provided, add a WHERE clause to filter by status
    if status:
        query += " WHERE status = %s"
    
    try:
        with db.cursor() as cursor:
            cursor.execute(query, (status,) if status else ())
            rows = cursor.fetchall()

        return [User(**row) for row in rows]

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/{id_number}")
def get_user(id_number: str, db: psycopg.Connection = Depends(get_db)) -> User:
    """
    Fetch a specific user by their ID number.

    Args:
        id_number: The ID number of the user to retrieve.
        db: Database connection object.

    Returns:
        The User object if found, raises 404 if not.
    """
    query = "SELECT * FROM users WHERE numero_identificacao = %s;"

    try:
        with db.cursor() as cursor:
            cursor.execute(query, (id_number,))
            row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**row)

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user with ID {id_number}: {str(e)}")


@router.post("/")
def create_user(user: BaseUser, db: psycopg.Connection = Depends(get_db)) -> dict:
    """
    Create a new user in the database.

    Args:
        user: The user data to insert.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    insert_query = """
        INSERT INTO users (numero_identificacao, complete_name, date_nascimento, 
                           date_admissao, role, telephone_number, observation, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING numero_identificacao, complete_name;
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(insert_query, (
                user.numero_identificacao, user.complete_name, user.date_nascimento,
                user.date_admissao, user.role, user.telephone_number,
                user.observation, user.status
            ))
            row = cursor.fetchone()

        return {"message": f"User {row['complete_name']} created."}

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error inserting user: {str(e)}")


@router.put("/{id_number}")
def update_user(id_number: int, user_update: BaseUser, db: psycopg.Connection = Depends(get_db)) -> dict:
    """
    Update an existing user's information.

    Args:
        id_number: The ID number of the user to update.
        user_update: The new user data to apply.
        db: Database connection object.

    Returns:
        A message indicating the updated user's information.
    """
    update_query = """
        UPDATE users
        SET complete_name = %s,
            date_nascimento = %s,
            date_admissao = %s,
            numero_identificacao = %s,
            role = %s,
            telephone_number = %s,
            observation = %s,
            status = %s
        WHERE numero_identificacao = %s
        RETURNING complete_name;
    """

    values = (
        user_update.complete_name, user_update.date_nascimento,
        user_update.date_admissao, user_update.numero_identificacao,
        user_update.role, user_update.telephone_number,
        user_update.observation, user_update.status,
        id_number
    )

    try:
        with db.cursor() as cursor:
            cursor.execute(update_query, values)
            row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"Information from user {row['complete_name']} has been updated."}

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")
