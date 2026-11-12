import os
import time
import httpx
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from backend.app.config import settings

class PayPalService:
    _cached_token: Optional[str] = None
    _token_expiry_timestamp: float = 0.0

    @staticmethod
    def is_configured() -> bool:
        client_id = settings.PAYPAL_CLIENT_ID or os.environ.get("PAYPAL_CLIENT_ID")
        client_secret = settings.PAYPAL_CLIENT_SECRET or os.environ.get("PAYPAL_CLIENT_SECRET")
        return bool(client_id and client_secret and client_id.strip() and client_secret.strip())

    @staticmethod
    async def get_access_token() -> Tuple[Optional[str], Optional[str]]:
        """
        Retrieves real OAuth 2.0 access token from PayPal Sandbox endpoint.
        POST https://api-m.sandbox.paypal.com/v1/oauth2/token
        Caches access token until expiration.
        """
        if not PayPalService.is_configured():
            return None, "CONFIGURATION_REQUIRED: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set."

        # Return cached token if still valid (with 60-second safety margin)
        now = time.time()
        if PayPalService._cached_token and now < PayPalService._token_expiry_timestamp - 60:
            return PayPalService._cached_token, None

        client_id = settings.PAYPAL_CLIENT_ID or os.environ.get("PAYPAL_CLIENT_ID")
        client_secret = settings.PAYPAL_CLIENT_SECRET or os.environ.get("PAYPAL_CLIENT_SECRET")
        token_url = f"{settings.PAYPAL_SANDBOX_URL}/v1/oauth2/token"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    token_url,
                    auth=(client_id, client_secret),
                    data={"grant_type": "client_credentials"},
                    headers={"Accept": "application/json", "Accept-Language": "en_US"}
                )

                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    expires_in = data.get("expires_in", 3600)
                    PayPalService._cached_token = token
                    PayPalService._token_expiry_timestamp = now + expires_in
                    return token, None
                elif response.status_code == 401:
                    return None, f"INVALID_CREDENTIALS: PayPal rejected Client ID or Secret (HTTP 401 Unauthorized)."
                else:
                    return None, f"AUTH_ERROR (HTTP {response.status_code}): {response.text}"

        except httpx.TimeoutException:
            return None, "TIMEOUT: Connection to PayPal Sandbox timed out."
        except httpx.RequestError as e:
            return None, f"NETWORK_ERROR: Unable to reach PayPal Sandbox ({str(e)})."
        except Exception as e:
            return None, f"UNEXPECTED_ERROR: {str(e)}"

    @staticmethod
    async def check_connection() -> Dict[str, Any]:
        """
        Genuinely attempts PayPal Sandbox OAuth token request.
        Only returns 'CONNECTED' when actual Sandbox authentication succeeds.
        """
        if not PayPalService.is_configured():
            return {
                "status": "CONFIGURATION_REQUIRED",
                "message": "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured in .env.",
                "endpoint": settings.PAYPAL_SANDBOX_URL,
                "is_connected": False,
                "last_checked": datetime.utcnow().isoformat() + "Z"
            }

        token, error = await PayPalService.get_access_token()
        if token:
            return {
                "status": "CONNECTED",
                "message": "Successfully authenticated with PayPal Sandbox API.",
                "endpoint": settings.PAYPAL_SANDBOX_URL,
                "is_connected": True,
                "last_checked": datetime.utcnow().isoformat() + "Z"
            }
        else:
            return {
                "status": "CONNECTION_ERROR",
                "message": error or "Authentication failed.",
                "endpoint": settings.PAYPAL_SANDBOX_URL,
                "is_connected": False,
                "last_checked": datetime.utcnow().isoformat() + "Z"
            }

    @staticmethod
    async def verify_webhook_signature(
        headers: Dict[str, str],
        webhook_event: Dict[str, Any],
        webhook_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls official PayPal Sandbox API to verify a webhook signature:
        POST https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature
        """
        start_time = time.time()
        token, error = await PayPalService.get_access_token()

        if not token:
            return {
                "status": 503,
                "verified": False,
                "verification_status": "CONFIGURATION_REQUIRED",
                "error": error or "PayPal credentials required to execute live Sandbox verification.",
                "duration_ms": int((time.time() - start_time) * 1000)
            }

        effective_webhook_id = webhook_id or settings.PAYPAL_WEBHOOK_ID or os.environ.get("PAYPAL_WEBHOOK_ID")
        if not effective_webhook_id:
            return {
                "status": 400,
                "verified": False,
                "verification_status": "CONFIGURATION_REQUIRED",
                "error": "PAYPAL_WEBHOOK_ID not provided. Webhook ID must be registered in the PayPal Developer Dashboard.",
                "duration_ms": int((time.time() - start_time) * 1000)
            }

        # Format payload strictly adhering to PayPal API specification
        req_payload = {
            "auth_algo": headers.get("PAYPAL-AUTH-ALGO") or headers.get("paypal-auth-algo", "SHA256withRSA"),
            "cert_url": headers.get("PAYPAL-CERT-URL") or headers.get("paypal-cert-url", ""),
            "transmission_id": headers.get("PAYPAL-TRANSMISSION-ID") or headers.get("paypal-transmission-id", ""),
            "transmission_sig": headers.get("PAYPAL-TRANSMISSION-SIG") or headers.get("paypal-transmission-sig", ""),
            "transmission_time": headers.get("PAYPAL-TRANSMISSION-TIME") or headers.get("paypal-transmission-time", ""),
            "webhook_id": effective_webhook_id,
            "webhook_event": webhook_event
        }

        endpoint = f"{settings.PAYPAL_SANDBOX_URL}/v1/notifications/verify-webhook-signature"

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    endpoint,
                    json=req_payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                duration_ms = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    body = res.json()
                    verif_status = body.get("verification_status")  # 'SUCCESS' or 'FAILURE'
                    is_verified = (verif_status == "SUCCESS")
                    return {
                        "status": 200,
                        "verified": is_verified,
                        "verification_status": verif_status,
                        "duration_ms": duration_ms,
                        "raw_response": body
                    }
                else:
                    return {
                        "status": res.status_code,
                        "verified": False,
                        "verification_status": "API_ERROR",
                        "error": res.text,
                        "duration_ms": duration_ms
                    }

        except Exception as e:
            return {
                "status": 500,
                "verified": False,
                "verification_status": "REQUEST_FAILED",
                "error": str(e),
                "duration_ms": int((time.time() - start_time) * 1000)
            }
