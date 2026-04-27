---
description: Browser-Based Functional Testing
---

# /qa — Playwright Browser Testing

Use this workflow to verify the UI and end-to-end functionality using a headless browser.

## Steps:
1. **Initialize Environment**:
   - Ensure the backend (`START.sh`) is running.
   - If Playwright is not installed, run `npm install --save-dev @playwright/test`.
2. **Execute Tests**:
   - Run existing tests: `npx playwright test`.
   - If no tests exist, generate a basic "Happy Path" test for the current feature.
3. **Visual Audit**:
   - Check for layout shifts or CSS regressions in the premium UI.
4. **Agent Logic Test**:
   - Verify the AI responses appear correctly in the Chat/Patient Portal UI.

## Deliverable:
- Test results summary.
