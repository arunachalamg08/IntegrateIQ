import {
  ErrorReport,
  RemediationAction,
  ScenarioId
} from '../types';

// ─────────────────────────────────────────────
// Remediation Actions
// ─────────────────────────────────────────────

function makeRemediationActions(sessionId: string, type: 'webhook' | 'idempotency' | 'env'): RemediationAction[] {
  const now = new Date().toISOString();
  if (type === 'webhook') {
    return [
      {
        id: `${sessionId}-RA-01`,
        title: 'Open PayPal Developer Dashboard',
        description: 'Navigate to developer.paypal.com and select your Sandbox application.',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'The webhook ID in .env does not match the registered listener.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-02`,
        title: 'Locate correct Webhook ID',
        description: 'Under Webhooks, copy the exact Webhook ID assigned to your endpoint (format: WH-XXXXXXXXXXXXXX).',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Mismatched webhook ID causes SHA-256 signature validation to fail every time.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-03`,
        title: 'Update PAYPAL_WEBHOOK_ID in environment file',
        description: 'Replace the stale WH-STALE-OLD-001 fallback with the correct Webhook ID in your .env file.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'The environment fallback is used when the variable is not set.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-04`,
        title: 'Ensure raw body buffer is preserved before JSON parsing',
        description: 'Add a rawBody capture middleware before express.json() runs. See patch diff for exact implementation.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'AI_SUGGESTION',
        reason: 'JSON.stringify(req.body) reorders keys and strips whitespace, changing the CRC32 hash.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-05`,
        title: 'Reproduce the original failure using IntegrateIQ workspace',
        description: 'Click "Reproduce Failure" in the Debug Workspace to confirm the error is still present before applying any fix.',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Verification baseline must be established before the patch is applied.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-06`,
        title: 'Run automated verification suite after patch approval',
        description: 'After approving the patch in the Patch Review page, run the verification suite from the Debug Workspace.',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'The test suite confirms the actual PayPal verification result is successful.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-07`,
        title: 'Do NOT change production webhook settings during Sandbox debugging',
        description: 'All changes should target the Sandbox application only until full verification is complete.',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Modifying production webhooks during debugging can disrupt live transactions.',
        createdAt: now
      }
    ];
  } else if (type === 'idempotency') {
    return [
      {
        id: `${sessionId}-RA-01`,
        title: 'Identify the idempotency key generation point',
        description: 'Locate where PayPal-Request-Id is generated in your capture retry logic (paymentCaptureClient.js line 42).',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'A new UUID generated per retry attempt triggers DUPLICATE_REQUEST_ID.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-02`,
        title: 'Bind idempotency key to order intent before the retry loop',
        description: 'Generate the key once using order ID + timestamp and pass it into all retry attempts.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'AI_SUGGESTION',
        reason: 'The key must remain constant across all retry attempts for the same order.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-03`,
        title: 'Review PayPal idempotency TTL policy',
        description: 'PayPal idempotency keys expire after a fixed window. Ensure the retry window does not exceed this limit.',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        sourceType: 'AI_SUGGESTION',
        reason: 'Expired idempotency keys will cause new requests that may result in double capture.',
        createdAt: now
      }
    ];
  } else {
    return [
      {
        id: `${sessionId}-RA-01`,
        title: 'Audit environment configuration files',
        description: 'Verify PAYPAL_ENV is set to "sandbox" in your development .env file.',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'The API base URL must point to api-m.sandbox.paypal.com for sandbox credentials.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-02`,
        title: 'Replace hardcoded production URL with environment-conditional logic',
        description: 'See patch diff — switch baseUrl to check process.env.PAYPAL_ENV === "production".',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Sandbox Client ID/Secret are rejected by the production endpoint.',
        createdAt: now
      },
      {
        id: `${sessionId}-RA-03`,
        title: 'Verify sandbox credentials in PayPal Developer Portal',
        description: 'Confirm the Client ID and Secret belong to the correct Sandbox application.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Sandbox and Production credentials are separate and non-interchangeable.',
        createdAt: now
      }
    ];
  }
}

// ─────────────────────────────────────────────
// Error Reports (simulated failures during debugging)
// ─────────────────────────────────────────────

