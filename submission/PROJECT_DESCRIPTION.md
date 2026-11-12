# IntegrateIQ — Project Description

> **"From Integration Failure to Verified Fix — Before Deployment"**  
> *Core Principle: AI suggests, developers approve, independent tests decide.*

---

## 1. Executive Summary

**IntegrateIQ** is an AI-assisted PayPal integration debugging and verification platform designed to bridge the dangerous reliability gap between generative AI code suggestions and mission-critical payment workflows.

While modern AI coding tools excel at proposing quick code patches, financial integrations cannot be trusted on probabilistic model output alone. A syntax-valid patch might re-serialize raw request bodies, mangle cryptographic webhook transmission signatures, reuse idempotency keys, or cause silent regressions in untouched transaction flows.

IntegrateIQ establishes a **closed-loop verification workbench**:
1. **Reproduce:** Captures genuine failure traces and exit codes using isolated Pytest fixtures.
2. **AI Suggests:** Leverages **Google Gemini 2.5 Flash** to analyze actual error traces and propose minimal unified diff patches.
3. **Developer Gatekeeper:** Enforces explicit human approval with cryptographic SHA-256 patch hashing.
4. **Independent Tests Decide:** Executes automated regression suites in an isolated temporary sandbox.
5. **Proof:** Deterministic Python code generates evidence-backed verification reports downloadable in standalone HTML and JSON formats.

---

## 2. Key Capabilities

- **PayPal Sandbox Connection Inspector:** Real-time OAuth 2.0 handshake latency probe and credential validator targeting `https://api-m.sandbox.paypal.com`.
- **PayPal Webhook Verification Debugger:** Official REST schema listener (`POST /v1/notifications/verify-webhook-signature`) with delivery logs, raw header inspection, and tunnel setup guidance.
- **PayPal API Error Analyzer:** Deep-dive analysis of PayPal error codes (`INVALID_REQUEST`, `UNPROCESSABLE_ENTITY`, `AUTHENTICATION_FAILURE`) with Debug ID correlation, negative testing simulators, and Gemini root-cause breakdown.
- **Isolated Subprocess Test Runner:** Executes Pytest 9.1 in disposable temporary directories with 15s execution limits, never modifying source fixtures.
- **Patch-to-Proof Verification:** Cryptographic SHA-256 patch verification, baseline vs post-patch delta analysis, and zero-regression certification.
- **Real-Time Developer Experience:** Server-Sent Events (SSE) and WebSockets streaming live execution progress without synthetic delays.
