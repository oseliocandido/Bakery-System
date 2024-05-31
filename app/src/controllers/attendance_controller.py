import sqlite3
from models.attendance import Attendance
from utils.logs import log_function_calls
from sql.sql_reader import read_sql_query
from utils.logger import logger
import os
import streamlit as st

class AttendanceController:
    def __init__(self, db_path):
        self.db_path = db_path


    @log_function_calls
    def create_attendance(self, user_id, date, type , time):
        placeholder = {"user_id":user_id, "date":date, "type":type, "time":time}
        raw_sql = read_sql_query("sql/attendance/create_attendance.sql")
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(raw_sql, placeholder)
            return True
        except sqlite3.IntegrityError as e:
            logger.error(f"Register Attendance Twice or More - Employee ID={user_id}, Date={date}, Type={type} -> {str(e)}")
            return e
        except sqlite3.Error as e:
            logger.error(f"Register Attendance - Employee ID={user_id}, Date={date}, Type={type} -> {str(e)}")
            return e
        

    def get_attendance_by_type_and_date(self, user_id, date, type):
        placeholder = {"user_id":user_id, "date":date, "type":type}
        raw_sql = read_sql_query("sql/attendance/get_attendance_by_type_and_date.sql")
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(raw_sql, placeholder)
                row = cursor.fetchone()
                cursor.close()
            return None if row is None else Attendance(user_id, row[0], row[1], row[2])
        except sqlite3.Error as e:
            logger.error(f"Get Attendance by Type-date: Employee ID={user_id}, Date={date}, Type={type}-> {str(e)}")
            return e
        

    @log_function_calls
    def modify_attendance(self, user_id, date, time, type):
        placeholder = {"user_id":user_id, "date":date, "type":type, "time":time}
        raw_sql = read_sql_query("sql/attendance/modify_attendance.sql")
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(raw_sql, placeholder)
            return True
        except sqlite3.Error as e:
            logger.error(f"Modify Attendance - Employee ID={user_id}, Date={date}, Type={type} -> {str(e)}")
            return None
   

    def get_attendance_by_periods(self, start_date, end_date):
        placeholder = {"start_date":start_date, "end_date":end_date}
        raw_sql = read_sql_query("sql/attendance/get_attendance_by_periods.sql")
        attendances = []
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(raw_sql, placeholder)
                rows = cursor.fetchall()
                cursor.close()
            for row in rows:
                user_id, date, type, time = row
                attendance = Attendance(user_id, date, type, time)
                attendances.append(attendance)
            return attendances
        except sqlite3.Error as e:
            logger.error(f"Get Attendances by StartDate={start_date}, EndDate={end_date} -> {str(e)}")
            return None
        
    
    @log_function_calls
    def delete_attendance(self, user_id, date, type):
        placeholder = {"user_id":user_id , "date":date, "type":type}
        raw_sql = read_sql_query("sql/attendance/delete_attendance.sql")
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(raw_sql, placeholder)
            return True
        except sqlite3.Error as e:
            logger.error(f"Delete Attendance - Employee ID={user_id}, Date={date}, Type={type} -> {str(e)}")
            return None
