"""
PayPal Webhook Signature Verifier (Target Under Test - Fixture)
Seeded with genuine defects for failure reproduction.
"""

import os
import json
import zlib
import hashlib
import hmac

class PayPalWebhookVerifier:
    def __init__(self, webhook_id=None):
        # DEFECT 1: Outdated fallback webhook ID from prior sandbox app iteration
        self.webhook_id = webhook_id or os.environ.get("PAYPAL_WEBHOOK_ID", "WH-STALE-OLD-001")

    def verify_webhook_signature(self, headers, body_data, cert_url=None):
        """
        Verifies incoming webhook transmission against PayPal specification.
        """
        transmission_id = headers.get("PAYPAL-TRANSMISSION-ID") or headers.get("paypal-transmission-id")
        transmission_time = headers.get("PAYPAL-TRANSMISSION-TIME") or headers.get("paypal-transmission-time")
        transmission_sig = headers.get("PAYPAL-TRANSMISSION-SIG") or headers.get("paypal-transmission-sig")
        auth_algo = headers.get("PAYPAL-AUTH-ALGO") or headers.get("paypal-auth-algo")

        if not all([transmission_id, transmission_time, transmission_sig]):
            return {"status": 400, "verified": False, "error": "Missing required PayPal transmission headers"}

        # DEFECT 2: Re-serializing dict / payload mutating byte representation
        if isinstance(body_data, dict):
            # JSON serialization re-orders keys and alters whitespace
            payload_bytes = json.dumps(body_data).encode("utf-8")
        elif isinstance(body_data, (bytes, bytearray)):
            # Mutated by re-encoding
            try:
                parsed = json.loads(body_data.decode("utf-8"))
                payload_bytes = json.dumps(parsed).encode("utf-8")  # BUG: re-serialized
            except Exception:
                payload_bytes = body_data
        else:
            payload_bytes = str(body_data).encode("utf-8")

        # Compute CRC32 checksum over the payload
        crc32_val = zlib.crc32(payload_bytes) & 0xFFFFFFFF

        # Reconstruct transmission string per PayPal documentation:
        # <transmission_id>|<transmission_time>|<webhook_id>|<crc32>
        data_to_verify = f"{transmission_id}|{transmission_time}|{self.webhook_id}|{crc32_val}".encode("utf-8")

        # Mock deterministic verification check
        expected_sig = hashlib.sha256(data_to_verify).hexdigest()

        if transmission_sig == expected_sig:
            return {"status": 200, "verified": True, "error": None}
        else:
            return {
                "status": 400,
                "verified": False,
                "error": f"Webhook signature verification failed: CRC32 mismatch or webhook ID mismatch. (configured_webhook_id={self.webhook_id})",
                "calculated_crc32": hex(crc32_val),
                "expected_sig": expected_sig[:16] + "...",
                "received_sig": transmission_sig[:16] + "..." if transmission_sig else "None"
            }
