from fastapi import APIRouter, HTTPException
import time
from datetime import datetime
from typing import Dict, Any, Optional
from backend.app.config import settings
from backend.app.services.paypal_service import PayPalService

router = APIRouter(prefix="/api/paypal/inspector", tags=["PayPal Sandbox Connection Inspector"])

@router.get("/status")
@router.post("/test-auth")
async def inspect_paypal_sandbox_connection():
    """
    Performs genuine authentication test against PayPal Sandbox OAuth 2.0 API.
    Measures exact round-trip latency, sanitizes secrets, and returns live status.
    """
    start_time = time.time()
    is_configured = PayPalService.is_configured()

    client_id = settings.PAYPAL_CLIENT_ID or ""
    client_prefix = client_id[:6] + "..." if len(client_id) >= 6 else "Not Set"

    if not is_configured:
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "status": "CONFIGURATION_REQUIRED",
            "isAuthenticated": False,
            "isConfigured": False,
            "environment": "sandbox",
            "targetEndpoint": settings.PAYPAL_SANDBOX_URL,
            "oauthEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/oauth2/token",
            "webhookVerifyEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/notifications/verify-webhook-signature",
            "httpStatus": 0,
            "latencyMs": duration_ms,
            "clientPrefix": client_prefix,
            "webhookIdConfigured": bool(settings.PAYPAL_WEBHOOK_ID),
            "webhookId": settings.PAYPAL_WEBHOOK_ID or "Not Configured",
            "message": "PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not configured in backend environment (.env).",
            "lastChecked": datetime.utcnow().isoformat() + "Z",
            "recommendations": [
                "1. Sign in to https://developer.paypal.com/dashboard/applications/sandbox",
                "2. Create or select a Sandbox REST API App",
                "3. Copy the Client ID and Secret into your root .env file",
                "4. Click 'Test PayPal Connection' to verify Sandbox authentication"
            ]
        }

    # Perform real OAuth token request
    token, error = await PayPalService.get_access_token()
    duration_ms = int((time.time() - start_time) * 1000)

    if token:
        return {
            "status": "CONNECTED",
            "isAuthenticated": True,
            "isConfigured": True,
            "environment": "sandbox",
            "targetEndpoint": settings.PAYPAL_SANDBOX_URL,
            "oauthEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/oauth2/token",
            "webhookVerifyEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/notifications/verify-webhook-signature",
            "httpStatus": 200,
            "latencyMs": duration_ms,
            "clientPrefix": client_prefix,
            "webhookIdConfigured": bool(settings.PAYPAL_WEBHOOK_ID),
            "webhookId": settings.PAYPAL_WEBHOOK_ID or "Not Configured",
            "message": "Successfully authenticated with PayPal Sandbox OAuth 2.0 API.",
            "lastChecked": datetime.utcnow().isoformat() + "Z",
            "recommendations": [
                "✓ Sandbox OAuth authentication confirmed.",
                "✓ Access token securely cached on server until expiry.",
                "✓ Ready for real PayPal webhook signature verification requests."
            ]
        }
    else:
        return {
            "status": "AUTHENTICATION_FAILED",
            "isAuthenticated": False,
            "isConfigured": True,
            "environment": "sandbox",
            "targetEndpoint": settings.PAYPAL_SANDBOX_URL,
            "oauthEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/oauth2/token",
            "webhookVerifyEndpoint": f"{settings.PAYPAL_SANDBOX_URL}/v1/notifications/verify-webhook-signature",
            "httpStatus": 401 if "INVALID_CREDENTIALS" in (error or "") else 500,
            "latencyMs": duration_ms,
            "clientPrefix": client_prefix,
            "webhookIdConfigured": bool(settings.PAYPAL_WEBHOOK_ID),
            "webhookId": settings.PAYPAL_WEBHOOK_ID or "Not Configured",
            "message": error or "Sandbox authentication rejected.",
            "lastChecked": datetime.utcnow().isoformat() + "Z",
            "recommendations": [
                "Verify that the Client ID and Secret in .env belong to the Sandbox environment, not Live production.",
                "Ensure credentials do not contain surrounding quotes or trailing whitespace."
            ]
        }
