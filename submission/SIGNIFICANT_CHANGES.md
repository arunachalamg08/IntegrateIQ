# IntegrateIQ — Significant Changes Made During the Hackathon Period

---

## Chronological Upgrade Log

### Phase 1: Prototype Architecture Transition
- Replaced frontend-only mock state (`setTimeout` timers and in-memory arrays) with a production **FastAPI backend** running on Python 3.12.
- Implemented persistent **SQLite database** (`backend/integrateiq.db`) storing sessions, failure reproductions, diagnoses, patches, verification runs, evidence reports, and audit trails.
- Configured **Vite reverse proxy** to route `/api` and `/ws` seamlessly to port 8000.

### Phase 2: Isolated Subprocess Test Runner
- Built controlled webhook signature verification test fixture (`verifier.py`) with genuine defects (`WH-STALE-OLD-001` and body re-serialization mutating payload CRC32).
- Built 4-assertion Pytest test suite (`test_webhook_contract.py`).
- Implemented `TestRunnerService` using `subprocess.run(shell=False)` with temporary directory sandboxing and 15s timeout limits.

### Phase 3: Official SDK & API Integrations
- Integrated **Google Gen AI Python SDK** (`google-genai` 2.33.0) with configurable models (`gemini-2.5-flash` / `gemini-3.8-flash`). Added prompt structures passing actual failure traces and source code.
- Integrated **PayPal Sandbox REST API**: OAuth token exchange (`/v1/oauth2/token`) and webhook verification (`/v1/notifications/verify-webhook-signature`).

### Phase 4: Competitive Hackathon Features
- **PayPal Sandbox Connection Inspector Page (`/paypal-inspector`):** Real-time OAuth handshake latency probe, sanitized credential masking, and environment safety assertion.
- **PayPal API Error Analyzer Page (`/error-analyzer`):** Captured PayPal rejection codes with Debug ID lookup, negative testing simulators, and Gemini root-cause breakdown.
- **Live Webhook Receiver Endpoint (`/api/webhooks/paypal`):** Listener for genuine Sandbox events with delivery log and verification status.
- **Interactive Hackathon Guided Demonstration Tour:** Top-level banner guiding evaluators through the 6-step verification flow.
- **Evidence Reporting System:** Persistent reports with JSON and standalone dark-themed HTML export downloads.
