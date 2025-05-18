import psycopg
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime

from src.models.attendance import BaseAttendance, Attendance
from src.services.database import get_db


router = APIRouter(tags=['attendances'], prefix='/users/{id_number}/attendances')


@router.get("/")
def get_attendances(
    id_number: int,
    date: Optional[str] = Query(None, description="Filter by attendance date (YYYY-MM-DD)"),
    type: Optional[str] = Query(None, description="Filter by attendance type (e.g., check-in, check-out)"),
    db: psycopg.Connection = Depends(get_db),
) -> list[BaseAttendance]:
    """
    Get attendances for a specific user, optionally filtered by date and type.

    Args:
        id_number: The ID of the user.
        date: (Optional) The date of attendance (YYYY-MM-DD).
        type: (Optional) The type of attendance (e.g., "check-in", "check-out").
        db: Database connection object.

    Returns:
        A list of attendance records for the user.
    """
    query = """
        SELECT id, user_id, datetime, type
        FROM attendance_test
        WHERE user_id = %s
    """
    params = [id_number]

    if date:
        query += " AND date = %s"
        params.append(date)

    if type:
        query += " AND type = %s"
        params.append(type)

    try:
        with db.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No attendances found for this user.")
        
        return [BaseAttendance(**row) for row in rows]

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendances: {str(e)}")


@router.get("/by-period")
def get_attendances_by_period(
    id_number: int,
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: psycopg.Connection = Depends(get_db),
) -> list[BaseAttendance]:
    """
    Get attendances for a specific user within a date range.

    Args:
        id_number: The ID of the user.
        start_date: The start date of the period (YYYY-MM-DD).
        end_date: The end date of the period (YYYY-MM-DD).
        db: Database connection object.

    Returns:
        A list of attendance records for the user within the specified period.
    """
    query = """
        SELECT id, user_id, datetime, type
        FROM attendance_test
        WHERE user_id = %s
        AND date BETWEEN %s AND %s
    """
    
    try:
        with db.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            cursor.execute(query, (id_number, start_date, end_date))
            rows = cursor.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No attendances found for this user within the specified period.")
        
        return [BaseAttendance(**row) for row in rows]

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendances by period: {str(e)}")


@router.post("/")
def create_attendance(
    id_number: int,
    attendance: BaseAttendance,
    db: psycopg.Connection = Depends(get_db)
) -> dict:
    """
    Create a new attendance record for a specific user.

    Args:
        id_number: The ID of the user.
        attendance: The attendance data.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    if attendance.user_id != id_number:
        raise HTTPException(status_code=400, detail="User ID in path must match user ID in request body")
        
    insert_query = """
        INSERT INTO attendance_test (user_id, datetime, type)
        VALUES (%s, %s, %s)
        RETURNING id
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(insert_query, (
                attendance.user_id, 
                attendance.datetime, 
                attendance.type
            ))
            attendance_id = cursor.fetchone()[0]
        db.commit()
        return {"message": "Attendance created successfully", "id": attendance_id}

    except psycopg.errors.UniqueViolation:
        db.rollback()
        raise HTTPException(status_code=409, detail="Attendance already exists for this user, type, and date")
    except psycopg.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating attendance: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    #FIX THIS: Add a check to see if the user exists in the database before creating an attendance record

@router.put("/{attendance_id}")
def update_attendance(
    id_number: int,
    attendance_id: int,
    attendance: BaseAttendance,
    db: psycopg.Connection = Depends(get_db)
) -> dict:
    """
    Modify an existing attendance record for a specific user.

    Args:
        id_number: The ID of the user.
        attendance_id: The ID of the attendance to update.
        attendance: The updated attendance data.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    if attendance.user_id != id_number:
        raise HTTPException(status_code=400, detail="User ID in path must match user ID in request body")
        
    update_query = """
        UPDATE attendance_test
        SET datetime = %s, type = %s
        WHERE id = %s AND user_id = %s
        RETURNING id
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(update_query, (
                attendance.datetime, 
                attendance.type, 
                attendance_id, 
                id_number
            ))
            row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Attendance not found or does not belong to this user")

        db.commit()
        return {"message": f"Attendance with ID {attendance_id} updated successfully"}

    except psycopg.errors.UniqueViolation:
        db.rollback()
        raise HTTPException(status_code=409, detail="Another attendance already exists with the same user, type, and date")
    except psycopg.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating attendance: {str(e)}")


@router.put("/{attendance_id}")
def update_attendance(
    id_number: int,
    attendance_id: int,
    attendance: BaseAttendance,
    db: psycopg.Connection = Depends(get_db)
) -> dict:
    """
    Modify an existing attendance record for a specific user.

    Args:
        id_number: The ID of the user.
        attendance_id: The ID of the attendance to update.
        attendance: The updated attendance data.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    if attendance.user_id != id_number:
        raise HTTPException(status_code=400, detail="User ID in path must match user ID in request body")
        
    update_query = """
        UPDATE attendance_test
        SET datetime = %s, type = %s
        WHERE id = %s AND user_id = %s
        RETURNING id
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(update_query, (
                attendance.datetime, 
                attendance.type, 
                attendance_id, 
                id_number
            ))
            row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Attendance not found or does not belong to this user")

        db.commit()
        return {"message": f"Attendance with ID {attendance_id} updated successfully"}

    except psycopg.errors.UniqueViolation:
        db.rollback()
        raise HTTPException(status_code=409, detail="Another attendance already exists with the same user, type, and date")
    except psycopg.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating attendance: {str(e)}")


@router.delete("/{attendance_id}")
def delete_attendance(
    id_number: int,
    attendance_id: int,
    db: psycopg.Connection = Depends(get_db)
) -> dict:
    """
    Delete an attendance record for a specific user.

    Args:
        id_number: The ID of the user.
        attendance_id: The ID of the attendance to delete.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    delete_query = """
        DELETE FROM attendance_test
        WHERE id = %s AND user_id = %s
        RETURNING id
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(delete_query, (attendance_id, id_number))
            row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Attendance not found or does not belong to this user")

        db.commit()
        return {"message": f"Attendance with ID {attendance_id} deleted successfully"}

    except psycopg.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting attendance: {str(e)}")
