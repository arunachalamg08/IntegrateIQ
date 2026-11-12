# IntegrateIQ — Problem Statement

---

## 1. The Real-World Pain Point

Integrating PayPal into modern web applications requires navigating strict cryptographic and architectural standards:
- **Asymmetric Webhook Verification:** Verifying `PAYPAL-TRANSMISSION-SIG` requires calculating a CRC32 checksum over the unmutated raw request byte stream, reconstructing a pipe-delimited transmission string, and verifying an RSA SHA256 signature against PayPal's public certificate. Standard body-parsing middleware (`express.json()`, `body-parser`, Pydantic serializers) re-orders keys or normalizes whitespace, silently breaking checksum calculations.
- **Idempotency Hazards:** Retrying timed-out payment capture requests without properly reusing `PayPal-Request-Id` leads to HTTP 422 `DUPLICATE_REQUEST_ID` errors or, worse, double charges.
- **Environment Discrepancies:** Accidental mixing of sandbox credentials with live production gateway URLs (`api-m.paypal.com`) causes obscure `invalid_client` HTTP 401 rejections.

---

## 2. The AI Reliability Dilemma

When integration issues arise, developers increasingly turn to AI tools (GitHub Copilot, Cursor, ChatGPT). However:
1. **AI Cannot Run Your Code:** General LLMs cannot execute your integration against the PayPal Sandbox or run local test suites.
2. **Circular Self-Assessment:** If an AI proposes a code change, asking it "Is this correct?" yields a confident "Yes", regardless of whether the code actually satisfies cryptographic constraints.
3. **Silent Regressions:** A fix that addresses a webhook signature failure may inadvertently break downstream JSON consumption in order fulfillment handlers.
4. **No Audit Trail:** Regulated financial systems require documented proof that fixes were tested and verified prior to production deployment.

---

## 3. The IntegrateIQ Solution

IntegrateIQ replaces blind trust in generative AI with **empirical verification**:
- The AI proposes candidates.
- The human developer reviews risk and approves.
- An independent, deterministic test runner decides whether the integration actually works.