export const INITIAL_ERROR_REPORTS: ErrorReport[] = [
  {
    id: 'ERR-2026-WH-1035',
    sessionId: 'SES-2026-PAYPAL-1035',
    category: 'ERROR',
    severity: 'HIGH',
    title: 'Webhook Signature Verification — HTTP 400 Failure',
    scenarioName: 'Webhook Signature Verification Failure',
    scenarioId: 'wh-signature' as ScenarioId,
    description:
      'The PayPal webhook listener returned HTTP 400 Bad Request for a valid PAYMENT.CAPTURE.COMPLETED event. Cryptographic signature verification failed due to stale webhook ID and raw body mutation by JSON middleware.',
    errorCategory: 'Cryptographic Signature Mismatch',
    errorMessage: 'Webhook signature verification failed: computed hash 0x00000 does not match transmitted SHA256 0x8a92f',
    affectedComponent: 'PayPal Webhook Verification Middleware',
    affectedFile: 'src/services/paypalWebhookVerifier.js',
    affectedFunction: 'verifyPayPalWebhookSignature()',
    observedEvidence:
      'Simulated listener returned HTTP 400. PAYPAL-TRANSMISSION-SIG header was present and well-formed. req.rawBody was undefined at verification time. Fallback WEBHOOK_ID was WH-STALE-OLD-001.',
    confirmedCause: undefined,
    aiHypothesis:
      'The webhook ID environment fallback (WH-STALE-OLD-001) does not match the active PayPal sandbox registered listener (WH-9LA78291KL098234). Additionally, express.json() pre-parsed the body before the verification helper, causing JSON.stringify(req.body) to produce a different byte sequence than the original payload.',
    aiConfidenceLabel: 'High Confidence — 94.2% (Simulated AI Model)',
    missingEvidence: 'Actual PayPal SDK verification call not executed (Simulated prototype). Real sandbox test not performed.',
    remediationActions: makeRemediationActions('ERR-2026-WH-1035', 'webhook'),
    executionMode: 'SIMULATED',
    createdAt: '2026-10-18T07:08:11.000Z',
    status: 'OPEN',
    patchId: 'PATCH-PP-SIG-001'
  },
  {
    id: 'ERR-2026-IDEM-1039-FAIL',
    sessionId: 'SES-2026-PAYPAL-1039',
    category: 'VERIFICATION_FAIL',
    severity: 'HIGH',
    title: 'Failed Verification — Idempotency Key Not Retained on Retry',
    scenarioName: 'PayPal Idempotency and Retry Failure',
    scenarioId: 'idempotency-retry' as ScenarioId,
    description:
      'The proposed patch for idempotency key retention was verified against the test suite. Test tc-idem-01 (idempotency key stability across retries) failed. The fix did not fully resolve the key regeneration issue.',
    errorCategory: 'Idempotency Contract Violation',
    errorMessage: 'UNPROCESSABLE_ENTITY: DUPLICATE_REQUEST_ID — Key order-5O190127TN364715T-1731234567890 already exists for a completed capture',
    affectedComponent: 'Payment Capture Client — Retry Handler',
    affectedFile: 'src/services/paymentCaptureClient.js',
    affectedFunction: 'captureOrderWithRetry()',
    observedEvidence:
      'Baseline: 2/4 tests failed. Post-patch: tc-idem-01 still fails. The idempotency key was correctly stabilized but Date.now() jitter in key generation caused a new key on second attempt.',
    confirmedCause: 'Date.now() inside the idempotency key generator produces different values on rapid retries within the same millisecond window.',
    aiHypothesis:
      'Replace Date.now() with a hash of the order ID and amount value to produce a fully deterministic key that is stable across retries regardless of timing.',
    aiConfidenceLabel: 'Medium Confidence — 78.1% (Simulated AI Model)',
    missingEvidence: 'No actual PayPal sandbox retry test executed.',
    remediationActions: makeRemediationActions('ERR-2026-IDEM-1039-FAIL', 'idempotency'),
    executionMode: 'SIMULATED',
    createdAt: '2026-11-01T14:22:08.000Z',
    status: 'IN_PROGRESS',
    patchId: 'PATCH-PP-IDEM-002',
    patchSha256: 'sha256:3c8b9e2f1d7a4b6c5e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    baselineTestResults: { passed: 2, failed: 2, total: 4 },
    afterFixTestResults: { passed: 3, failed: 1, total: 4 },
    failedTests: ['tc-idem-01: Idempotency key stable across retry attempts'],
    newRegressions: [],
    exactFailureMessages: [
      'AssertionError: Expected PayPal-Request-Id to equal "order-5O190127TN364715T-1730000000000" but got "order-5O190127TN364715T-1731234567890"'
    ],
    relevantLogs: [
      '[paymentCaptureClient] Attempt 1: PayPal-Request-Id = order-5O190127TN364715T-1730000000000',
      '[paymentCaptureClient] Attempt 2: PayPal-Request-Id = order-5O190127TN364715T-1731234567890 ← CHANGED'
    ],
    exitCode: 1
  },
  {
    id: 'ERR-2026-ENV-1028',
    sessionId: 'SES-2026-PAYPAL-1028',
    category: 'INCONCLUSIVE',
    severity: 'MEDIUM',
    title: 'Inconclusive — Environment Mismatch Verification Incomplete',
    scenarioName: 'Sandbox/Production Environment Mismatch',
    scenarioId: 'env-mismatch' as ScenarioId,
    description:
      'Verification could not reach a conclusive verdict. The diagnosis was generated but the patch was not approved. No test execution occurred.',
    errorCategory: 'Environment Configuration Error',
    errorMessage: 'invalid_client: Client Authentication failed — 401 Unauthorized',
    affectedComponent: 'PayPal API Client — Environment Configuration',
    affectedFile: 'src/config/paypalEnvironment.js',
    affectedFunction: 'getPayPalApiHost()',
    observedEvidence: 'HTTP 401 from api-m.paypal.com with Sandbox credentials. Sandbox endpoint not contacted.',
    confirmedCause: undefined,
    aiHypothesis: 'Hardcoded production baseUrl was used for all environments. Sandbox Client ID rejected by production endpoint.',
    aiConfidenceLabel: 'High Confidence — 98.0% (Simulated AI Model)',
    missingEvidence: 'Patch not approved. Test suite not executed. Verification could not proceed.',
    remediationActions: makeRemediationActions('ERR-2026-ENV-1028', 'env'),
    executionMode: 'SIMULATED',
    createdAt: '2026-11-10T09:14:33.000Z',
    status: 'OPEN',
    whatWasAttempted: 'Failure reproduction was completed. AI diagnosis was generated. Patch proposal was ready.',
    whatExecuted: 'Failure reproduction: HTTP 401 response simulated. AI diagnosis: Root cause identified.',
    whatDidNotExecute: 'Patch approval gate not completed. Verification test suite not run.',
    whyInconclusiveReason: 'Developer did not complete the patch review and approval step before the session was left pending.'
  }
];

