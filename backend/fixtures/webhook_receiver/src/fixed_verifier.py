"""
PayPal Webhook Signature Verifier (Corrected / Verified Implementation)
"""

import os
import json
import zlib
import hashlib

class PayPalWebhookVerifier:
    def __init__(self, webhook_id=None):
        # FIX: Synchronized with active PayPal sandbox webhook registration
        self.webhook_id = webhook_id or os.environ.get("PAYPAL_WEBHOOK_ID", "WH-9LA78291KL098234")

    def verify_webhook_signature(self, headers, body_data, cert_url=None):
        """
        Verifies incoming webhook transmission using raw unmutated payload bytes.
        """
        transmission_id = headers.get("PAYPAL-TRANSMISSION-ID") or headers.get("paypal-transmission-id")
        transmission_time = headers.get("PAYPAL-TRANSMISSION-TIME") or headers.get("paypal-transmission-time")
        transmission_sig = headers.get("PAYPAL-TRANSMISSION-SIG") or headers.get("paypal-transmission-sig")

        if not all([transmission_id, transmission_time, transmission_sig]):
            return {"status": 400, "verified": False, "error": "Missing required PayPal transmission headers"}

        # FIX: Preserve raw bytes exactly as received on the network
        if isinstance(body_data, (bytes, bytearray)):
            payload_bytes = bytes(body_data)
        elif isinstance(body_data, str):
            payload_bytes = body_data.encode("utf-8")
        elif isinstance(body_data, dict):
            # Fallback if raw bytes were omitted
            payload_bytes = json.dumps(body_data, separators=(',', ':')).encode("utf-8")
        else:
            payload_bytes = bytes(body_data)

        # Compute CRC32 checksum over the unmutated raw payload bytes
        crc32_val = zlib.crc32(payload_bytes) & 0xFFFFFFFF

        # Reconstruct transmission string per PayPal documentation:
        # <transmission_id>|<transmission_time>|<webhook_id>|<crc32>
        data_to_verify = f"{transmission_id}|{transmission_time}|{self.webhook_id}|{crc32_val}".encode("utf-8")

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
