# IntegrateIQ — System Architecture & Data Flow

---

## 1. System Architecture Diagram

```
+─────────────────────────────────────────────────────────────+
│                   Frontend (Port 3000)                      │
│  - React 18, TypeScript, Tailwind CSS, Lucide Icons         │
│  - Real-time Server-Sent Events (SSE) & WebSocket listener   │
│  - Interactive Hackathon Guided Demonstration Tour          │
+──────────────────────────────┬──────────────────────────────+
                               │ Reverse Proxy (/api, /ws)
                               ▼
+─────────────────────────────────────────────────────────────+
│                   Backend API (Port 8000)                   │
│  - FastAPI (Python 3.12) & SQLite (backend/integrateiq.db)  │
│  - Lifespan DB initialization & Pydantic validation         │
│  - Server-Sent Events (SSE) Broadcaster                     │
+──────────────┬───────────────────────────────┬──────────────+
               │                               │
      +────────▼─────────+           +─────────▼─────────+
      │  Google Gen AI   │           │  PayPal Sandbox   │
      │ (Gemini 2.5/3.8) │           │   REST API v1/v2  │
      +──────────────────+           +───────────────────+
               │                               │
               ▼                               ▼
+─────────────────────────────────────────────────────────────+
│               Subprocess Isolated Test Runner               │
│  - Disposable temp directories (tempfile.mkdtemp)           │
│  - Subprocess execution: pytest -v --tb=short (no shell)    │
│  - 15s execution timeout & 64KB output buffer truncation    │
│  - Captures genuine stdout, stderr, and exit codes          │
+─────────────────────────────────────────────────────────────+
```

---

## 2. Directory Structure

```
IntegrateIQ-Prototype/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py              # Health and connection status
│   │   │   ├── dashboard.py           # Real SQLite aggregated KPIs
│   │   │   ├── scenarios.py           # Scenario definitions
│   │   │   ├── sessions.py            # Reproduce, diagnose, verify endpoints
│   │   │   ├── patches.py             # Patch review and approval
│   │   │   ├── verifications.py       # Verification results
│   │   │   ├── reports.py             # Evidence reports & HTML/JSON export
│   │   │   ├── events.py              # SSE and WebSocket streams
│   │   │   ├── paypal_inspector.py    # Sandbox OAuth latency & connection inspector
│   │   │   ├── error_analyzer.py      # PayPal error codes & negative test runner
│   │   │   └── webhooks.py            # Live Sandbox webhook receiver & deliveries
│   │   ├── models/schemas.py          # Pydantic schemas
│   │   ├── services/
│   │   │   ├── gemini_service.py      # Official Google Gen AI SDK integration
│   │   │   ├── paypal_service.py      # PayPal Sandbox REST client
│   │   │   ├── test_runner_service.py # Isolated Pytest subprocess runner
│   │   │   ├── report_service.py      # HTML/JSON evidence generator
│   │   │   └── event_service.py       # Real-time event broadcaster
│   │   ├── config.py                  # pydantic-settings & .env loader
│   │   ├── database.py                # SQLite schema and baseline seeds
│   │   └── main.py                    # FastAPI application entrypoint
│   ├── fixtures/
│   │   └── webhook_receiver/          # Target under test & pytest contracts
│   └── integrateiq.db                 # Persistent SQLite database
├── src/                               # React 18 + Vite frontend
├── docs/                              # Audit & benchmark documentation
└── submission/                        # Hackathon submission package
```
