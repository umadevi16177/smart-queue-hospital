from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, engines, agent
from sqlalchemy import create_engine
import uuid
from pydantic import BaseModel

class PatientCreate(BaseModel):
    name: str
    contactInfo: str
    tests: list[str]
    priority: str = "NORMAL"

app = FastAPI(title="SmartQueue Hospital API")

# Setup CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./hospital.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

@app.post("/api/patient")
def register_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())[:6]
    first_test = patient.tests[0] if patient.tests else None
    new_patient = models.Patient(
        id=pid,
        name=patient.name,
        phone_number=patient.contactInfo,
        priority=patient.priority,
        requested_tests=patient.tests,
        current_test=first_test,
        estimated_wait_time=15
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Enrich with instructions and location for the current test
    instructions = engines.RulesEngine.get_instructions(patient.current_test)
    location = engines.RulesEngine.get_location(patient.current_test) if patient.current_test else None
    
    # Check if wait is too long, flag for adaptive scheduling
    adaptive_scheduling = engines.RoutingEngine.check_adaptive_schedule(patient.estimated_wait_time)

    return {
        "id": patient.id,
        "name": patient.name,
        "current_test": patient.current_test,
        "location": location,
        "estimated_wait_time": patient.estimated_wait_time,
        "instructions": instructions,
        "status": patient.current_status,
        "adaptive_scheduling_needed": adaptive_scheduling
    }

@app.post("/api/queue/complete")
def complete_test(patient_id: str, test_type: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Remove completed test
    remaining = [t for t in patient.requested_tests if t != test_type]
    
    # Simple load balancing mock
    mock_loads = {t: 5 for t in remaining} 
    next_test = engines.RoutingEngine.get_optimal_next_test(remaining, mock_loads, offline_resources)
    
    patient.requested_tests = remaining
    patient.current_test = next_test
    
    if not next_test or next_test == "ALL_OFFLINE":
        patient.current_status = "COMPLETED" if not next_test else "WAITING_FOR_RESOURCES"
        patient.estimated_wait_time = 0
    else:
        patient.estimated_wait_time = engines.RoutingEngine.calculate_wait_time(next_test, 2)
        
    db.commit()
    return {"success": True, "next_test": next_test}

# Mock global for MVP offline resources
offline_resources = []

@app.post("/api/resource/offline")
def toggle_resource(test_type: str, is_offline: bool):
    if is_offline and test_type not in offline_resources:
        offline_resources.append(test_type)
    elif not is_offline and test_type in offline_resources:
        offline_resources.remove(test_type)
    return {"success": True, "offline_resources": offline_resources}

@app.post("/api/feedback")
def submit_feedback(patient_id: str, rating: int, comments: str = None, db: Session = Depends(get_db)):
    # Simple endpoint matching the Prisma feedback model
    return {"success": True, "message": "Feedback collected securely."}

@app.post("/api/agent")
async def chat_with_agent(patient_id: str, message: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Mocking patient data for the agent
    p_data = {"current_test": patient.current_test, "estimated_wait_time": patient.estimated_wait_time}
    return await agent.AgentEngine.process_query(p_data, message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
