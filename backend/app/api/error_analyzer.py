from fastapi import APIRouter, HTTPException
import json
import time
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.app.database import get_db
from backend.app.services.gemini_service import GeminiService
from backend.app.services.event_service import event_broadcaster

router = APIRouter(prefix="/api/paypal/errors", tags=["PayPal API Error Analyzer"])

class AnalyzeErrorRequest(BaseModel):
    operation: str
    httpStatus: int
    paypalErrorName: str
    message: str
    debugId: Optional[str] = None
    detailsJson: Optional[str] = None

class SimulateNegativeTestRequest(BaseModel):
    testScenario: str  # 'duplicate-request-id' | 'currency-precision' | 'auth-mismatch'

@router.get("")
async def list_paypal_errors():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM paypal_api_errors ORDER BY created_at DESC")
    rows = cursor.fetchall()
    errors = []
    for r in rows:
        errors.append({
            "id": r["id"],
            "operation": r["operation"],
            "endpoint": r["endpoint"],
            "httpStatus": r["http_status"],
            "paypalErrorName": r["paypal_error_name"],
            "message": r["message"],
            "debugId": r["debug_id"],
            "details": json.loads(r["details_json"]) if r["details_json"] else None,
            "rawResponse": json.loads(r["raw_response_json"]) if r["raw_response_json"] else None,
            "aiAnalysis": json.loads(r["ai_analysis_json"]) if r["ai_analysis_json"] else None,
            "environment": r["environment"],
            "createdAt": r["created_at"]
        })
    conn.close()
    return errors

@router.get("/{error_id}")
async def get_paypal_error(error_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM paypal_api_errors WHERE id = ?", (error_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="PayPal error record not found.")

    return {
        "id": r["id"],
        "operation": r["operation"],
        "endpoint": r["endpoint"],
        "httpStatus": r["http_status"],
        "paypalErrorName": r["paypal_error_name"],
        "message": r["message"],
        "debugId": r["debug_id"],
        "details": json.loads(r["details_json"]) if r["details_json"] else None,
        "rawResponse": json.loads(r["raw_response_json"]) if r["raw_response_json"] else None,
        "aiAnalysis": json.loads(r["ai_analysis_json"]) if r["ai_analysis_json"] else None,
        "environment": r["environment"],
        "createdAt": r["created_at"]
    }

@router.post("/analyze")
async def analyze_error(req: AnalyzeErrorRequest):
    """
    Submits a PayPal API error to Gemini for root-cause and remediation analysis.
    Explicitly separates observed facts from AI hypotheses.
    """
    client = GeminiService.get_client()

    if client:
        prompt = f"""
You are an expert PayPal API integration architect. Analyze this PayPal REST API error payload:

OPERATION: {req.operation}
HTTP STATUS: {req.httpStatus}
PAYPAL ERROR NAME: {req.paypalErrorName}
ERROR MESSAGE: {req.message}
DEBUG ID: {req.debugId or 'N/A'}
DETAILS: {req.detailsJson or 'None'}

Return ONLY a JSON object with this exact structure:
{{
  "what_happened": "Exact factual statement of the observed gateway rejection",
  "likely_cause": "Probable architectural or configuration cause",
  "supporting_evidence": "Specific field or header indicating why the error occurred",
  "developer_action": "Specific, actionable code or configuration step to fix the error",
  "how_to_verify": "How the developer can verify the fix in PayPal Sandbox"
}}
"""
        try:
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            text = res.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            analysis = json.loads(text.strip())
            return {"status": "success", "provider": "Google Gemini 2.5 Flash", "analysis": analysis}
        except Exception as e:
            pass

    # Deterministic fallback analysis
    analysis = {
        "what_happened": f"PayPal returned HTTP {req.httpStatus} {req.paypalErrorName}: {req.message}",
        "likely_cause": "Payload parameters or transmission headers violate PayPal REST API schema constraints.",
        "supporting_evidence": f"Rejection registered under PayPal Debug ID: {req.debugId or 'LOC-DBG-DEMO'}.",
        "developer_action": "Review the relevant endpoint specification in PayPal Developer docs and correct invalid parameters.",
        "how_to_verify": "Execute a Sandbox negative test probe and verify HTTP 200/201 response."
    }
    return {"status": "success", "provider": "Deterministic PayPal Rules Engine", "analysis": analysis}

@router.post("/simulate-negative-test")
async def simulate_negative_test(req: SimulateNegativeTestRequest):
    """
    Simulates a genuine PayPal negative testing error event using official PayPal error schemas.
    """
    now_iso = datetime.utcnow().isoformat() + "Z"
    new_id = f"ERR-PP-SIM-{int(time.time() * 1000) % 100000}"

    if req.testScenario == "duplicate-request-id":
        operation = "POST /v2/checkout/orders/req-991/capture"
        endpoint = "https://api-m.sandbox.paypal.com/v2/checkout/orders/req-991/capture"
        http_status = 422
        error_name = "UNPROCESSABLE_ENTITY"
        msg = "DUPLICATE_REQUEST_ID: The value of PayPal-Request-Id header has already been used."
        debug_id = f"dbg_{int(time.time())}"
        details = {"field": "PayPal-Request-Id", "issue": "DUPLICATE_REQUEST_ID"}
    elif req.testScenario == "currency-precision":
        operation = "POST /v2/checkout/orders"
        endpoint = "https://api-m.sandbox.paypal.com/v2/checkout/orders"
        http_status = 400
        error_name = "INVALID_PARAMETER_VALUE"
        msg = "DECIMAL_PRECISION_EXCEEDED: Currency JPY does not support decimal places. Provided: 1500.50"
        debug_id = f"dbg_{int(time.time())}"
        details = {"currency": "JPY", "issue": "DECIMAL_PRECISION_EXCEEDED"}
    else:
        operation = "POST /v1/oauth2/token"
        endpoint = "https://api-m.paypal.com/v1/oauth2/token"
        http_status = 401
        error_name = "AUTHENTICATION_FAILURE"
        msg = "invalid_client: Client credentials invalid against target endpoint."
        debug_id = f"dbg_{int(time.time())}"
        details = {"issue": "INVALID_CLIENT"}

    # Generate analysis
    analysis_req = AnalyzeErrorRequest(
        operation=operation,
        httpStatus=http_status,
        paypalErrorName=error_name,
        message=msg,
        debugId=debug_id,
        detailsJson=json.dumps(details)
    )
    analysis_res = await analyze_error(analysis_req)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO paypal_api_errors (
        id, operation, endpoint, http_status, paypal_error_name, message,
        debug_id, details_json, raw_response_json, ai_analysis_json,
        environment, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, operation, endpoint, http_status, error_name, msg,
        debug_id, json.dumps(details), json.dumps({"name": error_name, "debug_id": debug_id, "message": msg}),
        json.dumps(analysis_res["analysis"]), "sandbox", now_iso
    ))
    conn.commit()
    conn.close()

    await event_broadcaster.broadcast_event("PAYPAL_ERROR_SIMULATED", None, {"id": new_id, "error_name": error_name})
    return {"id": new_id, "status": "simulated", "http_status": http_status, "error_name": error_name}
