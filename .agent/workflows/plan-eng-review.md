---
description: Technical Architecture & Data Flow (The Eng Lead Lens)
---

# /plan-eng-review — Engineering Architecture

Use this workflow to define the technical implementation plan, data schemas, and API contracts.

## Steps:
1. **Schema Definition**:
   - Update `prisma/schema.prisma` if needed.
   - Design FastAPI models in `backend/app/models.py`.
2. **API Contract**:
   - Define the endpoints, request/response bodies, and error codes.
   - Ensure the `reasoning` field is included in the response.
3. **Engine Logic**:
   - Identify which engine (`RulesEngine`, `RoutingEngine`, `AgentEngine`) the logic belongs to.
4. **UI Breakdown**:
   - List the Next.js components needed (`src/components/`).
   - Define the state management approach.

## Deliverable:
- A technical implementation plan with a "Reasoning Log" explaining the architectural choices.
