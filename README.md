# IntegrateIQ — AI-Assisted PayPal Integration Debugging & Verification Platform

> **"From Integration Failure to Verified Fix — Before Deployment"**  
> *Core Principle: AI suggests, tests decide.*

IntegrateIQ is a full-stack developer platform designed to investigate PayPal integration failures, generate root-cause diagnoses, review proposed unified diff patches, execute automated test suites in isolated sandboxes, and inspect evidence-backed verification reports before production deployment.

---

## Architecture Overview

```
+-----------------------------------------------------------+
|               Frontend (Port 3000)                        |
|  - React 18, TypeScript, Tailwind CSS, Lucide Icons       |
|  - Real-time SSE / WebSocket event consumer               |
|  - Dynamic KPI dashboard querying SQLite via REST         |
+-----------------------------+-----------------------------+
                              | Reverse Proxy (/api, /ws)
                              v
+-----------------------------------------------------------+
|               Backend API (Port 8000)                     |
|  - FastAPI (Python 3.12) & SQLite (integrateiq.db)        |
|  - Server-Sent Events (SSE) & WebSocket Broadcaster       |
+--------------+-------------------+------------------------+
               |                   |
      +--------v-------+   +-------v--------+
      |  Google Gen AI |   | PayPal Sandbox |
      |  (Gemini API)  |   | (REST v1 / v2) |
      +----------------+   +----------------+
               |
      +--------v--------------------------------------------+
      |             Subprocess Test Runner                  |
      |  - Restricted isolated temp directory sandbox       |
      |  - Pytest 9.1 runner subprocess execution (no shell)|
      |  - Captures genuine exit codes, stdout, assertions  |
      +-----------------------------------------------------+
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (v24.20.0 recommended)
- **Python**: 3.12+ with `pip`

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configuration variables:
```dotenv
INTEGRATEIQ_ENV=development
PORT=8000

# Google Gemini API (Official Google Gen AI Python SDK)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# PayPal Developer Sandbox (REST API)
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# Test Runner Subprocess Policies
TEST_TIMEOUT_SECONDS=15
MAX_OUTPUT_BYTES=65536
```

> **Note:** The system is fully operational in **Offline Contract Testing Mode** even without external API credentials. When `GEMINI_API_KEY` or `PAYPAL_CLIENT_ID` are omitted, IntegrateIQ executes actual Pytest test suites against isolated fixtures and uses a deterministic ruleset, honestly displaying `CONFIGURATION_REQUIRED` rather than fabricating connection states.

---

### 3. Start Backend & Frontend

#### Terminal 1 — FastAPI Backend (Port 8000)
```powershell
$env:PYTHONPATH="."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 — React Frontend (Port 3000)
```powershell
npm run dev
```

Visit the application at: **http://localhost:3000**

---

## Automated Workflow: "AI Suggests, Tests Decide"

1. **New Debug Session:** Create a session from the Scenario Catalogue (e.g. *Webhook Signature Verification Failure*).
2. **Failure Reproduction:** Click **Reproduce Failure**. The backend spins up an isolated temporary directory, runs Pytest against the unpatched fixture, and captures genuine failure traces (Exit Code 1).
3. **AI Diagnosis & Patch Proposal:** Click **Generate Diagnosis**. The backend invokes the Google Gemini API (or the deterministic rule engine if unconfigured) passing the actual failure log and source code, returning a structured root-cause analysis and unified diff patch.
4. **Patch Review & Approval:** Inspect the diff in the **Patch Review & Approval** screen. The developer approves or rejects the patch.
5. **Independent Automated Verification:** Click **Run Verification**. The backend applies the approved patch to an isolated working copy and runs the full Pytest suite. If all assertions pass with 0 regressions, it issues a **PASS** verdict (Exit Code 0).
6. **Evidence Report & Remediation:** The platform persists the evidence report in SQLite and enables downloading standalone **JSON** and **HTML** reports.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend engine health probe |
| `GET` | `/api/config/status` | Live connection health for Gemini & PayPal Sandbox |
| `GET` | `/api/dashboard/summary` | Real-time aggregated KPIs from SQLite |
| `GET` | `/api/scenarios` | Catalogue of debug scenarios |
| `POST` | `/api/sessions` | Create new debug session |
| `GET` | `/api/sessions` | List all sessions |
| `POST` | `/api/sessions/{id}/reproduce` | Subprocess Pytest failure reproduction |
| `POST` | `/api/sessions/{id}/diagnose` | Real Gemini API failure diagnosis |
| `POST` | `/api/patches/{id}/approve` | Approve proposed patch |
| `POST` | `/api/sessions/{id}/verify` | Subprocess Pytest verification runner |
| `GET` | `/api/reports` | List persistent evidence reports |
| `GET` | `/api/reports/{id}/export` | Download report as JSON or styled HTML |
| `PATCH` | `/api/remediation-actions/{id}` | Update remediation action status |
| `GET` | `/api/events` | Server-Sent Events (SSE) real-time stream |
