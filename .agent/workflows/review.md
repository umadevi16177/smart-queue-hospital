---
description: Code Quality & Security Audit
---

# /review — Staff Engineer Audit

Use this workflow to cross-verify the implementation against gstack standards.

## Checklist:
1. **Premium CSS**: Are we using vanilla CSS with glassmorphism? No inline styles or Tailwind (unless requested).
2. **Backend Integrity**: Does the code follow the FastAPI/SQLAlchemy patterns?
3. **Agentic reasoning**: Does every AI response provide a `reasoning` trace?
4. **Error Handling**: Are try/except blocks present and meaningful?
5. **Typescript**: Is the code strictly typed?

## Deliverable:
- A list of suggested improvements or a "LGTM (Looks Good To Me)" stamp.
