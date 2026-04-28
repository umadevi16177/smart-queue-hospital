# Smart Queue: Clinical Validation & UAT Guide
*Grounded Operational Walkthrough for Hospital Leadership*

This guide walks through the system's core capabilities from a clinical operations and compliance perspective.

---

## 🔍 Validation Path 1: Diagnostic Admission & Triage
**Objective:** Verify that the system accurately captures patient identity and priority levels at the point of entry.

*   **Action:** Admit a test patient via the **Diagnostic Admission** portal.
*   **Checkpoint:** Observe how the **Unit Performance Ribbon** updates the "Active Admissions" metric in real-time.
*   **Operational Detail:** The system does not just "add a row"; it initializes a unique clinical roadmap based on the diagnostic suites requested.

---

## 🛠 Validation Path 2: Resource Resilience & Downtime
**Objective:** Verify system behavior when specialized equipment (e.g., MRI) goes offline.

*   **Action:** Navigate to **Engine Settings**. Simulate an "MRI Maintenance Alert".
*   **Checkpoint:** Return to the **Ops Dashboard**.
*   **Observed Behavior:** The system automatically re-sequences the Global Census. Patients awaiting MRI are moved to "Buffer" status, preventing bottlenecks at the MRI suite while redirecting staff to other units.
*   **Compliance:** All rerouting decisions are logged in the **Clinical Decision Audit Log**.

---

## ⚖️ Validation Path 3: Manual Clinical Overrides
**Objective:** Ensure staff always maintain ultimate clinical authority over the AI engine.

*   **Action:** Locate a "Normal" priority patient in the **Patient Census**.
*   **Action:** Click the **BUMP** (Manual Override) button.
*   **Checkpoint:** The patient is moved up in the sequence manually. 
*   **Observed Behavior:** The Audit Log records: *"Manual Override by Dr. Smith (Admin) - Patient Sequence Adjusted"*.

---

## 📊 Validation Path 4: Unit Performance ROI
**Objective:** Quantify the operational impact of the Smart Queue engine.

*   **Action:** Navigate to **Unit Performance**.
*   **Metric:** Review the **"Unit Cost Efficiency"** reclaimed today.
*   **Grounded Logic:** This calculation reflects staff-hour reclamation and equipment idle-time reduction, allowing for informed hospital budget planning.

---

## 🔒 Security & Accountability
*   **Authenticated Context:** All actions are performed under a specific Staff ID (default: Dr. Smith).
*   **Audit Trail:** Every patient move is traceable in the database for 7 years (Compliance Grade).
*   **Data Integrity:** Secure local network connection prevents external data leaks.

---

## 🛡️ Validation Path 5: Conflict Resolution & Clinical Safety
**Objective:** Ensure safe, deterministic behavior under conflicting high-acuity inputs.

*   **Action:** Mark two existing patients as **EMERGENCY** simultaneously.
*   **Checkpoint:** Verify the system maintains a stable ordering based on arrival time (FCFS within priority tier).
*   **Observed Behavior:** 
    *   System preserves order of the two emergency arrivals without "jitter" or sequence cycling.
    *   **Clinical Decision Audit Log** records both priority escalations independently.
    *   Engine prevents automatic overrides of manual priority settings without further staff confirmation.

---

**[ACCESS OPS DASHBOARD](http://localhost:3000)**
*(Internal Clinical Network Access Required)*
