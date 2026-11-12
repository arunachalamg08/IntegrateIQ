import { ScenarioDefinition } from '../types';

export const MOCK_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'wh-signature',
    name: 'Webhook Signature Verification Failure',
    shortDescription:
      'Incoming PayPal webhook events fail cryptographic signature verification due to mismatched webhook ID and raw body mutation.',
    exampleSymptom:
      'HTTP 400 Bad Request — PayPal webhook listener returns "Signature verification failed" for genuine events.',
    difficulty: 'Medium',
    iconName: 'ShieldAlert',
    rootCauseSummary:
      'The configured WEBHOOK_ID environment variable does not match the active PayPal dashboard listener, and express.json() mutated the raw payload buffer.',
    affectedFile: 'src/services/paypalWebhookVerifier.js',
    targetEndpoint: 'POST /api/webhooks/paypal',
    categories: ['Security', 'Configuration Tests', 'Negative Tests'],
    fullDescription:
      'PayPal webhooks require verifying the transmission signature headers (PAYPAL-TRANSMISSION-SIG, PAYPAL-CERT-URL, PAYPAL-AUTH-ALGO) against the raw request body and the exact webhook ID registered in the developer console. When the webhook ID is mismatched or express body parser re-serializes JSON, SHA256 hashes diverge.',
    expectedOutcome:
      'Webhook listener safely verifies authenticity, rejects forged signatures with HTTP 400, and returns HTTP 200 for valid events.',
    availability: 'Available in Demo',
    testCases: [
      {
        id: 'tc-wh-01',
        name: 'Correct configuration & valid signature accepted',
        category: 'Positive Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 42,
        description: 'Verify genuine PayPal webhook event with valid CRC32 and SHA256 transmission signature.',
        observedOutput: 'Baseline: CRC32 checksum mismatch (expected 0x8a92f, got 0x00000). Fixed: Signature validated against PayPal cert.'
      },
      {
        id: 'tc-wh-02',
        name: 'Incorrect webhook ID rejected with security event',
        category: 'Negative Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 38,
        description: 'Ensure events signed with foreign or malformed webhook IDs are rejected gracefully.',
        observedOutput: 'Baseline: Silent failure with unhandled rejection. Fixed: Handled 401 Unauthorized with security audit log.'
      },
      {
        id: 'tc-wh-03',
        name: 'Raw request body preserved without JSON re-serialization',
        category: 'Configuration Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 25,
        description: 'Confirm raw Buffer payload is preserved across middleware before JSON parsing.',
        observedOutput: 'Buffer length 1048 bytes preserved intact.'
      },
      {
        id: 'tc-wh-04',
        name: 'Verification error handled safely without server crash',
        category: 'Regression Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 19,
        description: 'Confirm corrupted headers do not trigger uncaught exception or crash the Node process.',
        observedOutput: 'Returned HTTP 400 with structured JSON error payload.'
      }
    ]
  },
  {
    id: 'idempotency-retry',
    name: 'Request Idempotency and Retry Failure',
    shortDescription:
      'Missing or reused PayPal-Request-Id header triggers 422 UNPROCESSABLE_ENTITY on network timeout retries.',
    exampleSymptom:
      'Duplicate payment attempts occur when network drops, or retries fail with "DUPLICATE_REQUEST_ID".',
    difficulty: 'High',
    iconName: 'RefreshCw',
    rootCauseSummary:
      'Payment capture client generated a new UUID on retries instead of reusing the deterministic idempotency key for the transaction intent.',
    affectedFile: 'src/services/paymentCaptureClient.js',
    targetEndpoint: 'POST /v2/checkout/orders/{id}/capture',
    categories: ['Positive Tests', 'Regression Tests'],
    fullDescription:
      'PayPal requires the PayPal-Request-Id header to guarantee idempotent order creation and captures. If a client generates a new key during an automatic retry or reuses an old key across different transactions, PayPal rejects the request with HTTP 422.',
    expectedOutcome:
      'Consistent UUID generation scoped per order intent, with cached recovery responses on network retries.',
    availability: 'Available in Demo',
    testCases: [
      {
        id: 'tc-id-01',
        name: 'Unique PayPal-Request-Id generated per new checkout intent',
        category: 'Positive Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 31,
        description: 'Verify distinct transactions receive distinct UUIDv4 idempotency keys.',
        observedOutput: 'Header PayPal-Request-Id generated: uuid-v4 compliant.'
      },
      {
        id: 'tc-id-02',
        name: 'Deterministic key reuse during 504 Gateway Timeout retry',
        category: 'Regression Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 65,
        description: 'Verify retrying a timed-out capture request preserves the original request ID.',
        observedOutput: 'Baseline: New UUID generated on retry #1. Fixed: Preserved idempotency key wh-req-88912.'
      },
      {
        id: 'tc-id-03',
        name: 'Graceful handling of 422 DUPLICATE_REQUEST_ID response',
        category: 'Negative Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 44,
        description: 'Verify client queries order status when PayPal reports key collision.',
        observedOutput: 'Baseline: Crashed on 422. Fixed: Fallback status lookup executed.'
      },
      {
        id: 'tc-id-04',
        name: 'Concurrent capture requests deduplicated in memory',
        category: 'Configuration Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 28,
        description: 'Verify rapid double-clicks on submit do not launch parallel requests.',
        observedOutput: 'Single inflight promise resolved for both clicks.'
      }
    ]
  },
  {
    id: 'env-mismatch',
    name: 'Sandbox and Production Configuration Mismatch',
    shortDescription:
      'Incorrect environment endpoint configuration causes OAuth authentication failure with invalid client credentials.',
    exampleSymptom:
      'HTTP 401 Unauthorized — "invalid_client" returned when connecting to PayPal REST API.',
    difficulty: 'Low',
    iconName: 'ServerCrash',
    rootCauseSummary:
      'PAYPAL_ENV is set to "sandbox" but baseUrl is hardcoded to "https://api-m.paypal.com" (live production).',
    affectedFile: 'src/config/paypalEnvironment.js',
    targetEndpoint: 'POST /v1/oauth2/token',
    categories: ['Configuration Tests', 'Positive Tests'],
    fullDescription:
      'PayPal maintains separate endpoint hosts for Sandbox (api-m.sandbox.paypal.com) and Live (api-m.paypal.com). Mismatching sandbox client credentials against the production host results in immediate token failure.',
    expectedOutcome:
      'Client dynamically resolves host based on PAYPAL_ENV with strict assertion preventing live endpoint usage in staging.',
    availability: 'Available in Demo',
    testCases: [
      {
        id: 'tc-env-01',
        name: 'Resolves to api-m.sandbox.paypal.com when NODE_ENV is development',
        category: 'Positive Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 20,
        description: 'Verify endpoint resolution helper returns sandbox URL for non-production environments.',
        observedOutput: 'Baseline: Returned https://api-m.paypal.com. Fixed: Returned https://api-m.sandbox.paypal.com.'
      },
      {
        id: 'tc-env-02',
        name: 'OAuth token request accepted by mock sandbox endpoint',
        category: 'Positive Tests',
        baselineResult: 'fail',
        afterFixResult: 'pass',
        durationMs: 52,
        description: 'Simulated OAuth client credentials exchange against sandbox server.',
        observedOutput: 'Baseline: 401 invalid_client. Fixed: 200 OK with mock access_token.'
      },
      {
        id: 'tc-env-03',
        name: 'Production credential pattern rejection in development mode',
        category: 'Configuration Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 18,
        description: 'Safety check blocks client initialization if live keys detected in local .env.',
        observedOutput: 'Safety validator passed.'
      },
      {
        id: 'tc-env-04',
        name: 'Endpoint timeout setting configured properly',
        category: 'Regression Tests',
        baselineResult: 'pass',
        afterFixResult: 'pass',
        durationMs: 15,
        description: 'Ensure axios/fetch timeout is set to 10000ms to prevent hanging connections.',
        observedOutput: 'Timeout verified at 10000ms.'
      }
    ]
  }
];

