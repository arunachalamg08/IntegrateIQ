from fastapi import APIRouter, Request, HTTPException, Response
import json
import time
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.services.paypal_service import PayPalService
from backend.app.services.event_service import event_broadcaster

router = APIRouter(prefix="/api/webhooks", tags=["PayPal Webhook Verification Debugger"])

class SimulateWebhookRequest(BaseModel):
    eventType: Optional[str] = "PAYMENT.CAPTURE.COMPLETED"
    corruptSignature: Optional[bool] = False
    mismatchedWebhookId: Optional[bool] = False

@router.post("/paypal")
async def receive_paypal_webhook(request: Request):
    """
    Genuine Webhook Receiver Endpoint for PayPal Sandbox events.
    Receives incoming webhook HTTP POST, extracts transmission metadata,
    and calls PayPal Sandbox API to verify signature authenticity.
    """
    start_time = time.time()
    headers_dict = dict(request.headers)

    # Read raw body bytes
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        payload = {"raw": raw_body.decode("utf-8", errors="replace")}

    event_id = payload.get("id") or f"WH-RAW-{int(time.time() * 1000)}"
    event_type = payload.get("event_type") or "UNKNOWN.EVENT"
    now_iso = datetime.utcnow().isoformat() + "Z"

    # Check if this is a live Sandbox request with PayPal headers
    trans_id = headers_dict.get("paypal-transmission-id") or headers_dict.get("PAYPAL-TRANSMISSION-ID")
    trans_sig = headers_dict.get("paypal-transmission-sig") or headers_dict.get("PAYPAL-TRANSMISSION-SIG")

    is_sandbox_configured = PayPalService.is_configured()
    source_type = "PAYPAL_SANDBOX_LIVE" if "paypal.com" in headers_dict.get("user-agent", "").lower() or is_sandbox_configured else "OFFLINE_SIMULATION"

    if not trans_id or not trans_sig:
        verif_status = "UNVERIFIED"
        error_msg = "Missing required PayPal transmission signature headers (PAYPAL-TRANSMISSION-ID / PAYPAL-TRANSMISSION-SIG)."
        http_status = 400
    elif is_sandbox_configured:
        # Call official PayPal Sandbox verification API
        verif_res = await PayPalService.verify_webhook_signature(
            headers=headers_dict,
            webhook_event=payload
        )
        if verif_res.get("verified"):
            verif_status = "VERIFIED"
            error_msg = None
            http_status = 200
        else:
            verif_status = "FAILED"
            error_msg = verif_res.get("error") or "PayPal Sandbox rejected webhook signature."
            http_status = 400
    else:
        # Fallback offline verification check
        verif_status = "FAILED"
        error_msg = "PayPal Sandbox credentials unconfigured. Event rejected under zero-trust verification policy."
        http_status = 400

    latency_ms = int((time.time() - start_time) * 1000)
    delivery_id = f"WH-DELIV-{int(time.time() * 1000) % 1000000}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO webhook_deliveries (
        id, event_id, event_type, delivery_timestamp, verification_status,
        source_type, transmission_headers_json, payload_json, error_details,
        latency_ms, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        delivery_id, event_id, event_type, now_iso, verif_status,
        source_type, json.dumps(headers_dict), json.dumps(payload),
        error_msg, latency_ms, now_iso
    ))
    conn.commit()
    conn.close()

    delivery_data = {
        "id": delivery_id,
        "eventId": event_id,
        "eventType": event_type,
        "deliveryTimestamp": now_iso,
        "verificationStatus": verif_status,
        "sourceType": source_type,
        "errorDetails": error_msg,
        "latencyMs": latency_ms
    }

    await event_broadcaster.broadcast_event("WEBHOOK_DELIVERY_RECEIVED", None, delivery_data)

    if http_status == 200:
        return {"status": "success", "delivery_id": delivery_id, "verification_status": verif_status}
    else:
        return Response(
            content=json.dumps({"status": "rejected", "delivery_id": delivery_id, "error": error_msg}),
            status_code=400,
            media_type="application/json"
        )

