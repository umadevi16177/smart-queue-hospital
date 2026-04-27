from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True)
    name = Column(String)
    phone_number = Column(String)
    priority = Column(String, default="NORMAL") # NORMAL, URGENT, EMERGENCY
    requested_tests = Column(JSON) # List of test types
    current_status = Column(String, default="WAITING") # WAITING, IN_PROGRESS, COMPLETED
    current_test = Column(String, nullable=True)
    estimated_wait_time = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    rating = Column(Integer)
    comments = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
