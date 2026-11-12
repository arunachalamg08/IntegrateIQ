# IntegrateIQ — 3-Minute Video Demo Script
**Track:** Developer Tools / Financial Services  
**Evaluation Criteria Targeted:** Technological Implementation, Design, Potential Impact, Innovation, Presentation

---

## Video Production Summary
- **Total Duration:** 3:00 (180 seconds)
- **Format:** Screen capture with split-view audio narration and webcam facecam in bottom-right corner.
- **Tone:** Technical, confident, concise, developer-centric.
- **Core Principle:** *"AI suggests. Developers approve. Independent tests decide."*

---

## Detailed Cue & Script Breakdown

### [0:00 - 0:25] The Problem & IntegrateIQ Introduction
**Visual:**
- Screen opens on the **IntegrateIQ Overview Dashboard** (`http://localhost:3000`).
- Clean, dark-mode terminal-inspired UI with live metric tiles: *Sessions Verified*, *Sandboxed Pytest Runs*, *Active Defect Resolution Rate*, and *PayPal Sandbox Connection Status*.
- Mouse hovers over the system motto banner: *"Patch-to-Proof Verification Workbench"*.

**Narration (Presenter):**
> "Every developer who has integrated PayPal knows this pain: payment webhooks fail silently, signatures mismatch, and raw byte buffers get altered during body parsing. When developers turn to general-purpose LLMs, they get unverified code snippets that can lead to catastrophic payment dropouts.
> 
> Welcome to **IntegrateIQ** — the first PayPal-focused debugging and verification workbench that connects real PayPal Sandbox telemetry with Google Gemini AI diagnosis, developer-governed patch review, and sandboxed, independent automated test verification."

---

### [0:25 - 0:55] Step 1 & 2: Real PayPal Telemetry (Connection Inspector & Error Analyzer)
**Visual:**
- Click sidebar **"PayPal Inspector"** (`/paypal-inspector`).
- Show the live OAuth token handshake panel (`POST https://api-m.sandbox.paypal.com/v1/oauth2/token`).
- Click **"Test Connection Handshake"**. The button pulses with a spinner, then displays:
  - `HTTP 200 OK`
  - Real round-trip latency counter (e.g., `482 ms`)
  - Sanitized Client ID (`Ab***4k`) and masked Bearer token preview.
- Navigate to **"PayPal Error Analyzer"** (`/error-analyzer`).
- Point to real recorded errors with exact PayPal `debug_id` headers (e.g., `PAYPAL_DEBUG_ID: 9ba37e1990f91`).
- Click **"Analyze with Gemini"** on a `VALIDATION_ERROR` or trigger a negative test simulation.
- Gemini returns a structured diagnostic breakdown with the exact offending field (`items[0].unit_amount.value`), root cause, and remediation steps.

**Narration (Presenter):**
> "IntegrateIQ eliminates guesswork by establishing direct, authentic connectivity to the PayPal Sandbox Developer Platform.
> 
> Our Connection Inspector executes an actual server-side OAuth2 handshake against `api-m.sandbox.paypal.com`, measuring authentic API latency without ever exposing credentials to the client.
> 
> In the Error Analyzer, real PayPal API errors and debug IDs are mapped and interpreted by Google Gemini, pinpointing schema violations and authentication mismatches before a single dollar moves."

---

### [0:55 - 1:40] Step 3 & 4: Controlled Failure Reproduction & Gemini AI Diagnosis
**Visual:**
- Click **"Scenario Catalogue"** (`/scenarios`) -> Select **"Webhook Signature Verification Failure (CRC32 Buffer Mutation)"** -> Click **"Start Live Debug Session"**.
- User lands in **"Debug Workspace"** (`/workspace/:id`).
- Click **"Reproduce Failure (Run Pytest)"**.
- Terminal component opens with live SSE streaming logs.
- FastAPI backend spawns an isolated `pytest` process running `test_webhook_contract.py` against the broken verifier fixture (`WH-STALE-OLD-001`).
- Terminal outputs red assertion failure:
  `FAILED: test_webhook_contract.py::test_webhook_valid_signature_accepted - AssertionError: Expected status 200, got 400`
