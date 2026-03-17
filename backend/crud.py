from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import models, schemas
import bcrypt

def get_password_hash(password: str):
    # Hash a password for storage
    # Generates a salt and hashes the password
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    # Check if the plain password matches the stored hash
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_therapists(db: Session):
    return db.query(models.User).filter(models.User.role == "therapist").all()

def get_patients(db: Session):
    return db.query(models.User).filter(models.User.role == "patient").all()

def get_all_other_users(db: Session, username: str):
    return db.query(models.User).filter(models.User.username != username).all()

def create_direct_message(db: Session, msg: schemas.DirectMessageCreate):
    db_msg = models.DirectMessage(
        sender_username=msg.sender_username,
        receiver_username=msg.receiver_username,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_direct_messages(db: Session, user1: str, user2: str):
    return db.query(models.DirectMessage).filter(
        or_(
            and_(models.DirectMessage.sender_username == user1, models.DirectMessage.receiver_username == user2),
            and_(models.DirectMessage.sender_username == user2, models.DirectMessage.receiver_username == user1)
        )
    ).order_by(models.DirectMessage.timestamp.asc()).all()

def mark_messages_as_read(db: Session, sender_username: str, receiver_username: str):
    db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_username == sender_username,
        models.DirectMessage.receiver_username == receiver_username,
        models.DirectMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

def get_unread_count(db: Session, sender_username: str, receiver_username: str):
    return db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_username == sender_username,
        models.DirectMessage.receiver_username == receiver_username,
        models.DirectMessage.is_read == False
    ).count()

def get_last_message(db: Session, user1: str, user2: str):
    return db.query(models.DirectMessage).filter(
        or_(
            and_(models.DirectMessage.sender_username == user1, models.DirectMessage.receiver_username == user2),
            and_(models.DirectMessage.sender_username == user2, models.DirectMessage.receiver_username == user1)
        )
    ).order_by(models.DirectMessage.timestamp.desc()).first()

def create_aq10_record(db: Session, record: schemas.AQ10RecordCreate):
    db_record = models.AQ10Record(
        patient_username=record.patient_username,
        score=record.score,
        date=record.date
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_aq10_records(db: Session, username: str):
    return db.query(models.AQ10Record).filter(models.AQ10Record.patient_username == username).order_by(models.AQ10Record.id.asc()).all()

def create_clinical_record(db: Session, record: schemas.ClinicalRecordCreate):
    db_record = models.ClinicalRecord(
        patient_username=record.patient_username,
        therapist_username=record.therapist_username,
        date=record.date,
        time=record.time,
        data=record.data
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_clinical_records_by_patient(db: Session, patient_username: str):
    return db.query(models.ClinicalRecord).filter(models.ClinicalRecord.patient_username == patient_username).order_by(models.ClinicalRecord.id.desc()).all()

def delete_clinical_record(db: Session, record_id: int):
    db.query(models.ClinicalRecord).filter(models.ClinicalRecord.id == record_id).delete()
    db.commit()

def get_db_patients(db: Session):
    return db.query(models.Patient).all()

def create_db_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_db_patient(db: Session, patient_id: int, patient_update: schemas.PatientCreate):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        for key, value in patient_update.dict().items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_db_patient(db: Session, patient_id: int):
    db.query(models.Patient).filter(models.Patient.id == patient_id).delete()
    db.commit()
