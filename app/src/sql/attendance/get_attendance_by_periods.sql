SELECT 
    user_id, 
    date, 
    type, 
    time 
FROM attendance 
WHERE date BETWEEN :start_date AND :end_date 