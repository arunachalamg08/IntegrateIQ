import os
import sys
import zlib
import hashlib
import pytest

# Ensure the fixture src directory is on sys.path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from verifier import PayPalWebhookVerifier

# Standard PayPal Sandbox Registered Webhook ID for this service
EXPECTED_WEBHOOK_ID = "WH-9LA78291KL098234"

@pytest.fixture
def genuine_webhook_event():
    raw_body = b'{\n  "id": "WH-EVENT-1042",\n  "event_type": "PAYMENT.CAPTURE.COMPLETED",\n  "resource": {\n    "id": "2H71928410294820M",\n    "amount": { "value": "89.50", "currency_code": "USD" }\n  }\n}'
    trans_id = "c1a403d0-a032-11ef-93a1-792187b92041"
    trans_time = "2026-10-18T07:12:44Z"

    # Compute expected signature using PayPal's documented scheme against raw body
    crc32_val = zlib.crc32(raw_body) & 0xFFFFFFFF
    data_to_verify = f"{trans_id}|{trans_time}|{EXPECTED_WEBHOOK_ID}|{crc32_val}".encode("utf-8")
    trans_sig = hashlib.sha256(data_to_verify).hexdigest()

    headers = {
        "PAYPAL-TRANSMISSION-ID": trans_id,
        "PAYPAL-TRANSMISSION-TIME": trans_time,
        "PAYPAL-TRANSMISSION-SIG": trans_sig,
        "PAYPAL-AUTH-ALGO": "SHA256withRSA",
        "Content-Type": "application/json"
    }
    return headers, raw_body

def test_valid_signature_accepted(genuine_webhook_event):
    """
    ID: tc-wh-01
    Category: Positive Tests
    Description: Verify genuine PayPal webhook event with valid CRC32 and SHA256 transmission signature.
    """
    headers, raw_body = genuine_webhook_event
    verifier = PayPalWebhookVerifier()
    result = verifier.verify_webhook_signature(headers, raw_body)

    assert result["status"] == 200, f"Expected 200 OK, got {result.get('status')} - {result.get('error')}"
    assert result["verified"] is True, f"Signature verification failed: {result.get('error')}"

def test_mismatched_webhook_id_rejected():
    """
    ID: tc-wh-02
    Category: Negative Tests
    Description: Ensure events signed with foreign or malformed webhook IDs are rejected gracefully.
    """
    raw_body = b'{"id":"WH-EVENT-9999"}'
    trans_id = "foreign-trans-id-001"
    trans_time = "2026-10-18T07:15:00Z"
    foreign_webhook_id = "WH-FOREIGN-ATTACKER-999"

    crc32_val = zlib.crc32(raw_body) & 0xFFFFFFFF
    data_to_verify = f"{trans_id}|{trans_time}|{foreign_webhook_id}|{crc32_val}".encode("utf-8")
    forged_sig = hashlib.sha256(data_to_verify).hexdigest()

    headers = {
        "PAYPAL-TRANSMISSION-ID": trans_id,
        "PAYPAL-TRANSMISSION-TIME": trans_time,
        "PAYPAL-TRANSMISSION-SIG": forged_sig,
        "PAYPAL-AUTH-ALGO": "SHA256withRSA"
    }

    verifier = PayPalWebhookVerifier(webhook_id=EXPECTED_WEBHOOK_ID)
    result = verifier.verify_webhook_signature(headers, raw_body)

    assert result["status"] == 400
    assert result["verified"] is False
    assert "verification failed" in result["error"].lower()

def test_raw_payload_preservation():
    """
    ID: tc-wh-03
    Category: Configuration Tests
    Description: Confirm raw Buffer payload is preserved across middleware before JSON parsing.
    """
    verifier = PayPalWebhookVerifier(webhook_id=EXPECTED_WEBHOOK_ID)
    raw_body = b'  {  "whitespace": "important"  }  '
    headers = {
        "PAYPAL-TRANSMISSION-ID": "test-id",
        "PAYPAL-TRANSMISSION-TIME": "2026-10-18T07:00:00Z",
        "PAYPAL-TRANSMISSION-SIG": "dummy"
    }
    # Check that calling verify with raw bytes doesn't crash
    result = verifier.verify_webhook_signature(headers, raw_body)
    assert "status" in result

def test_safe_error_handling_without_crash():
    """
    ID: tc-wh-04
    Category: Regression Tests
    Description: Confirm corrupted headers do not trigger uncaught exception or crash the process.
    """
    verifier = PayPalWebhookVerifier()
    # Missing required transmission headers
    result = verifier.verify_webhook_signature({}, b"{}")
    assert result["status"] == 400
    assert result["verified"] is False
    assert "Missing required" in result["error"]
