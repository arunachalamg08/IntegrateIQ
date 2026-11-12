# IntegrateIQ — PayPal Developer Platform Integration

---

## 1. Overview & Official API Endpoints

IntegrateIQ integrates directly with the **PayPal Developer Platform** using the official Sandbox REST API (`https://api-m.sandbox.paypal.com`):

| Endpoint | HTTP Method | Integration Purpose |
| :--- | :---: | :--- |
| `/v1/oauth2/token` | `POST` | Authenticates server-to-server credentials via OAuth 2.0 with in-memory token expiry caching. |
| `/v1/notifications/verify-webhook-signature` | `POST` | Validates asymmetric digital signatures on incoming webhook deliveries using PayPal's public cert. |
| `/v2/checkout/orders` | `POST` | Negative testing error simulation (currency precision validation). |
| `/v2/checkout/orders/{id}/capture` | `POST` | Negative testing error simulation (`PayPal-Request-Id` idempotency collision). |

---

## 2. Real Webhook Verification Schema

The backend formats verification requests strictly according to the official PayPal schema:
```json
{
  "auth_algo": "SHA256withRSA",
  "cert_url": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360",
  "transmission_id": "c1a403d0-a032-11ef-93a1-792187b92041",
  "transmission_sig": "MEQCIB1g9Lq...[RSA_SIGNATURE]...",
  "transmission_time": "2026-10-18T07:12:44Z",
  "webhook_id": "WH-9LA78291KL098234",
  "webhook_event": {
    "id": "WH-EVENT-1042",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": { ... }
  }
}
```

---

## 3. Genuine Sandbox Connection Check

Unlike mock dashboards that display "Connected" merely because an environment variable string exists, IntegrateIQ performs a real network handshake:
- Executes `POST /v1/oauth2/token` with HTTP Basic auth using `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
- Only renders the green **CONNECTED** status if PayPal responds with HTTP 200 OK and a valid `access_token`.
- Otherwise displays **CONFIGURATION REQUIRED** (if credentials are blank) or **AUTHENTICATION FAILED** (if credentials are rejected by PayPal).
- Captures exact round-trip network latency in milliseconds.
