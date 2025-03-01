import psycopg

# Dependency for getting a database connection and committing transactions
def get_db():
    with psycopg.connect("dbname=mydb user=myuser password=mypass", autocommit=True) as conn:
        yield conn
