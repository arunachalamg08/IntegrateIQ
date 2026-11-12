# IntegrateIQ — Google Gemini AI Integration

---

## 1. SDK & Model Selection

IntegrateIQ utilizes the official **Google Gen AI Python SDK** (`google-genai` version 2.33.0).

- **Primary Model:** `gemini-2.5-flash` (configurable via `GEMINI_MODEL` environment variable, supporting `gemini-3.8-flash` as models evolve).
- **Architecture Principle:** *AI suggests, developers approve, independent tests decide.*

---

## 2. Structured Prompt Construction

When failure reproduction completes, IntegrateIQ feeds real, empirical evidence to Gemini:
1. **Actual Pytest Failure Trace:** Exact assertions, traceback, exit codes, and stdout/stderr.
2. **Raw Header Dumps:** Transmission headers, auth algorithms, cert URLs.
3. **Target Fixture Source Code:** The exact lines of the handler under test.

Gemini returns a validated JSON object conforming to Pydantic schemas:
- `probableRootCause`: Root-cause identification.
- `supportingEvidence`: Empirical references from the test log.
- `fileReferences`: File paths, line numbers, and relevant snippets.
- `confidencePercentage`: Model confidence score.
- `alternativeHypotheses`: 2-3 secondary hypotheses for edge-case coverage.
- `recommendedNextStep`: Actionable developer guidance.
- `proposedPatch`: Unified diff (`--- a/file` / `+++ b/file`) with lines added/removed, explanation, and risk assessment.

---

## 3. Strict Boundary Controls & Honest Fallbacks

To ensure absolute safety and integrity:
1. **No Direct Code Execution:** Gemini cannot execute shell commands or modify filesystem files directly.
2. **No Secret Access:** Environment variables containing `GEMINI_API_KEY` and `PAYPAL_CLIENT_SECRET` are never included in prompts.
3. **No Verdict Authority:** Gemini cannot mark a session as "Verified" or "Pass".
4. **Honest Fallback Handling:** If `GEMINI_API_KEY` is not configured, or if quota exhaustion (HTTP 429) occurs, IntegrateIQ displays an honest status (`CONFIGURATION_REQUIRED` or `QUOTA_EXHAUSTED`) and uses a deterministic offline rule engine clearly labeled as `Deterministic Rule Engine (Gemini fallback)`. It **never fabricates an AI response**.
