from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Annotated
import datetime
from datetime import date, time
from enum import Enum

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

class AppointmentStatus(str, Enum):
    pending = "Pending"
    accepted = "Accepted"
    rejected = "Rejected"
    cancelled = "Cancelled"

class AppointmentBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    status: AppointmentStatus = AppointmentStatus.pending

class AppointmentCreate(AppointmentBase):
    initiator_id: int
    target_id: int
    initiator_role: str  # "patient" or "therapist"
    target_role: str     # "patient" or "therapist"

class Appointment(AppointmentBase):
    id: int
    initiator_id: int
    target_id: int
    initiator_role: str
    target_role: str

    class Config:
        from_attributes = True

class DirectMessageBase(BaseModel):
    sender_username: str
    receiver_username: str
    content: str

class DirectMessageCreate(DirectMessageBase):
    pass

class DirectMessage(DirectMessageBase):
    id: int
    is_read: bool
    timestamp: str

    class Config:
        from_attributes = True

class AQ10RecordBase(BaseModel):
    patient_username: str
    score: int
    date: str

class AQ10RecordCreate(AQ10RecordBase):
    pass

class AQ10Record(AQ10RecordBase):
    id: int

    class Config:
        from_attributes = True
