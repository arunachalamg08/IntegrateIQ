from fastapi import APIRouter
from typing import List
from backend.app.models.schemas import ScenarioDefinition, TestCase

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

SCENARIOS: List[dict] = [
    {
        "id": "wh-signature",
        "name": "Webhook Signature Verification Failure",
        "shortDescription": "Incoming PayPal webhook events fail cryptographic signature verification due to mismatched webhook ID and raw body mutation.",
        "exampleSymptom": "HTTP 400 Bad Request — PayPal webhook listener returns 'Signature verification failed' for genuine events.",
        "difficulty": "Medium",
        "iconName": "ShieldAlert",
        "rootCauseSummary": "The configured WEBHOOK_ID environment variable does not match the active PayPal listener, and express.json() mutated raw payload buffer.",
        "affectedFile": "src/verifier.py",
        "targetEndpoint": "POST /api/webhooks/paypal",
        "categories": ["Security", "Configuration Tests", "Negative Tests"],
        "fullDescription": "PayPal webhooks require verifying the transmission signature headers against the raw request body and the exact webhook ID registered in the developer console. When the webhook ID is mismatched or body parser re-serializes JSON, SHA256 hashes diverge.",
        "expectedOutcome": "Webhook listener safely verifies authenticity, rejects forged signatures with HTTP 400, and returns HTTP 200 for valid events.",
        "availability": "Available Live",
        "testCases": [
            {
                "id": "tc-wh-01",
                "name": "Correct configuration & valid signature accepted",
                "category": "Positive Tests",
                "baselineResult": "fail",
                "afterFixResult": "pass",
                "durationMs": 42,
                "description": "Verify genuine PayPal webhook event with valid CRC32 and SHA256 transmission signature.",
                "observedOutput": "Baseline: CRC32 checksum mismatch (expected 0x8a92f, got 0x00000). Fixed: Signature validated against PayPal cert."
            },
            {
                "id": "tc-wh-02",
                "name": "Incorrect webhook ID rejected with security event",
                "category": "Negative Tests",
                "baselineResult": "fail",
                "afterFixResult": "pass",
                "durationMs": 38,
                "description": "Ensure events signed with foreign or malformed webhook IDs are rejected gracefully.",
                "observedOutput": "Baseline: Silent failure with unhandled rejection. Fixed: Handled 401 Unauthorized with security audit log."
            },
            {
                "id": "tc-wh-03",
                "name": "Raw request body preserved without JSON re-serialization",
                "category": "Configuration Tests",
                "baselineResult": "pass",
                "afterFixResult": "pass",
                "durationMs": 25,
                "description": "Confirm raw Buffer payload is preserved across middleware before JSON parsing.",
                "observedOutput": "Buffer length 1048 bytes preserved intact."
            },
            {
                "id": "tc-wh-04",
                "name": "Verification error handled safely without server crash",
                "category": "Regression Tests",
                "baselineResult": "pass",
                "afterFixResult": "pass",
                "durationMs": 19,
                "description": "Confirm corrupted headers do not trigger uncaught exception or crash the process.",
                "observedOutput": "Returned HTTP 400 with structured JSON error payload."
            }
        ]
    },
    {
        "id": "idempotency-retry",
        "name": "Request Idempotency and Retry Failure",
        "shortDescription": "Missing or reused PayPal-Request-Id header triggers 422 UNPROCESSABLE_ENTITY on network timeout retries.",
        "exampleSymptom": "Duplicate payment attempts occur when network drops, or retries fail with 'DUPLICATE_REQUEST_ID'.",
        "difficulty": "High",
        "iconName": "RefreshCw",
        "rootCauseSummary": "Payment capture client generated a new UUID on retries instead of reusing the deterministic idempotency key.",
        "affectedFile": "src/services/paymentCaptureClient.js",
        "targetEndpoint": "POST /v2/checkout/orders/{id}/capture",
        "categories": ["Positive Tests", "Regression Tests"],
        "fullDescription": "PayPal requires the PayPal-Request-Id header to guarantee idempotent order creation and captures. Reusing an old key across different transactions causes HTTP 422.",
        "expectedOutcome": "Consistent UUID generation scoped per order intent, with cached recovery responses on network retries.",
        "availability": "Available Live",
        "testCases": []
    },
    {
        "id": "env-mismatch",
        "name": "Sandbox and Production Configuration Mismatch",
        "shortDescription": "Incorrect environment endpoint configuration causes OAuth authentication failure with invalid client credentials.",
        "exampleSymptom": "HTTP 401 Unauthorized — 'invalid_client' returned when connecting to PayPal REST API.",
        "difficulty": "Low",
        "iconName": "ServerCrash",
        "rootCauseSummary": "PAYPAL_ENV is set to 'sandbox' but baseUrl is hardcoded to 'https://api-m.paypal.com' (live production).",
        "affectedFile": "src/config/paypalEnvironment.js",
        "targetEndpoint": "POST /v1/oauth2/token",
        "categories": ["Configuration Tests", "Positive Tests"],
        "fullDescription": "PayPal maintains separate endpoint hosts for Sandbox (api-m.sandbox.paypal.com) and Live (api-m.paypal.com).",
        "expectedOutcome": "Client dynamically resolves host based on PAYPAL_ENV with strict assertion preventing live endpoint usage in staging.",
        "availability": "Available Live",
        "testCases": []
    }
]

@router.get("")
async def get_scenarios():
    return SCENARIOS
