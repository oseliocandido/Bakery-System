UPDATE attendance
SET time = :time
WHERE user_id = :user_id 
AND date = :date
AND type = :type;