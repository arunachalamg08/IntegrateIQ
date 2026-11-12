# IntegrateIQ — Known Limitations & Honest Scope Boundaries

In accordance with strict hackathon evaluation guidelines, IntegrateIQ transparently documents all architectural boundaries and limitations:

---

## 1. Gateway Scope Boundary: Sandbox Only
- **Production Blocked:** Production PayPal endpoints (`https://api-m.paypal.com`) are hard-coded as disabled. IntegrateIQ strictly communicates with `https://api-m.sandbox.paypal.com`.
- **Zero Real Money Movement:** No real credit cards, bank accounts, or financial transactions are processed.

---

## 2. Webhook Ingress & Localhost Reachability
- **Public URL Requirement:** PayPal's cloud webhook delivery engine cannot send HTTP POST requests directly to `http://localhost:3000` or `127.0.0.1:8000`.
- **Tunneling Requirement for Live Webhooks:** For live Sandbox webhook deliveries from the PayPal dashboard, developers must expose the listener using a secure tunnel (e.g. `cloudflared tunnel --url http://localhost:8000` or `ngrok http 8000`) and register that HTTPS URL in the PayPal Developer Dashboard.
- **Offline Contract Testing Mode:** When a live tunnel is not configured, IntegrateIQ provides full contract test coverage using deterministic, authentic cryptographic test fixtures.

---

## 3. Sandboxing & Code Execution Boundaries
- **Language Scope:** The current automated subprocess test runner supports Python/Pytest test fixtures. Node.js sample applications are analyzed statically and verified via their corresponding contract specifications.
- **Isolated Working Copies:** All patches are applied to temporary directory workspaces. The original source fixtures in `backend/fixtures/` remain unchanged.
- **No Automatic Production Deployment:** IntegrateIQ verifies code patches and exports evidence reports; it intentionally does **not** auto-deploy code to cloud production environments without explicit human engineering review.