export const CATALOGUE_ADDITIONAL_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'wh-signature', // reference
    name: 'Webhook Certificate Domain Validation',
    shortDescription:
      'Strict checking to ensure PAYPAL-CERT-URL originates from trusted *.paypal.com domain before downloading X.509 cert.',
    exampleSymptom: 'Security alert: Outgoing HTTP request to untrusted external host during signature verification.',
    difficulty: 'High',
    iconName: 'Lock',
    rootCauseSummary: 'Missing regex validation on PAYPAL-CERT-URL header allowed SSRF vulnerability.',
    affectedFile: 'src/security/certValidator.js',
    targetEndpoint: 'GET https://api.paypal.com/v1/notifications/certs/*',
    categories: ['Negative Tests', 'Configuration Tests'],
    fullDescription: 'PayPal security guidelines mandate verifying that the cert URL matches ^https://api\\.paypal\\.com/ or sandbox equivalents before attempting download.',
    expectedOutcome: 'Rejection of any cert URL not strictly matching official PayPal domains.',
    availability: 'Mock Catalogue',
    testCases: []
  },
  {
    id: 'idempotency-retry',
    name: 'Currency Precision & Amount Formatting',
    shortDescription:
      'PayPal rejects payment capture with 400 INVALID_PARAMETER when decimal places exceed ISO 4217 specifications.',
    exampleSymptom: 'HTTP 400 Bad Request: "DECIMAL_PRECISION_EXCEEDED" on JPY or EUR captures.',
    difficulty: 'Low',
    iconName: 'Coins',
    rootCauseSummary: 'Floating point rounding caused currency strings like "10.000000000000002" instead of "10.00".',
    affectedFile: 'src/utils/currencyFormatter.js',
    targetEndpoint: 'POST /v2/checkout/orders',
    categories: ['Positive Tests', 'Regression Tests'],
    fullDescription: 'Currencies like JPY require 0 decimal places, while USD and EUR require exactly 2 decimal places in PayPal payload values.',
    expectedOutcome: 'Deterministic string formatting complying with ISO currency decimal rules.',
    availability: 'Mock Catalogue',
    testCases: []
  }
];
