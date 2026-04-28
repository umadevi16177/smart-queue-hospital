from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, engines, agent
from sqlalchemy import create_engine
import uuid
import datetime
from pydantic import BaseModel

class PatientCreate(BaseModel):
    name: str
    contactInfo: str
    tests: list[str]
    priority: str = "NORMAL"

class ChatRequest(BaseModel):
    patient_id: str
    message: str

app = FastAPI(title="Smart Queue Hospital API")

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

@app.get("/api/queue")
def get_queue(db: Session = Depends(get_db)):
    patients = db.query(models.Patient).all()
    
    # Calculate queue positions per test type
    positions = {} # {test_type: [patient_ids_sorted_by_time]}
    active_patients = [p for p in patients if p.current_status != "COMPLETED"]
    
    for p in active_patients:
        if p.current_test:
            if p.current_test not in positions:
                positions[p.current_test] = []
            positions[p.current_test].append(p)
            
    # Sort each list by priority then by created_at
    priority_map = {"EMERGENCY": 0, "URGENT": 1, "NORMAL": 2}
    for test in positions:
        positions[test].sort(key=lambda x: (priority_map.get(x.priority, 2), x.created_at))

    # Serialize to match frontend mapping
    result = []
    for p in patients:
        queue_pos = None
        if p.current_test and p.current_status != "COMPLETED":
            try:
                # Find index in the sorted list for that test
                test_list = positions.get(p.current_test, [])
                queue_pos = next(i for i, x in enumerate(test_list) if x.id == p.id) + 1
            except StopIteration:
                queue_pos = None

        result.append({
            "id": p.id,
            "name": p.name,
            "requested_tests": p.requested_tests,
            "current_test": p.current_test,
            "status": p.current_status,
            "priority": p.priority,
            "estimated_wait_time": p.estimated_wait_time,
            "queue_position": queue_pos
        })
    return result

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
        "requested_tests": patient.requested_tests,
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

# AI Reasoning Logs for the Command Center HUD
ai_logs = [
    "System initialized. Optimizing 5 clinical pathways.",
    "Resource Audit: MRI Suite 1 performance optimal at 98%."
]

def add_log(msg: str):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    ai_logs.insert(0, f"[{timestamp}] {msg}")
    if len(ai_logs) > 10: ai_logs.pop()

@app.post("/api/patient/reroute")
def reroute_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # 1. EMERGENCY BUMP
    patient.priority = "EMERGENCY"
    patient.estimated_wait_time = 2 
    
    # 2. SYSTEM-WIDE RECALCULATION
    others = db.query(models.Patient).filter(models.Patient.id != patient_id).all()
    for other in others:
        other.estimated_wait_time += 15 
    
    add_log(f"CRITICAL OVERRIDE: {patient.name} bumped to EMERGENCY. Ripple applied to {len(others)} patients.")
    db.commit()
    return {"success": True}

@app.get("/api/logs")
def get_logs():
    return ai_logs

@app.post("/api/simulate/surge")
def simulate_surge(db: Session = Depends(get_db)):
    """Simulates a sudden influx of 5 emergency cases to test neural load balancing."""
    surge_names = ["Emergency Alpha", "Emergency Beta", "Critical Gamma", "Trauma Delta", "Cardiac Epsilon"]
    for name in surge_names:
        p_id = str(uuid.uuid4())
        new_p = models.Patient(
            id=p_id,
            name=f"🚨 {name}",
            phone_number="911-EMERGENCY",
            priority="EMERGENCY",
            requested_tests=["CT_SCAN", "MRI"],
            current_status="WAITING",
            estimated_wait_time=5
        )
        db.add(new_p)
    add_log(f"NEURAL STRESS TEST TRIGGERED: 5 high-acuity arrivals detected. Re-optimizing hospital throughput.")
    db.commit()
    return {"success": True}

@app.post("/api/feedback")
def submit_feedback(patient_id: str, rating: int, comments: str = None, db: Session = Depends(get_db)):
    feedback = models.Feedback(patient_id=patient_id, rating=rating, comments=comments)
    db.add(feedback)
    add_log(f"Patient Satisfaction Update: Received {rating}/5 stars from Session #{patient_id[:6]}")
    db.commit()
    return {"success": True}

@app.post("/api/agent")
async def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Enriching patient data for the agent to ensure high-quality reasoning
    p_data = {
        "current_test": patient.current_test, 
        "estimated_wait_time": patient.estimated_wait_time,
        "status": patient.current_status,
        "name": patient.name
    }
    print(f"AGENT_DEBUG: Processing query for {patient.name} | Status: {patient.current_status}")
    return await agent.AgentEngine.process_query(p_data, request.message)

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Optional: Only mount static files if we are in production mode and directory exists
    frontend_path = os.path.join(os.path.dirname(__file__), "../../out")
    if os.path.exists(frontend_path):
        from fastapi.staticfiles import StaticFiles
        app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
