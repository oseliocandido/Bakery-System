SELECT 
    date, 
    type, 
    time
FROM attendance 
WHERE user_id = :user_id
AND type = :type 
AND date = :date