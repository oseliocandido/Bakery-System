DELETE FROM attendance 
WHERE user_id = :user_id
AND date = :date
AND type = :type