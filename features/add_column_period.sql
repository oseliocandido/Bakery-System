BEGIN TRANSACTION;

-- Add the new column
ALTER TABLE balance ADD COLUMN period TEXT;

-- Update existing records
UPDATE balance SET period = "Tarde" WHERE period IS NULL;

-- Create the new table with the desired structure and constraints
CREATE TABLE balance_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    period INTEGER,
    card_value REAL,
    pix_value REAL,
    money_value REAL,
    observation TEXT,
    UNIQUE (date, period)
);

-- Copy data from the old table to the new table
INSERT INTO balance_new (id, user_id, date, period, card_value, pix_value, money_value, observation)
SELECT id, user_id, date, period, card_value, pix_value, money_value, observation FROM balance;

-- Drop the old table
DROP TABLE balance;

-- Rename the new table to the original table name
ALTER TABLE balance_new RENAME TO balance;

COMMIT;
