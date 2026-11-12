# IntegrateIQ — Installation & Verification Guide

---

## 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.20.0)
- **Python**: 3.12+ (tested on Python 3.12.10 with `pip 25.0.1`)

---

## 2. Configuration (`.env`)
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```

Configure prospective keys (optional for offline contract mode, required for live calls):
```dotenv
INTEGRATEIQ_ENV=development
PORT=8000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# PayPal Sandbox API
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_registered_webhook_id

# Test Runner Configuration
TEST_TIMEOUT_SECONDS=15
MAX_OUTPUT_BYTES=65536
```

---

## 3. Starting the Application

### Terminal 1 — FastAPI Backend (Port 8000)
```powershell
$env:PYTHONPATH="."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2 — React Frontend (Port 3000)
```powershell
npm run dev
```

Visit the dashboard at: **http://localhost:3000**

---

## 4. Automated Testing Commands

### Run Full Backend Verification Suite
```powershell
python -m pytest backend/fixtures/webhook_receiver/tests/test_webhook_contract.py -v
```

### Run End-to-End API Integration Script
```powershell
$env:PYTHONPATH="."
python backend/tests/verify_endpoints.py
```

### Run Production Build Check
```powershell
npm run build
```
*(Confirms zero TypeScript type errors and successful Vite production bundling)*
