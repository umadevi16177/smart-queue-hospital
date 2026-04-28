# Smart Queue – Team Onboarding & Demo Guide

*How to Operate and Confidently Demonstrate the Platform*

---

## 🚀 Step 1: Launch the System

Run:

```bash
./START.sh
```

Open:

* Ops Dashboard → http://localhost:3000
* Patient Portal → http://localhost:3000/patient

---

## 🧠 Demo Principle (IMPORTANT)

Before starting any demo, remember:

* The system is **staff-controlled**
* The system provides **suggestions, not decisions**
* Always emphasize:
  👉 “Staff can override at any time”

---

## 📝 Step 2: Patient Admission

**Goal:** Show how a patient enters the system.

1. Open **Ops Dashboard**
2. Fill:

   * Name: John Doe
   * Select tests (MRI, X-Ray)
3. Click **Finalize Clinical Admission**

### What to say:

> “The system registers the patient and places them in the queue with an estimated wait time.”

### What to show:

* Patient appears in queue
* Active Admissions count updates

---

## 🚨 Step 3: Manual Override (Critical Feature)

**Goal:** Show clinical control

1. Go to **Patient Census**
2. Click **BUMP** on a patient

### What to say:

> “Staff can immediately prioritize any patient based on clinical judgment.”

### What to show:

* Patient moves up
* Audit log updates

👉 Emphasize:
**“All changes are logged and traceable.”**

---

## 🛠 Step 4: System Stress Simulation

### A. Emergency Surge

1. Go to **Engine Settings**
2. Click **Simulate Emergency Surge**

### What to say:

> “The system updates the queue based on new high-priority arrivals. Staff can review and adjust as needed.”

---

### B. Equipment Downtime

1. Set MRI → Offline

### What to say:

> “When a resource is unavailable, the system flags affected patients so staff can manage flow efficiently.”

👉 Avoid saying:
❌ “System automatically fixes everything”

---

## 📊 Step 5: Performance Dashboard

1. Go to **Unit Performance**

### Show:

* Queue length
* Wait times
* Load per test

### What to say:

> “This helps identify bottlenecks and improve operational efficiency.”

👉 Avoid exact money claims unless asked.

---

## 📱 Step 6: Patient Experience

1. Open Patient Portal
2. Enter Patient ID

### Show:

* Queue status
* Estimated wait time

### What to say:

> “Patients can see their position and updates, reducing uncertainty.”

---

## ⚠️ Demo Do’s and Don’ts

### ✅ Do:

* Keep it simple
* Focus on workflow
* Highlight manual control
* Show audit logging

### ❌ Don’t:

* Say “AI makes decisions”
* Claim exact ROI without explanation
* Over-explain features not fully built

---

## 🎯 Demo Summary (Closing Line)

> “Smart Queue helps staff manage patient flow with full visibility, control, and auditability—while optionally providing insights to improve efficiency.”

---

## 🆘 If Something Breaks During Demo

* Refresh page
* Re-add test patient
* Restart server if needed

Stay calm and continue demo flow.
