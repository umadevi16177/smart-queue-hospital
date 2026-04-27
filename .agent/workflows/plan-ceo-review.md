---
description: Scope & Product-Market Fit Review (The CEO Lens)
---

# /plan-ceo-review — Scope & Business Logic

Use this workflow to ensure the proposed change is aligned with hospital business goals and doesn't introduce unnecessary complexity.

## Steps:
1. **Analyze Requirements**: Read the brain-dump/notes from `/office-hours`.
2. **Review Resource Impact**:
   - Does this require new database tables? (Check `prisma/schema.prisma`).
   - Does this require external API integrations?
3. **Draft the "Press Release" snippet**: Write a 2-sentence summary of how this feature will be explainable to a hospital administrator.
4. **Finalize Scope**: Explicitly list what is IN-SCOPE and what is OUT-OF-SCOPE for this iteration.

## Deliverable:
- A brief markdown summary for the user to approve before technical planning begins.
