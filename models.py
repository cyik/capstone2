from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Time
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # Will store 'patient' or 'therapist'

from datetime import datetime
class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_username = Column(String, index=True)
    receiver_username = Column(String, index=True)
    content = Column(String)
    is_read = Column(Boolean, default=False)
    timestamp = Column(String, default=lambda: datetime.utcnow().isoformat() + "Z")

class AQ10Record(Base):
    __tablename__ = "aq10_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_username = Column(String, index=True)
    date = Column(String, index=True) # YYYY-MM-DD
    score = Column(Integer)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)  # Appointment ID
    initiator_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ID of the user who initiates the appointment
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)     # ID of the user who is the target of the appointment
    initiator_role = Column(String, nullable=False)  # Role of the initiator (e.g., patient or therapist)
    target_role = Column(String, nullable=False)     # Role of the target (e.g., patient or therapist)
    status = Column(String, nullable=False, default="Pending")  # Appointment status: Pending, Accepted, Rejected, or Cancelled
    date = Column(Date, nullable=False)  # Date of the appointment (YYYY-MM-DD)
    start_time = Column(Time, nullable=False)  # Start Time of the appointment (HH:MM)
    end_time = Column(Time, nullable=False)  # End Time of the appointment (HH:MM)