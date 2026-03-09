from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# We'll use SQLite by default as a fallback if PostgreSQL is not available
# This ensures the app runs even if the user hasn't set up a local Postgres server yet.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")

# If it's a postgres URL, we use the standard engine
# If it's sqlite, we ensure it's compatible
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
