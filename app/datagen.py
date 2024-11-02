from sqlmodel import Session

from src.database import initialize_db, engine
from src.routers.items import ItemRecord

def main():
  initialize_db()

  with Session(engine) as db:
    # Here in parkour civilization, no one chooses to jump for the beef
    db.add(ItemRecord(name="Raw Chicken", price=1.0, secret_data=2))
    db.add(ItemRecord(name="Raw Beef", price=1.5, secret_data=3))
    db.commit()

if __name__ == "__main__":
  main()
