from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
    username: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None
    data: Optional[Any] = None

class AppointmentBase(BaseModel):
    patient_username: str
    therapist_username: str
    date: str
    start_time: str
    end_time: str
    status: str
    type: str

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: str

    class Config:
        from_attributes = True
