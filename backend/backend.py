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
    db_user = crud.get_user_by_username(db, username=req.username)
    if not db_user or db_user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"username": db_user.username, "role": db_user.role}

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