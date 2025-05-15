import psycopg
from typing import Any, Sequence
from psycopg import Cursor


class DictRowFactory:
    def __init__(self, cursor: Cursor[Any]):
        self.fields = [c.name for c in cursor.description]

    def __call__(self, values: Sequence[Any]) -> dict[str, Any]:
        return dict(zip(self.fields, values))


def get_db():
    try:
        conn = psycopg.connect(
        "postgresql://postgres:my_super_secret_password@postgres_dev/postgres",
        row_factory=DictRowFactory,
        autocommit=True
    )
        yield conn
    finally:
        conn.close()
