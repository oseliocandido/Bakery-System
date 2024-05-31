from pathlib import Path

def read_sql_query(sql_path: Path) -> str:
    """Method to return sql query as str"""
    return Path(sql_path).read_text()
