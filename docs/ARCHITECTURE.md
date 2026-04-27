# 🏰 System Architecture & Documentation

This project follows the **gstack** architectural patterns for AI-assisted high-velocity shipping.

## 1. Backend Service (The Brain)
- **Framework**: FastAPI (Python 3.9+)
- **ORM**: SQLAlchemy (SQLite for persistence)
- **Modular Engines**:
  - `RulesEngine`: Deterministic clinical protocols.
  - `RoutingEngine`: Real-time queue load balancer.
  - `AgentEngine`: Asynchronous AI reasoning.
- **API Strategy**: All state mutations (registration, completion, rerouting) must happen here.

## 2. Frontend Interface (The Eyes)
- **Framework**: Next.js (App Router)
- **Key Views**:
  - `Admin Dashboard`: Global view of all hospital diagnostic resources.
  - `Patient Portal`: Mobile-first conversational interface.
- **State Management**: Simple React hooks (`useState`/`useEffect`) synced with FastAPI endpoints.

## 3. UI Design System (The Aesthetic)
- **Styling**: Pure CSS3 for performance and maximum control.
- **Theme**: High-end Medical (Azure Blue/Cool White).
- **Core Components**:
  - `GlassCard`: Semi-transparent background for modern depth.
  - `StatusTag`: Semantic color coding (Normal: Green, Urgent: Amber, Emergency: Red).
  - `PulseLoader`: Visual feedback for AI reasoning steps.

## 4. GStack Protocols
- **Test-First**: Every backend change must pass matching tests in `backend/tests/`.
- **Reasoning Log**: AI responses must include a `reasoning` field for architectural audit.