- Exit Code `1` is recorded in SQLite.
- Click **"Request Gemini AI Diagnosis"**.
- Gemini `gemini-2.5-flash` analyzes the failure traceback, PayPal signature verification headers, and raw Python code.
- Structured output populates: Root Cause, Security Analysis (Stale Webhook ID + JSON byte deserialization altering CRC32), and recommended Remediation Action.

**Narration (Presenter):**
> "Let's see our flagship feature: **Patch-to-Proof Verification**.
> 
> Here we have a realistic PayPal webhook service failing in sandbox testing. Instead of guessing, we click 'Reproduce Failure'. IntegrateIQ launches an isolated Python subprocess running an automated contract test suite.
> 
> It captures the authentic exit code 1 and standard error.
> 
> Next, we pass this failure context directly to Google Gemini. Gemini detects that our service re-serialized the incoming JSON body, destroying the raw byte stream required to validate PayPal's CRC32 transmission signature, and was pointing to an expired Webhook ID."

---

### [1:40 - 2:20] Step 5: Human-in-the-Loop Patch Review & Isolated Verification
**Visual:**
- Click **"Patch Review & Approval"** (`/patches`).
- Interactive Git-style diff viewer displays:
  - Red removal: `webhook_id = "WH-STALE-OLD-001"` and `json.dumps(payload)`
  - Green addition: `webhook_id = "WH-9LA78291KL098234"` and `raw_body_bytes.decode('utf-8')`
- Safety & Risk assessment badge shows: `LOW RISK - Fixes signature calculation without modifying business logic`.
- Presenter clicks **"Approve & Apply Patch"**. Badge flips to `APPROVED (PENDING VERIFICATION)`.
- Click **"Run Independent Verification"** (`/verification`).
- Pytest executes in a disposable temporary directory holding the patched source code.
- Terminal scrolls live:
  ```
  collected 4 items
  test_webhook_contract.py::test_webhook_valid_signature_accepted PASSED [25%]
  test_webhook_contract.py::test_foreign_cert_url_rejected PASSED [50%]
  test_webhook_contract.py::test_raw_body_crc32_preserved PASSED [75%]
  test_webhook_contract.py::test_malformed_payload_rejected PASSED [100%]
  ================ 4 passed in 0.42s ================
  ```
- Verdict badge turns emerald green: **"VERIFIED PASS (EXIT CODE 0)"**.

**Narration (Presenter):**
> "Crucially, IntegrateIQ enforces human oversight: **AI suggests, but developers approve.**
> 
> The developer inspects the unified diff, reviews risk factors, and explicitly approves the patch.
> 
> Once approved, IntegrateIQ applies the modification to a separate sandboxed workspace and executes an independent verification test suite.
> 
> Notice: Gemini did not decide this passed. An actual Pytest subprocess executed the code, verified all 4 PayPal security assertions, and returned Exit Code 0. That is genuine proof."

---

### [2:20 - 3:00] Step 6: Evidence Reports & Closing Summary
**Visual:**
- Navigate to **"Evidence Reports"** (`/reports`).
- Click **"Generate Audit Evidence Report"**.
- View cryptographic SHA-256 hash, execution timeline, stdout logs, and PayPal Sandbox endpoint metadata.
- Click **"Download Standalone HTML Report"** — a beautifully styled, self-contained HTML audit document opens in a new tab.
- Switch back to the **Overview Dashboard** showing updated historical metrics and audit trails.

**Narration (Presenter):**
> "Finally, IntegrateIQ compiles an immutable, evidence-backed audit report complete with Pytest execution logs, patch diffs, and PayPal transmission headers. It exports to JSON or a standalone, auditable HTML report ready for engineering compliance and QA sign-off.
> 
> By bridging real PayPal Sandbox telemetry with Google Gemini intelligence and deterministic test automation, IntegrateIQ turns brittle payment integrations into verified, production-ready software.
> 
> Thank you!"

---

## Recording Checklist for Presenter
- [ ] Backend running on `http://127.0.0.1:8000` (FastAPI + SQLite).
- [ ] Frontend running on `http://localhost:3000` (Vite + React).
- [ ] Database contains seeded baseline sessions and error records.
- [ ] Browser zoom set to 100% or 110% on 1920x1080 display.
- [ ] Dark theme active across all browser tabs.
- [ ] Clear microphone audio with zero background noise.
- [ ] Timer running alongside screen to ensure timing hits exactly 3:00.