// ─────────────────────────────────────────────
// Successful Verification Report (supplemental to session-attached reports)
// ─────────────────────────────────────────────

export const INITIAL_SUCCESS_REPORTS: ErrorReport[] = [
  {
    id: 'REP-2026-PAYPAL-1042',
    sessionId: 'SES-2026-PAYPAL-1042',
    category: 'VERIFICATION_PASS',
    severity: 'INFO',
    title: 'Successful Verification — Webhook Signature Fix Confirmed',
    scenarioName: 'Webhook Signature Verification Failure',
    scenarioId: 'wh-signature' as ScenarioId,
    description:
      'All 4 contract assertions passed after applying PATCH-PP-SIG-001. Original defect resolved. No regressions detected.',
    errorCategory: 'Cryptographic Signature Mismatch (Resolved)',
    errorMessage: 'No errors — verification PASSED.',
    affectedComponent: 'PayPal Webhook Verification Middleware',
    affectedFile: 'src/services/paypalWebhookVerifier.js',
    affectedFunction: 'verifyPayPalWebhookSignature()',
    observedEvidence: 'Baseline: 2/4 passed. Post-patch: 4/4 passed. Exit code 0.',
    confirmedCause: 'Stale WEBHOOK_ID and req.body re-serialization caused SHA-256 mismatch.',
    aiHypothesis: 'Fix: Synchronize webhook ID and use req.rawBody Buffer directly.',
    aiConfidenceLabel: 'Verified by Test Suite (Simulated)',
    remediationActions: [
      {
        id: 'REP-2026-PAYPAL-1042-RA-01',
        title: 'Review the final approved patch',
        description: 'Inspect PATCH-PP-SIG-001 in the Patch Review page to confirm changes are as expected.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Human review is required before any code is committed to version control.',
        createdAt: '2026-10-18T07:15:22.000Z'
      },
      {
        id: 'REP-2026-PAYPAL-1042-RA-02',
        title: 'Commit the approved change via your version control workflow',
        description: 'Create a feature branch, apply the patch, open a PR with this verification report as evidence.',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'The patch was verified against simulated fixtures only. Standard VCS review applies.',
        createdAt: '2026-10-18T07:15:22.000Z'
      },
      {
        id: 'REP-2026-PAYPAL-1042-RA-03',
        title: 'Perform staging environment checks before deployment',
        description: 'Run the full test suite against your actual PayPal Sandbox credentials in staging.',
        priority: 'CRITICAL',
        status: 'NOT_STARTED',
        sourceType: 'DETERMINISTIC',
        reason: 'Offline fixture tests do not substitute for real PayPal Sandbox verification.',
        createdAt: '2026-10-18T07:15:22.000Z'
      }
    ],
    executionMode: 'SIMULATED',
    createdAt: '2026-10-18T07:15:22.418Z',
    status: 'RESOLVED',
    patchId: 'PATCH-PP-SIG-001',
    patchSha256: 'sha256:7f9b8c4d2e1a3b5c6e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    baselineTestResults: { passed: 2, failed: 2, total: 4 },
    afterFixTestResults: { passed: 4, failed: 0, total: 4 },
    exitCode: 0
  }
];

export const ALL_MOCK_REPORTS: ErrorReport[] = [
  ...INITIAL_SUCCESS_REPORTS,
  ...INITIAL_ERROR_REPORTS
];
