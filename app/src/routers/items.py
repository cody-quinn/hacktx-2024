from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Query
from pydantic import BaseModel
from sqlmodel import select, SQLModel, Field
from starlette.exceptions import HTTPException

from src.database import DbSessionDep

router = APIRouter(
  prefix="/items",
  tags=["items"],
  responses={404: {"description": "Not found"}},
)

class ItemBase(SQLModel):
  name: str
  price: float

class ItemRecord(ItemBase, table=True):
  id: int | None = Field(default=None, primary_key=True)
  secret_data: int

class Item(ItemBase):
  id: int

class ItemCreate(ItemBase):
  secret_data: int

class ItemUpdate(BaseModel):
  name: str | None = None
  price: float | None = None
  age: int | None = None
  secret_data: int | None = None

@router.get("/", response_model=list[Item])
async def get_all(
  db: DbSessionDep,
  offset: int = 0,
  limit: Annotated[int, Query(le=100)] = 50
) -> list[ItemRecord]:
  """
  Retrieve all items from the database
  """
  return list(db.exec(select(ItemRecord).offset(offset).limit(limit)))

@router.get("/{item_id}", response_model=Item)
async def get_one(db: DbSessionDep, item_id: int) -> ItemRecord:
  """
  Retrieve an item from the database using its ID
  """
  item = db.get_one(ItemRecord, item_id)
  if not item:
    raise HTTPException(status_code=404)
  return item

@router.post("/", response_model=Item)
async def insert(db: DbSessionDep, item: ItemCreate) -> ItemRecord:
  """
  Insert a new item into the database
  """
  db_item = ItemRecord.model_validate(item)
  db.add(db_item)
  db.commit()
  db.refresh(db_item)
  return db_item

@router.put("/{item_id}", response_model=Item)
async def update(db: DbSessionDep, item_id: int, item: ItemUpdate) -> ItemRecord:
  """
  Update an item in the database
  """
  # Get the current item
  db_item = db.get_one(ItemRecord, item_id)
  if not db_item:
    raise HTTPException(status_code=404)

  # Update the item
  db_item.sqlmodel_update(item.model_dump(exclude_none=True))
  db.add(db_item)
  db.commit()
  db.refresh(db_item)
  return db_item

@router.delete("/{item_id}")
async def delete(db: DbSessionDep, item_id: int):
  """
  Delete an item from the database using its ID
  """
  db_item = db.get_one(ItemRecord, item_id)
  if not db_item:
    raise HTTPException(status_code=404)
  db.delete(db_item)
  db.commit()
  return {"ok": True}
