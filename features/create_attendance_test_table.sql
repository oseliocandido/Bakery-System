-- Create the attendance_test table with a generated date column
CREATE TABLE IF NOT EXISTS attendance_test (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    datetime TIMESTAMP NOT NULL,
    date DATE GENERATED ALWAYS AS (DATE(datetime)) STORED,
    type TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(numero_identificacao),
    UNIQUE (user_id, type, date)
);
