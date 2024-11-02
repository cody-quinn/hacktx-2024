from typing import Annotated

from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session

sqlite_file_name = "database.sqlite"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def initialize_db():
  SQLModel.metadata.create_all(engine)

def get_db_session():
  with Session(engine) as session:
    yield session

DbSessionDep = Annotated[Session, Depends(get_db_session)]
