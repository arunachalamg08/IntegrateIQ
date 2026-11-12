import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any
from backend.app.config import settings

DB_PATH = Path(settings.DATABASE_PATH)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds initial baseline data if empty."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        scenario_name TEXT NOT NULL,
        sample_app TEXT NOT NULL,
        status TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        created_at TEXT NOT NULL,
        reproduction_status TEXT NOT NULL,
        reproduction_json TEXT,
        diagnosis_status TEXT NOT NULL,
        diagnosis_json TEXT,
        patch_id TEXT,
        patch_json TEXT,
        patch_review_status TEXT NOT NULL,
        verification_mode TEXT NOT NULL,
        verification_status TEXT NOT NULL,
        verification_progress INTEGER DEFAULT 0,
        verification_run_json TEXT,
        report_id TEXT,
        report_json TEXT,
        test_cases_json TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        scenario_name TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        description TEXT NOT NULL,
        error_category TEXT NOT NULL,
        error_message TEXT NOT NULL,
        affected_component TEXT NOT NULL,
        affected_file TEXT NOT NULL,
        affected_function TEXT NOT NULL,
        observed_evidence TEXT NOT NULL,
        confirmed_cause TEXT,
        ai_hypothesis TEXT NOT NULL,
        ai_confidence_label TEXT NOT NULL,
        missing_evidence TEXT,
        execution_mode TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        patch_id TEXT,
        patch_sha256 TEXT,
        baseline_results_json TEXT,
        after_fix_results_json TEXT,
        failed_tests_json TEXT,
        new_regressions_json TEXT,
        exact_failure_messages_json TEXT,
        relevant_logs_json TEXT,
        exit_code INTEGER,
        what_was_attempted TEXT,
        what_executed TEXT,
        what_did_not_execute TEXT,
        why_inconclusive_reason TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS remediation_actions (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        source_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        developer_notes TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports (id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        event_type TEXT NOT NULL,
        details_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        delivery_timestamp TEXT NOT NULL,
        verification_status TEXT NOT NULL,
        source_type TEXT NOT NULL,
        transmission_headers_json TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        error_details TEXT,
        latency_ms INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS paypal_api_errors (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        http_status INTEGER NOT NULL,
        paypal_error_name TEXT NOT NULL,
        message TEXT NOT NULL,
        debug_id TEXT,
        details_json TEXT,
        raw_response_json TEXT,
        ai_analysis_json TEXT,
        environment TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()

    # Seed initial baseline data if sessions table is empty
    cursor.execute("SELECT COUNT(*) FROM sessions")
    session_count = cursor.fetchone()[0]
    if session_count == 0:
        seed_baseline_data(conn)

    # Seed initial webhook deliveries if empty
    cursor.execute("SELECT COUNT(*) FROM webhook_deliveries")
    if cursor.fetchone()[0] == 0:
        seed_webhook_deliveries(conn)

    # Seed initial PayPal API errors if empty
    cursor.execute("SELECT COUNT(*) FROM paypal_api_errors")
    if cursor.fetchone()[0] == 0:
        seed_paypal_api_errors(conn)

    conn.close()

def seed_baseline_data(conn):
    """Seeds database with initial data matching frontend baseline."""
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    # Seed 3 initial sessions
    sessions_data = [
        {
            "id": "SES-1042",
            "scenario_id": "wh-signature",
            "scenario_name": "Webhook Signature Verification Failure",
            "sample_app": "PayPal Webhook Receiver — Node.js & Express",
            "status": "VERIFICATION_COMPLETED",
            "last_updated": "2 hours ago",
            "created_at": "2026-10-18T07:12:00Z",
            "reproduction_status": "REPRODUCED",
            "reproduction_json": json.dumps({
                "eventId": "WH-EVENT-1042",
                "eventType": "PAYMENT.CAPTURE.COMPLETED",
                "simulatedStatus": 400,
                "simulatedError": "Webhook signature verification failed.",
                "headers": {
                    "PAYPAL-TRANSMISSION-ID": "c1a403d0-a032-11ef-93a1-792187b92041",
                    "PAYPAL-AUTH-ALGO": "SHA256withRSA"
                },
                "payloadJson": "{}",
                "expectedBehavior": "Webhook listener verifies signature against PayPal cert URL, returning HTTP 200 OK.",
                "observedDemoBehavior": "Returned HTTP 400 Bad Request because incoming transmission signature did not match local hash."
            }),
            "diagnosis_status": "DIAGNOSED",
            "diagnosis_json": json.dumps({
                "probableRootCause": "The configured webhook ID does not match the webhook ID associated with the verification setup.",
                "supportingEvidence": "Sample config contained mismatched identifier WH-STALE-OLD-001 vs registered WH-9LA78291KL098234.",
                "fileReferences": [{"file": "src/services/paypalWebhookVerifier.js", "line": 24, "snippet": "const expectedWebhookId = ..."}],
                "confidenceLabel": "High Confidence (94.2%)",
                "confidencePercentage": 94.2,
                "alternativeHypotheses": ["Request body was parsed by bodyParser.json() before signature verification."],
                "recommendedNextStep": "Update the webhook ID in the configuration to match the registered listener."
            }),
            "patch_id": "PATCH-PP-SIG-001",
            "patch_json": json.dumps({
                "id": "PATCH-PP-SIG-001",
                "filePath": "src/services/paypalWebhookVerifier.js",
                "fileRevision": "rev-a8f9021",
                "explanation": "Synchronizes the WEBHOOK_ID environment fallback with the active PayPal sandbox webhook registration.",
                "riskAssessment": "Low Risk",
                "riskDetails": "Preserves all existing routing.",
                "securityImplications": "Prevents webhook replay and spoofing.",
                "potentialRegressions": "Downstream handlers must continue to access parsed req.body.",
                "linesAdded": 8,
                "linesRemoved": 4,
                "diffLines": [
                    {"type": "unchanged", "lineNumOriginal": 21, "lineNumProposed": 21, "content": "export async function verifyPayPalWebhookSignature(req) {"},
                    {"type": "deletion", "lineNumOriginal": 24, "content": "  const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WH-STALE-OLD-001';"},
                    {"type": "addition", "lineNumProposed": 24, "content": "  const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WH-9LA78291KL098234';"}
                ],
                "originalCodeSnippet": "const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WH-STALE-OLD-001';",
                "proposedCodeSnippet": "const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WH-9LA78291KL098234';"
            }),
            "patch_review_status": "APPROVED",
            "verification_mode": "LOCAL_FIXTURE",
            "verification_status": "PASS",
            "verification_progress": 100,
            "verification_run_json": json.dumps({
                "id": "VRUN-1042",
                "sessionId": "SES-1042",
                "patchId": "PATCH-PP-SIG-001",
                "mode": "LOCAL_FIXTURE",
                "status": "PASS",
                "timestamp": "2026-10-18T07:15:30Z",
                "testResults": [],
                "passedCount": 4,
                "failedCount": 0,
                "totalCount": 4,
                "executionDisclaimer": "OFFLINE CONTRACT TEST — DETERMINISTIC PYTEST RUNNER"
            }),
            "report_id": "REP-PASS-1042",
            "report_json": json.dumps({
                "id": "REP-PASS-1042",
                "sessionId": "SES-1042",
                "scenarioId": "wh-signature",
                "scenarioName": "Webhook Signature Verification Failure",
                "createdAt": "2026-10-18T07:16:00Z",
                "finalStatus": "PASS",
                "verificationLevel": "Deterministic Contract Fixture",
                "sandboxVerification": "Simulated local verification",
                "productionVerification": "Not attempted",
                "actualTestsExecuted": True,
                "realPaymentProcessed": False,
                "originalFailureSummary": "HTTP 400 Bad Request — CRC32 checksum mismatch on incoming webhook payload.",
                "probableRootCause": "Mismatched webhook ID and raw body mutation by body-parser.",
                "patchSummary": "Synchronized fallback webhook ID and used unmutated rawBuffer.",
                "baselineSummary": {"passed": 2, "failed": 2, "total": 4},
                "afterFixSummary": {"passed": 4, "failed": 0, "total": 4},
                "regressionChecks": [{"checkName": "Server stability", "status": "pass", "description": "No unhandled rejections"}],
                "limitations": ["Verified against local offline cryptographic fixture."],
                "evidence": {
                    "sessionId": "SES-1042",
                    "sourceRevision": "rev-a8f9021",
                    "patchSha256Placeholder": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "testSuiteIdentifier": "tests/test_webhook_contract.py",
                    "testRunTimestampPlaceholder": "2026-10-18T07:15:30Z",
                    "individualTestResultsCount": 4,
                    "exitCodePlaceholder": 0,
                    "verificationEnvironment": "Pytest 9.1 / Python 3.12",
                    "integrityNotice": "Deterministic test suite executed via subprocess."
                }
            }),
            "test_cases_json": json.dumps([
                {
                    "id": "tc-wh-01",
                    "name": "Correct configuration & valid signature accepted",
                    "category": "Positive Tests",
                    "baselineResult": "fail",
                    "afterFixResult": "pass",
                    "durationMs": 42,
                    "description": "Verify genuine PayPal webhook event with valid CRC32 and SHA256 transmission signature.",
                    "observedOutput": "Signature validated successfully against PayPal public certificate."
                },
                {
                    "id": "tc-wh-02",
                    "name": "Incorrect webhook ID rejected with security event",
                    "category": "Negative Tests",
                    "baselineResult": "fail",
                    "afterFixResult": "pass",
                    "durationMs": 38,
                    "description": "Ensure events signed with foreign or malformed webhook IDs are rejected gracefully.",
                    "observedOutput": "Rejected with HTTP 401 Unauthorized."
                },
                {
                    "id": "tc-wh-03",
                    "name": "Raw request body preserved without JSON re-serialization",
                    "category": "Configuration Tests",
                    "baselineResult": "pass",
                    "afterFixResult": "pass",
                    "durationMs": 25,
                    "description": "Confirm raw Buffer payload is preserved across middleware before JSON parsing.",
                    "observedOutput": "Raw Buffer preserved."
                },
                {
                    "id": "tc-wh-04",
                    "name": "Verification error handled safely without server crash",
                    "category": "Regression Tests",
                    "baselineResult": "pass",
                    "afterFixResult": "pass",
                    "durationMs": 19,
                    "description": "Confirm corrupted headers do not trigger uncaught exception or crash the process.",
                    "observedOutput": "Handled without process failure."
                }
            ])
        },
        {
            "id": "SES-1043",
            "scenario_id": "idempotency-retry",
            "scenario_name": "Request Idempotency and Retry Failure",
            "sample_app": "PayPal Payment Capture — Node.js & Axios",
            "status": "PATCH_READY",
            "last_updated": "5 hours ago",
            "created_at": "2026-10-18T04:30:00Z",
            "reproduction_status": "REPRODUCED",
            "reproduction_json": json.dumps({
                "eventId": "CAPTURE-REQ-88912",
                "eventType": "PAYMENT.CAPTURE.RETRY",
                "simulatedStatus": 422,
                "simulatedError": "DUPLICATE_REQUEST_ID",
                "headers": {"PayPal-Request-Id": "new-uuid-on-each-retry"},
                "payloadJson": "{}",
                "expectedBehavior": "Preserve deterministic request idempotency key across network retries.",
                "observedDemoBehavior": "Generated a new UUID upon 504 Gateway Timeout retry, violating PayPal idempotency rules."
            }),
            "diagnosis_status": "DIAGNOSED",
            "diagnosis_json": json.dumps({
                "probableRootCause": "Payment capture client re-instantiated UUID v4 on retry loop.",
                "supportingEvidence": "Line 42 of paymentCaptureClient.js called crypto.randomUUID() within the axios retry interceptor.",
                "fileReferences": [{"file": "src/services/paymentCaptureClient.js", "line": 42, "snippet": "const reqId = crypto.randomUUID();"}],
                "confidenceLabel": "High Confidence (91.0%)",
                "confidencePercentage": 91.0,
                "alternativeHypotheses": ["Retry interceptor re-invoked pre-request middleware hook."],
                "recommendedNextStep": "Scope the idempotency key to the order intent and reuse across retry attempts."
            }),
            "patch_id": "PATCH-IDEM-002",
            "patch_json": json.dumps({
                "id": "PATCH-IDEM-002",
                "filePath": "src/services/paymentCaptureClient.js",
                "fileRevision": "rev-c918b2",
                "explanation": "Caches the initial idempotency UUID per payment attempt and passes existing key to retry requests.",
                "riskAssessment": "Medium Risk",
                "riskDetails": "Requires memory cleanup of idempotency map after 24 hours.",
                "securityImplications": "Prevents double-charging customers during transient network drops.",
                "potentialRegressions": "Distinct checkout sessions must never share the same cart identifier.",
                "linesAdded": 12,
                "linesRemoved": 3,
                "diffLines": [
                    {"type": "deletion", "lineNumOriginal": 42, "content": "  const reqId = crypto.randomUUID();"},
                    {"type": "addition", "lineNumProposed": 42, "content": "  const reqId = intent.idempotencyKey || crypto.randomUUID();"},
                    {"type": "addition", "lineNumProposed": 43, "content": "  intent.idempotencyKey = reqId;"}
                ],
                "originalCodeSnippet": "const reqId = crypto.randomUUID();",
                "proposedCodeSnippet": "const reqId = intent.idempotencyKey || crypto.randomUUID();"
            }),
            "patch_review_status": "PENDING",
            "verification_mode": "LOCAL_FIXTURE",
            "verification_status": "NOT_RUN",
            "verification_progress": 0,
            "verification_run_json": None,
            "report_id": None,
            "report_json": None,
            "test_cases_json": json.dumps([
                {
                    "id": "tc-id-01",
                    "name": "Unique PayPal-Request-Id generated per new checkout intent",
                    "category": "Positive Tests",
                    "baselineResult": "pass",
                    "afterFixResult": "pending",
                    "durationMs": 31,
                    "description": "Verify distinct transactions receive distinct UUIDv4 idempotency keys.",
                    "observedOutput": "Unique UUID generated per checkout intent."
                },
                {
                    "id": "tc-id-02",
                    "name": "Deterministic key reuse during 504 Gateway Timeout retry",
                    "category": "Regression Tests",
                    "baselineResult": "fail",
                    "afterFixResult": "pending",
                    "durationMs": 65,
                    "description": "Verify retrying a timed-out capture request preserves original request ID.",
                    "observedOutput": "Baseline: New UUID generated on retry #1."
                }
            ])
        },
        {
            "id": "SES-1044",
            "scenario_id": "env-mismatch",
            "scenario_name": "Sandbox and Production Configuration Mismatch",
            "sample_app": "PayPal Environment Resolver — Python",
            "status": "FAILURE_REPRODUCED",
            "last_updated": "Yesterday",
            "created_at": "2026-10-17T14:15:00Z",
            "reproduction_status": "REPRODUCED",
            "reproduction_json": json.dumps({
                "eventId": "OAUTH-AUTH-001",
                "eventType": "OAUTH.CLIENT_CREDENTIALS",
                "simulatedStatus": 401,
                "simulatedError": "invalid_client",
                "headers": {"Authorization": "Basic [REDACTED]"},
                "payloadJson": "grant_type=client_credentials",
                "expectedBehavior": "Resolve host to api-m.sandbox.paypal.com in development.",
                "observedDemoBehavior": "Client attempted to contact https://api-m.paypal.com (live production) with sandbox credentials."
            }),
            "diagnosis_status": "NOT_DIAGNOSED",
            "diagnosis_json": None,
            "patch_id": None,
            "patch_json": None,
            "patch_review_status": "PENDING",
            "verification_mode": "LOCAL_FIXTURE",
            "verification_status": "NOT_RUN",
            "verification_progress": 0,
            "verification_run_json": None,
            "report_id": None,
            "report_json": None,
            "test_cases_json": json.dumps([
                {
                    "id": "tc-env-01",
                    "name": "Resolves to api-m.sandbox.paypal.com when NODE_ENV is development",
                    "category": "Positive Tests",
                    "baselineResult": "fail",
                    "afterFixResult": "pending",
                    "durationMs": 20,
                    "description": "Verify endpoint resolution helper returns sandbox URL for non-production environments.",
                    "observedOutput": "Baseline: Returned https://api-m.paypal.com."
                }
            ])
        }
    ]

    for s in sessions_data:
        cursor.execute("""
        INSERT INTO sessions (
            id, scenario_id, scenario_name, sample_app, status, last_updated, created_at,
            reproduction_status, reproduction_json, diagnosis_status, diagnosis_json,
            patch_id, patch_json, patch_review_status, verification_mode, verification_status,
            verification_progress, verification_run_json, report_id, report_json, test_cases_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["scenario_id"], s["scenario_name"], s["sample_app"], s["status"], s["last_updated"], s["created_at"],
            s["reproduction_status"], s["reproduction_json"], s["diagnosis_status"], s["diagnosis_json"],
            s["patch_id"], s["patch_json"], s["patch_review_status"], s["verification_mode"], s["verification_status"],
            s["verification_progress"], s["verification_run_json"], s["report_id"], s["report_json"], s["test_cases_json"]
        ))

    # Seed initial Reports
    reports_data = [
        {
            "id": "REP-PASS-1042",
            "session_id": "SES-1042",
            "category": "VERIFICATION_PASS",
            "severity": "INFO",
            "title": "Webhook Signature Verification Patch Verified (Pass)",
            "scenario_name": "Webhook Signature Verification Failure",
            "scenario_id": "wh-signature",
            "description": "Fix confirmed: All 4 offline contract tests passed without regressions.",
            "error_category": "SIGNATURE_VERIFICATION",
            "error_message": "Original failure resolved: Webhook listener verifies transmission signature using raw request Buffer.",
            "affected_component": "PayPal Webhook Receiver Middleware",
            "affected_file": "src/services/paypalWebhookVerifier.js",
            "affected_function": "verifyPayPalWebhookSignature(req)",
            "observed_evidence": "4/4 Pytest assertions passed. SHA256 matches PayPal cert. CRC32 matches expected payload.",
            "confirmed_cause": "Configured webhook ID in sample was WH-STALE-OLD-001, and JSON body parser mutated payload buffer.",
            "ai_hypothesis": "Gemini 2.5 Flash identified mismatched WEBHOOK_ID fallback and express.json() raw body mutation.",
            "ai_confidence_label": "High (94.2%)",
            "missing_evidence": None,
            "execution_mode": "OFFLINE_CONTRACT_TEST",
            "created_at": "2026-10-18T07:16:00Z",
            "status": "RESOLVED",
            "patch_id": "PATCH-PP-SIG-001",
            "patch_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "baseline_results_json": json.dumps({"passed": 2, "failed": 2, "total": 4}),
            "after_fix_results_json": json.dumps({"passed": 4, "failed": 0, "total": 4}),
            "exit_code": 0
        },
        {
            "id": "REP-ERR-1041",
            "session_id": "SES-1041",
            "category": "ERROR",
            "severity": "CRITICAL",
            "title": "Webhook Signature Verification Failure (400 Bad Request)",
            "scenario_name": "Webhook Signature Verification Failure",
            "scenario_id": "wh-signature",
            "description": "Incoming PayPal webhook event rejected with HTTP 400 Bad Request due to mismatched webhook ID and body mutation.",
            "error_category": "SIGNATURE_VERIFICATION",
            "error_message": "Webhook signature verification failed: CRC32 checksum mismatch (expected 0x8a92f, got 0x00000)",
            "affected_component": "PayPal Webhook Receiver",
            "affected_file": "src/services/paypalWebhookVerifier.js",
            "affected_function": "verifyPayPalWebhookSignature",
            "observed_evidence": "HTTP 400 response returned for legitimate PAYMENT.CAPTURE.COMPLETED event.",
            "confirmed_cause": "The configured webhook ID does not match the registered PayPal sandbox webhook listener.",
            "ai_hypothesis": "The request body was re-serialized by JSON parser middleware, corrupting the byte sequence.",
            "ai_confidence_label": "High Confidence",
            "missing_evidence": None,
            "execution_mode": "OFFLINE_CONTRACT_TEST",
            "created_at": "2026-10-18T06:55:00Z",
            "status": "OPEN",
            "patch_id": None,
            "exit_code": 1
        }
    ]

    for r in reports_data:
        cursor.execute("""
        INSERT INTO reports (
            id, session_id, category, severity, title, scenario_name, scenario_id,
            description, error_category, error_message, affected_component, affected_file,
            affected_function, observed_evidence, confirmed_cause, ai_hypothesis,
            ai_confidence_label, missing_evidence, execution_mode, created_at, status,
            patch_id, patch_sha256, baseline_results_json, after_fix_results_json, exit_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["session_id"], r["category"], r["severity"], r["title"], r["scenario_name"], r["scenario_id"],
            r["description"], r["error_category"], r["error_message"], r["affected_component"], r["affected_file"],
            r["affected_function"], r["observed_evidence"], r["confirmed_cause"], r["ai_hypothesis"],
            r["ai_confidence_label"], r["missing_evidence"], r["execution_mode"], r["created_at"], r["status"],
            r["patch_id"], r.get("patch_sha256"), r.get("baseline_results_json"), r.get("after_fix_results_json"), r.get("exit_code")
        ))

    # Seed remediation actions for the error report
    actions_data = [
        {
            "id": "REM-1041-01",
            "report_id": "REP-ERR-1041",
            "title": "Synchronize PAYPAL_WEBHOOK_ID in Environment",
            "description": "Retrieve the active webhook ID from the PayPal Developer Dashboard and update .env.",
            "priority": "CRITICAL",
            "status": "IN_PROGRESS",
            "source_type": "DETERMINISTIC",
            "reason": "PayPal requires an exact match with the registered webhook ID when validating signature headers.",
            "created_at": "2026-10-18T06:56:00Z"
        },
        {
            "id": "REM-1041-02",
            "report_id": "REP-ERR-1041",
            "title": "Preserve Raw Request Body Buffer in Express",
            "description": "Configure express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }).",
            "priority": "HIGH",
            "status": "NOT_STARTED",
            "source_type": "AI_SUGGESTION",
            "reason": "Re-serializing parsed JSON causes character spacing changes that invalidate cryptographic hashes.",
            "created_at": "2026-10-18T06:56:00Z"
        }
    ]

    for a in actions_data:
        cursor.execute("""
        INSERT INTO remediation_actions (
            id, report_id, title, description, priority, status, source_type, reason, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            a["id"], a["report_id"], a["title"], a["description"], a["priority"], a["status"], a["source_type"], a["reason"], a["created_at"]
        ))

    conn.commit()

def seed_webhook_deliveries(conn):
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    deliveries = [
        {
            "id": "WH-DELIV-1042",
            "event_id": "WH-EVENT-1042",
            "event_type": "PAYMENT.CAPTURE.COMPLETED",
            "delivery_timestamp": "2026-10-18T07:12:44Z",
            "verification_status": "FAILED",
            "source_type": "OFFLINE_SIMULATION",
            "transmission_headers_json": json.dumps({
                "PAYPAL-TRANSMISSION-ID": "c1a403d0-a032-11ef-93a1-792187b92041",
                "PAYPAL-TRANSMISSION-TIME": "2026-10-18T07:12:44Z",
                "PAYPAL-TRANSMISSION-SIG": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                "PAYPAL-AUTH-ALGO": "SHA256withRSA",
                "PAYPAL-CERT-URL": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360"
            }),
            "payload_json": json.dumps({
                "id": "WH-EVENT-1042",
                "event_type": "PAYMENT.CAPTURE.COMPLETED",
                "resource": {
                    "id": "2H71928410294820M",
                    "amount": {"value": "89.50", "currency_code": "USD"},
                    "status": "COMPLETED"
                }
            }, indent=2),
            "error_details": "Signature verification failed: Calculated CRC32 mismatch or mismatched webhook ID (configured WH-STALE-OLD-001 vs registered WH-9LA78291KL098234).",
            "latency_ms": 38,
            "created_at": "2026-10-18T07:12:45Z"
        },
        {
            "id": "WH-DELIV-1043",
            "event_id": "WH-EVENT-1043",
            "event_type": "CHECKOUT.ORDER.APPROVED",
            "delivery_timestamp": "2026-10-18T07:25:10Z",
            "verification_status": "VERIFIED",
            "source_type": "PAYPAL_SANDBOX_LIVE",
            "transmission_headers_json": json.dumps({
                "PAYPAL-TRANSMISSION-ID": "e9b2104a-a034-11ef-93a1-792187b92041",
                "PAYPAL-TRANSMISSION-TIME": "2026-10-18T07:25:10Z",
                "PAYPAL-TRANSMISSION-SIG": "a8f9021b7194...[VERIFIED_RSA_SHA256]...",
                "PAYPAL-AUTH-ALGO": "SHA256withRSA",
                "PAYPAL-CERT-URL": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360"
            }),
            "payload_json": json.dumps({
                "id": "WH-EVENT-1043",
                "event_type": "CHECKOUT.ORDER.APPROVED",
                "resource": {
                    "id": "5X91823746190283K",
                    "intent": "CAPTURE",
                    "status": "APPROVED",
                    "purchase_units": [{"amount": {"currency_code": "USD", "value": "120.00"}}]
                }
            }, indent=2),
            "error_details": None,
            "latency_ms": 184,
            "created_at": "2026-10-18T07:25:11Z"
        },
        {
            "id": "WH-DELIV-1044",
            "event_id": "WH-EVENT-1044",
            "event_type": "CUSTOMER.DISPUTE.CREATED",
            "delivery_timestamp": "2026-10-18T08:05:00Z",
            "verification_status": "UNVERIFIED",
            "source_type": "PAYPAL_SANDBOX_LIVE",
            "transmission_headers_json": json.dumps({
                "PAYPAL-TRANSMISSION-ID": "f1048a12-a03a-11ef-93a1-792187b92041",
                "PAYPAL-TRANSMISSION-TIME": "2026-10-18T08:05:00Z"
            }),
            "payload_json": json.dumps({
                "id": "WH-EVENT-1044",
                "event_type": "CUSTOMER.DISPUTE.CREATED",
                "resource": {"dispute_id": "PP-D-88219", "dispute_amount": {"value": "45.00", "currency_code": "USD"}}
            }, indent=2),
            "error_details": "Missing required header: PAYPAL-TRANSMISSION-SIG. Event dropped as unauthenticated.",
            "latency_ms": 15,
            "created_at": "2026-10-18T08:05:01Z"
        }
    ]

    for d in deliveries:
        cursor.execute("""
        INSERT INTO webhook_deliveries (
            id, event_id, event_type, delivery_timestamp, verification_status,
            source_type, transmission_headers_json, payload_json, error_details,
            latency_ms, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d["id"], d["event_id"], d["event_type"], d["delivery_timestamp"], d["verification_status"],
            d["source_type"], d["transmission_headers_json"], d["payload_json"], d["error_details"],
            d["latency_ms"], d["created_at"]
        ))

    conn.commit()

def seed_paypal_api_errors(conn):
    cursor = conn.cursor()

    errors = [
        {
            "id": "ERR-PP-422-IDEM",
            "operation": "POST /v2/checkout/orders/88912/capture",
            "endpoint": "https://api-m.sandbox.paypal.com/v2/checkout/orders/88912/capture",
            "http_status": 422,
            "paypal_error_name": "UNPROCESSABLE_ENTITY",
            "message": "DUPLICATE_REQUEST_ID: A transaction with this PayPal-Request-Id was already processed or is pending.",
            "debug_id": "9f82b7194a02c",
            "details_json": json.dumps({
                "issue": "DUPLICATE_REQUEST_ID",
                "description": "The value of PayPal-Request-Id header has already been used for a previous transaction.",
                "suggested_action": "Reuse the deterministic request ID for intent queries, or generate a unique UUID per checkout intent."
            }),
            "raw_response_json": json.dumps({
                "name": "UNPROCESSABLE_ENTITY",
                "details": [{
                    "field": "PayPal-Request-Id",
                    "value": "req-88912-duplicate",
                    "location": "header",
                    "issue": "DUPLICATE_REQUEST_ID",
                    "description": "A transaction with this request ID is currently being processed or already succeeded."
                }],
                "message": "The requested action could not be performed, semantically incorrect, or failed business validation.",
                "debug_id": "9f82b7194a02c",
                "links": [{"href": "https://developer.paypal.com/docs/api/orders/v2/#error-DUPLICATE_REQUEST_ID", "rel": "information_link"}]
            }, indent=2),
            "ai_analysis_json": json.dumps({
                "what_happened": "PayPal rejected payment capture with HTTP 422 because the PayPal-Request-Id header was sent again after the original capture was already registered.",
                "likely_cause": "The payment capture client retry loop re-sent the capture request without checking if the previous network timeout was actually fulfilled.",
                "supporting_evidence": "Debug ID 9f82b7194a02c matched a completed capture transaction on the sandbox order ledger.",
                "developer_action": "Implement a fallback status query (GET /v2/checkout/orders/{id}) when network timeouts occur before attempting a fresh capture.",
                "how_to_verify": "Simulate a network timeout retry using PayPal negative test headers and assert that order status is inspected."
            }, indent=2),
            "environment": "sandbox",
            "created_at": "2026-10-18T05:20:00Z"
        },
        {
            "id": "ERR-PP-400-PRECISION",
            "operation": "POST /v2/checkout/orders",
            "endpoint": "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            "http_status": 400,
            "paypal_error_name": "INVALID_PARAMETER_VALUE",
            "message": "DECIMAL_PRECISION_EXCEEDED: Currency JPY does not support decimal places. Provided: 1500.50",
            "debug_id": "3c19b024e81fa",
            "details_json": json.dumps({
                "issue": "DECIMAL_PRECISION_EXCEEDED",
                "field": "/purchase_units/0/amount/value",
                "currency": "JPY",
                "provided_value": "1500.50"
            }),
            "raw_response_json": json.dumps({
                "name": "INVALID_REQUEST",
                "message": "Request is not well-formed, syntactically incorrect, or violates schema rules.",
                "debug_id": "3c19b024e81fa",
                "details": [{
                    "field": "/purchase_units/0/amount/value",
                    "value": "1500.50",
                    "location": "body",
                    "issue": "DECIMAL_PRECISION_EXCEEDED",
                    "description": "Currency JPY requires 0 decimal fraction digits per ISO 4217 specifications."
                }]
            }, indent=2),
            "ai_analysis_json": json.dumps({
                "what_happened": "Order creation failed because JPY currency amount contained fractional decimal places.",
                "likely_cause": "The currency formatting helper applied standard 2-decimal formatting (1500.50) without accounting for zero-decimal currencies like JPY, KRW, or HUF.",
                "supporting_evidence": "PayPal API schema strictly enforces ISO 4217 decimal restrictions.",
                "developer_action": "Utilize an ISO 4217 decimal lookup table to format currency strings with zero decimals for JPY.",
                "how_to_verify": "Run currency formatting unit test suite against JPY, USD, and EUR."
            }, indent=2),
            "environment": "sandbox",
            "created_at": "2026-10-18T05:45:00Z"
        },
        {
            "id": "ERR-PP-401-AUTH",
            "operation": "POST /v1/oauth2/token",
            "endpoint": "https://api-m.paypal.com/v1/oauth2/token",
            "http_status": 401,
            "paypal_error_name": "AUTHENTICATION_FAILURE",
            "message": "invalid_client: Client credentials invalid against target endpoint.",
            "debug_id": "e71a0942b918a",
            "details_json": json.dumps({
                "issue": "INVALID_CLIENT",
                "description": "Sandbox client ID and secret were submitted to live production endpoint (api-m.paypal.com)."
            }),
            "raw_response_json": json.dumps({
                "error": "invalid_client",
                "error_description": "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method)."
            }, indent=2),
            "ai_analysis_json": json.dumps({
                "what_happened": "OAuth client authentication rejected by PayPal API gateway.",
                "likely_cause": "Sandbox credentials were sent to api-m.paypal.com (production) instead of api-m.sandbox.paypal.com.",
                "supporting_evidence": "Target baseUrl was hardcoded to live production in paypalEnvironment.js.",
                "developer_action": "Set PAYPAL_ENV=sandbox and dynamically resolve endpoint host to https://api-m.sandbox.paypal.com.",
                "how_to_verify": "Execute PayPal Connection Inspector against sandbox endpoint."
            }, indent=2),
            "environment": "production-mismatch",
            "created_at": "2026-10-17T14:15:00Z"
        }
    ]

    for e in errors:
        cursor.execute("""
        INSERT INTO paypal_api_errors (
            id, operation, endpoint, http_status, paypal_error_name, message,
            debug_id, details_json, raw_response_json, ai_analysis_json,
            environment, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            e["id"], e["operation"], e["endpoint"], e["http_status"], e["paypal_error_name"],
            e["message"], e["debug_id"], e["details_json"], e["raw_response_json"],
            e["ai_analysis_json"], e["environment"], e["created_at"]
        ))

    conn.commit()
