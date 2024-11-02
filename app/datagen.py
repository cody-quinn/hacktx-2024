from sqlmodel import Session

from src.database import initialize_db, engine

def main():
  initialize_db()

  with Session(engine) as db:
    # Here in parkour civilization, no one chooses to jump for the beef
    db.commit()

if __name__ == "__main__":
  main()
