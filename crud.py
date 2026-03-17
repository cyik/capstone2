from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import models, schemas
from hash import hash_password
from models import Appointment, User

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    # Hash the password here before saving
    hashed_pw = hash_password(user.password)
    
    db_user = models.User(
        username=user.username, 
        password=hashed_pw, 
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Create appointment
def create_appointment(
    db: Session,
    initiator_id: int,
    target_id: int,
    initiator_role: str,
    target_role: str,
    date,
    start_time,
    end_time,
    status: str
):
    """
    Create an appointment where initiator and target roles are dynamic.
    """
    db_appointment = Appointment(
        initiator_id=initiator_id,
        target_id=target_id,
        initiator_role=initiator_role,
        target_role=target_role,
        date=date,
        start_time=start_time,
        end_time=end_time,
        status=status
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointments_by_username(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return []
    
    return db.query(Appointment).filter(
        (Appointment.initiator_id == user.id)
    ).all()


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
