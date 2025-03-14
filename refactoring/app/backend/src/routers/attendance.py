import psycopg
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from src.models.attendance import  BaseAttendance, Attendance
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
        SELECT user_id, date, type, time
        FROM attendance
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
        with db.cursor() as cursor:
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No attendances found for this user.")
        
        return [BaseAttendance(**row) for row in rows]

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendances: {str(e)}")



@router.post("/")
def create_attendance(attendance: BaseAttendance, db: psycopg.Connection = Depends(get_db)) -> dict:
    """
    Create a new attendance record for a specific user.

    Args:
        user_id: The ID of the user.
        date: The date of the attendance.
        type: The type of attendance.
        time: The time of the attendance.
        db: Database connection object.

    Returns:
        A message indicating success or failure.
    """
    insert_query = """
        INSERT INTO attendance (user_id, date, type, time)
        VALUES (%s, %s, %s, %s)
    """

    try:
        with db.cursor() as cursor:
            cursor.execute(insert_query, (attendance.user_id, attendance.date, attendance.type, attendance.time))
        return {"message": "Attendance created."}

    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Error creating attendance: {str(e)}")



# @router.put("/{attendance_id}")
# def update_attendance(
#     user_id: int, 
#     attendance_id: int, 
#     date: date, 
#     type: str, 
#     time: time, 
#     db: psycopg.Connection  = Depends(get_db)
# ):
#     """
#     Modify an existing attendance record for a specific user.

#     Args:
#         user_id: The ID of the user.
#         attendance_id: The ID of the attendance to update.
#         date: The new date for the attendance.
#         type: The new type for the attendance.
#         time: The new time for the attendance.
#         db: Database connection object.

#     Returns:
#         A message indicating success or failure.
#     """
#     update_query = """
#         UPDATE attendance
#         SET date = %s, type = %s, time = %s
#         WHERE user_id = %s 
#         RETURNING date, type;
#     """

#     try:
#         with db.cursor() as cursor:
#             cursor.execute(update_query, (date, type, time, user_id, attendance_id))
#             row = cursor.fetchone()

#         if not row:
#             raise HTTPException(status_code=404, detail="Attendance not found")

#         return {"message": f"Attendance with ID {attendance_id} updated"}

#     except psycopg.Error as e:
#         raise HTTPException(status_code=500, detail=f"Error updating attendance: {str(e)}")


# @router.delete("/{attendance_id}")
# def delete_attendance(user_id: int, attendance_id: int, db: psycopg.Connection  = Depends(get_db)):
#     """
#     Delete an attendance record for a specific user.

#     Args:
#         user_id: The ID of the user.
#         attendance_id: The ID of the attendance to delete.
#         db: Database connection object.

#     Returns:
#         A message indicating success or failure.
#     """
#     delete_query = """
#         DELETE FROM attendance
#         WHERE user_id = %s AND id = %s
#         RETURNING id;
#     """

#     try:
#         with db.cursor() as cursor:
#             cursor.execute(delete_query, (user_id, attendance_id))
#             row = cursor.fetchone()

#         if not row:
#             raise HTTPException(status_code=404, detail="Attendance not found")

#         return {"message": f"Attendance with ID {attendance_id} deleted"}

#     except psycopg.Error as e:
#         raise HTTPException(status_code=500, detail=f"Error deleting attendance: {str(e)}")