@router.get("/deliveries")
async def list_webhook_deliveries():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM webhook_deliveries ORDER BY delivery_timestamp DESC")
    rows = cursor.fetchall()
    deliveries = []
    for r in rows:
        deliveries.append({
            "id": r["id"],
            "eventId": r["event_id"],
            "eventType": r["event_type"],
            "deliveryTimestamp": r["delivery_timestamp"],
            "verificationStatus": r["verification_status"],
            "sourceType": r["source_type"],
            "transmissionHeaders": json.loads(r["transmission_headers_json"]) if r["transmission_headers_json"] else {},
            "payload": json.loads(r["payload_json"]) if r["payload_json"] else {},
            "errorDetails": r["error_details"],
            "latencyMs": r["latency_ms"],
            "createdAt": r["created_at"]
        })
    conn.close()
    return deliveries

@router.get("/deliveries/{delivery_id}")
async def get_webhook_delivery(delivery_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM webhook_deliveries WHERE id = ?", (delivery_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Webhook delivery not found.")

    return {
        "id": r["id"],
        "eventId": r["event_id"],
        "eventType": r["event_type"],
        "deliveryTimestamp": r["delivery_timestamp"],
        "verificationStatus": r["verification_status"],
        "sourceType": r["source_type"],
        "transmissionHeaders": json.loads(r["transmission_headers_json"]) if r["transmission_headers_json"] else {},
        "payload": json.loads(r["payload_json"]) if r["payload_json"] else {},
        "errorDetails": r["error_details"],
        "latencyMs": r["latency_ms"],
        "createdAt": r["created_at"]
    }

@router.post("/simulate-event")
async def simulate_webhook_event(req: SimulateWebhookRequest):
    """
    Generates a realistic PayPal webhook event delivery for live demonstration.
    """
    now_iso = datetime.utcnow().isoformat() + "Z"
    new_id = f"WH-DELIV-SIM-{int(time.time() * 1000) % 100000}"
    event_id = f"WH-EVENT-{int(time.time() * 1000) % 100000}"

    if req.corruptSignature:
        verif_status = "FAILED"
        sig = "invalid_corrupted_signature_hash_0000"
        err = "Webhook signature verification failed: CRC32 checksum mismatch."
    elif req.mismatchedWebhookId:
        verif_status = "FAILED"
        sig = "sig_for_wrong_webhook_id"
        err = "Webhook signature verification failed: Webhook ID mismatch (configured WH-STALE-OLD-001 vs registered WH-9LA78291KL098234)."
    else:
        verif_status = "VERIFIED"
        sig = "MEQCIB1g9Lq...[VALID_RSA_SHA256]..."
        err = None

    headers = {
        "PAYPAL-TRANSMISSION-ID": f"trans-{int(time.time())}",
        "PAYPAL-TRANSMISSION-TIME": now_iso,
        "PAYPAL-TRANSMISSION-SIG": sig,
        "PAYPAL-AUTH-ALGO": "SHA256withRSA",
        "PAYPAL-CERT-URL": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360",
        "Content-Type": "application/json"
    }

    payload = {
        "id": event_id,
        "event_version": "1.0",
        "create_time": now_iso,
        "resource_type": "capture",
        "event_type": req.eventType,
        "summary": f"{req.eventType} for $149.00 USD",
        "resource": {
            "id": f"CAP-{int(time.time())}",
            "amount": {"value": "149.00", "currency_code": "USD"},
            "status": "COMPLETED"
        }
    }

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO webhook_deliveries (
        id, event_id, event_type, delivery_timestamp, verification_status,
        source_type, transmission_headers_json, payload_json, error_details,
        latency_ms, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, event_id, req.eventType, now_iso, verif_status,
        "OFFLINE_SIMULATION", json.dumps(headers), json.dumps(payload),
        err, 42, now_iso
    ))
    conn.commit()
    conn.close()

    delivery_data = {
        "id": new_id,
        "eventId": event_id,
        "eventType": req.eventType,
        "deliveryTimestamp": now_iso,
        "verificationStatus": verif_status,
        "sourceType": "OFFLINE_SIMULATION",
        "errorDetails": err,
        "latencyMs": 42
    }
    await event_broadcaster.broadcast_event("WEBHOOK_DELIVERY_RECEIVED", None, delivery_data)
    return delivery_data
