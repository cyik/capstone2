#cd backend > uvicorn backend:app --reload --host 127.0.0.1 --port 8000
#cd frontend > npm instalL > npm run dev

#Preset Accounts: 
#Username: therapist    Password: root       Role: Therapist
#Username: patient      Password: root       Role: Patient
#Username: testing      Password: testing123       Role: Patient

import crud, models, schemas
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from typing import Optional
from datetime import timedelta

from hash import verify_password
from auth_token import create_access_token

load_dotenv()

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
    # Get user from database
    db_user = crud.get_user_by_username(db, username=req.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username ")
    
    # Verify password using hash
    if not verify_password(req.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create JWT token
    token_data = {"sub": db_user.username, "role": db_user.role, "id": db_user.id}
    access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=60))
    
    # Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role
    }

@app.get("/api/appointments/{username}")
def read_appointments(username: str, role: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_appointments_by_username(db, username=username, role=role)

import datetime

@app.post("/api/chat", response_model=schemas.ChatResponse)
def chat_endpoint(chat: schemas.ChatMessage, db: Session = Depends(get_db)):
    user_message = chat.message.lower()
    
    # 1. Hardcoded Appointment Booking Intercept
    # If the user clicks a doctor card, the frontend sends a highly specific message "I want to book an appointment with..."
    # We intercept this to guarantee the DB record is created reliably, bypassing the LLM.
    if "book" in user_message and "dr." in user_message:
        therapist_name = chat.message.split('book')[-1].strip()
        # Find therapist by name (username)
        therapists = crud.get_therapists(db)
        selected_therapist = next((t for t in therapists if t.username.lower() in therapist_name.lower() or therapist_name.lower() in t.username.lower()), None)
        
        if selected_therapist and chat.username:
            # Create appointment
            appt_data = schemas.AppointmentCreate(
                patient_username=chat.username,
                therapist_username=selected_therapist.username,
                date=datetime.date.today().isoformat(),
                start_time="10:00",
                end_time="11:00",
                status="confirmed",
                type="video"
            )
            crud.create_appointment(db, appt_data)
            return schemas.ChatResponse(response=f"Okay, I have scheduled your appointment with {selected_therapist.username}. They are looking forward to seeing you.")
        else:
            return schemas.ChatResponse(response=f"Okay, I noted that you want an appointment with {therapist_name}, but I couldn't finalize it. Please ask your guardian to confirm.")

    # 2. Hardcoded Assessment Quiz Eval Intercept
    if "quiz_results:" in user_message:
        if "severe" in user_message or "yes" in user_message: # Mock logic looking for high symptom burden
            therapists = crud.get_therapists(db)
            db_doctors = [
                {"id": str(t.id), "name": f"Dr. {t.username.capitalize()}", "specialty": "Autism Specialist", "availability": "Today, 2:00 PM"}
                for t in therapists
            ]
            return schemas.ChatResponse(
                response="Thank you for sharing that with me. It sounds like you are feeling very overwhelmed today. I highly recommend speaking with a specialist who can help. Here are some doctors available to talk with you:",
                action="show_doctors",
                data=db_doctors
            )
        else:
            return schemas.ChatResponse(response="Thank you for taking the time to answer those questions. Remember to take deep breaths and rest if you need to. I am here if you want to keep chatting.")

    # 3. Dynamic LLM Response (Gemini)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        # Fallback to dummy data if API key hasn't been configured by the user yet
        return schemas.ChatResponse(response="To enable the smart AI, please put a valid Google Gemini API key into the backend/.env file!")

    try:
        client = genai.Client(api_key=api_key)
        
        system_instruction = (
            "You are a supportive, literal, and calming AI assistant for autistic patients. "
            "Keep your sentences relatively short and very clear. Avoid sarcasm or idioms. "
            "\nYou have access to two special UI actions if the user needs them:"
            "\n1. If the user expresses extreme sadness, overwhelm, or feeling 'bad', set action='start_quiz' and provide exactly 3 simple yes/no questions in the data array about sensory overload or exhaustion (e.g. {'id':'q1', 'text':'Are noises too loud?'})."
            "\n2. If the user explicitly asks to speak to a doctor or make an appointment, set action='show_doctors'. Leave 'data' null (we will inject the doctors list on the server)."
            "\nOtherwise, set action=None and data=None and just provide a supportive text response."
        )

        # Force Gemini to return exactly the JSON shape our frontend React code expects
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat.message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=schemas.ChatResponse,
            ),
        )

        # The response.text is guaranteed to be a JSON string matching our schema
        import json
        llm_response_dict = json.loads(response.text)
        chat_resp = schemas.ChatResponse(**llm_response_dict)

        # 4. Inject Real Doctors if LLM decided it was time
        if chat_resp.action == "show_doctors":
            therapists = crud.get_therapists(db)
            db_doctors = [
                {"id": str(t.id), "name": f"Dr. {t.username.capitalize()}", "specialty": "Autism Specialist", "availability": "Today, 2:00 PM"}
                for t in therapists
            ]
            chat_resp.data = db_doctors

        return chat_resp

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return schemas.ChatResponse(response="I'm having a little trouble thinking of what to say right now. Let's take a deep breath together.")

@app.get("/api/contacts/{username}")
def get_contacts(username: str, role: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users = crud.get_all_other_users(db, username=username)

    contacts = []
    for u in users:
        unread = crud.get_unread_count(db, sender_username=u.username, receiver_username=username)
        last_msg = crud.get_last_message(db, username, u.username)
        contacts.append({
            "username": u.username, 
            "role": u.role,
            "unread_count": unread,
            "last_message": last_msg.content if last_msg else None,
            "last_timestamp": last_msg.timestamp if last_msg else None
        })
        
    return contacts

@app.post("/api/messages/read")
def mark_read(req: dict, db: Session = Depends(get_db)):
    sender = req.get("sender_username")
    receiver = req.get("receiver_username")
    if not sender or not receiver:
        raise HTTPException(status_code=400, detail="Missing usernames")
    crud.mark_messages_as_read(db, sender, receiver)
    return {"status": "ok"}

@app.post("/api/messages", response_model=schemas.DirectMessage)
def send_message(msg: schemas.DirectMessageCreate, db: Session = Depends(get_db)):
    # Verify both users exist
    sender = crud.get_user_by_username(db, username=msg.sender_username)
    receiver = crud.get_user_by_username(db, username=msg.receiver_username)
    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="Sender or receiver not found")

    return crud.create_direct_message(db, msg)

@app.get("/api/messages/{user1}/{user2}", response_model=list[schemas.DirectMessage])
def read_messages(user1: str, user2: str, reader: Optional[str] = None, db: Session = Depends(get_db)):
    if reader:
        # Mark messages sent from the other person as read by the reader
        other_person = user2 if reader == user1 else user1
        crud.mark_messages_as_read(db, sender_username=other_person, receiver_username=reader)
    return crud.get_direct_messages(db, user1, user2)

@app.post("/api/aq10", response_model=schemas.AQ10Record)
def submit_aq10(record: schemas.AQ10RecordCreate, db: Session = Depends(get_db)):
    return crud.create_aq10_record(db, record)

import ml
@app.get("/api/aq10/{username}")
def get_aq10_history(username: str, db: Session = Depends(get_db)):
    records = crud.get_aq10_records(db, username)
    
    history = [{"date": r.date, "score": r.score} for r in records]
    
    prediction = None
    if len(records) >= 30:
        scores = [r.score for r in records]
        prediction = ml.train_and_predict(scores)
        
    return {
        "history": history,
        "prediction": prediction,
        "needs_attention": prediction is not None and prediction > 6
    }