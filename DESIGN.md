# DESIGN.md — SmartQueue AI

## 1. Product Vision
To eliminate the "waiting room" by creating a real-time, AI-managed flow for diagnostic tests.

## 2. User Personas
- **Patient**: Receives a "Live Link" with a chat concierge.
- **Nurse/Admin**: Views a global "Load Balancer" board.
- **Architect**: Oversees a scalable FastAPI + Next.js stack.

## 3. Data Architecture (gstack Reference)
- **FastAPI (Python)**: Handles the "Brain." Pydantic models for validation.
- **Next.js**: Handles the "Eyes." Server Components for speed, Client Components for the chat.
- **Reasoning Loop**: 
  - `Input`: Patient Query -> `Context`: Current Queue Loads -> `Action`: Reroute or Inform.

## 4. Technical Guardrails (GStack Review)
- **Backend-as-Truth**: Wait times and test sequences are never calculated on the client.
- **Atomic Commits**: Every change is backed by a verified test.

## 5. UI/UX Principles
- **Vibrant & Calm**: Blue/Teal palette.
- **Glassmorphism**: Modern, premium feel for the dashboard cards.
- **Micro-Animations**: Pulse effects on "Active" tests.

## 6. Success Metrics
- Average wait time reduction (Target: 20%).
- Patient Satisfaction (NPS).
- Resource Utilization (MRI/X-Ray idle time).
