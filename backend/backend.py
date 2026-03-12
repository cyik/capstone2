# IMPORTANT BROOOOO: Run backend: CD backend > uvicorn backend:app --reload --host 127.0.01 --port 8000
# READ HEREEEEEEEEEEE: Run frontend: CD frontend > npm run dev

#Add FAQ , logs for patients 
#Use Case Diagram / Architecture Diagram / Test Case / Activity Diagram
# AI Chatbot for answering 

import crud, models, schemas
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)


@app.post("/login")
def login(req: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=req.username)
    if not db_user or db_user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"username": db_user.username, "role": db_user.role}