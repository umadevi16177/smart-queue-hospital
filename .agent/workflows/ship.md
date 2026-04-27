---
description: Release Management & Git Shipping
---

# /ship — Release & Close

Use this workflow to finalize the feature and commit the changes.

## Steps:
1. **Documentation Update**:
   - Update `ARCHITECTURE.md` or `DESIGN.md` if the system changed.
   - Summarize the changes in the project's changelog (if exists).
2. **Commit Changes**:
   - Stage all relevant files.
   - Use an atomic commit message following the gstack style: `[Feature/Fix] <Component>: <Description>`.
3. **Artifact Cleanup**:
   - Remove any temporary scratch files or logs.
4. **Push**:
   - `git push origin main` (after user approval).

## Deliverable:
- Final confirmation of shipping.
