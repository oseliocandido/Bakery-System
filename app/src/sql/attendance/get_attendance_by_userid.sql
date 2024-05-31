SELECT 
        user_id, 
        date, 
        type, 
        time 
FROM attendance 
WHERE user_id = :user_id;