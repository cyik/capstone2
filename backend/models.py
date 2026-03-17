from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
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

class ClinicalRecord(Base):
    __tablename__ = "clinical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_username = Column(String, index=True)
    therapist_username = Column(String, index=True)
    date = Column(String)
    time = Column(String)
    data = Column(String) # JSON serialized SOAP notes and snapshots

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    severity = Column(String)
    status = Column(String)
    avatar = Column(String)
    lastActive = Column(String)
