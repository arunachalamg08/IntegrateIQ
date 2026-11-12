export type PageId =
  | 'overview'
  | 'scenarios'
  | 'new-session'
  | 'workspace'
  | 'debug-session'
  | 'paypal-inspector'
  | 'error-analyzer'
  | 'patch-review'
  | 'verification-results'
  | 'reports'
  | 'settings'
  | 'not-found';

export type ScenarioId = 'wh-signature' | 'idempotency-retry' | 'env-mismatch';

export type ScenarioDifficulty = 'Low' | 'Medium' | 'High';

export type ScenarioCategory =
  | 'Positive Tests'
  | 'Negative Tests'
  | 'Regression Tests'
  | 'Configuration Tests'
  | 'Security';

export interface TestCase {
  id: string;
  name: string;
  category: ScenarioCategory;
  baselineResult: 'pass' | 'fail';
  afterFixResult: 'pass' | 'fail' | 'pending';
  durationMs: number;
  description: string;
  observedOutput: string;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  shortDescription: string;
  exampleSymptom: string;
  difficulty: ScenarioDifficulty;
  iconName: string;
  rootCauseSummary: string;
  affectedFile: string;
  targetEndpoint: string;
  categories: ScenarioCategory[];
  fullDescription: string;
  expectedOutcome: string;
  availability: 'Available in Demo' | 'Mock Catalogue';
  testCases: TestCase[];
}

export interface FailureReproduction {
  eventId: string;
  eventType: string;
  simulatedStatus: number;
  simulatedError: string;
  headers: Record<string, string>;
  payloadJson: string;
  expectedBehavior: string;
  observedDemoBehavior: string;
  actualExitCode?: number;
  actualStdout?: string;
  actualStderr?: string;
  executionMode?: string;
}

export interface AIDiagnosis {
  probableRootCause: string;
  supportingEvidence: string;
  fileReferences: { file: string; line: number; snippet?: string }[];
  confidenceLabel: string;
  confidencePercentage: number;
  alternativeHypotheses: string[];
  recommendedNextStep: string;
  simulatedNote: string;
  provider?: string;
  model?: string;
  durationMs?: number;
  isLiveAiResponse?: boolean;
}

export interface CodeDiffLine {
  type: 'unchanged' | 'addition' | 'deletion';
  lineNumOriginal?: number;
  lineNumProposed?: number;
  content: string;
}

export interface ProposedPatch {
  id: string;
  filePath: string;
  fileRevision: string;
  explanation: string;
  riskAssessment: 'Low Risk' | 'Medium Risk' | 'High Risk';
  riskDetails: string;
  securityImplications: string;
  potentialRegressions: string;
  linesAdded: number;
  linesRemoved: number;
  diffLines: CodeDiffLine[];
  originalCodeSnippet: string;
  proposedCodeSnippet: string;
}

export type SessionWorkflowStatus =
  | 'CREATED'
  | 'FAILURE_REPRODUCED'
  | 'DIAGNOSIS_READY'
  | 'PATCH_READY'
  | 'PATCH_APPROVED'
  | 'PATCH_REJECTED'
  | 'VERIFICATION_RUNNING'
  | 'VERIFICATION_COMPLETED'
  | 'VERIFICATION_FAILED'
  | 'VERIFICATION_INCONCLUSIVE'
  // Legacy aliases for backward compatibility
  | 'INITIAL'
  | 'REPRODUCED'
  | 'DIAGNOSED'
  | 'PATCH_PROPOSED'
  | 'VERIFIED';

export type PatchReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FailureReproductionStatus = 'NOT_REPRODUCED' | 'REPRODUCING' | 'REPRODUCED' | 'FAILED';

export type DiagnosisStatus = 'NOT_DIAGNOSED' | 'DIAGNOSING' | 'DIAGNOSED' | 'FAILED';

export type VerificationMode =
  | 'SIMULATED'
  | 'LOCAL_FIXTURE'
  | 'MOCK_API'
  | 'PAYPAL_SANDBOX';

export type VerificationStatus =
  | 'NOT_RUN'
  | 'RUNNING'
  | 'PASS'
  | 'FAIL'
  | 'INCONCLUSIVE';

export type FinalReportStatus = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export interface VerificationRun {
  id: string;
  sessionId: string;
  patchId: string;
  mode: VerificationMode;
  status: VerificationStatus;
  timestamp: string;
  testResults: TestCase[];
  passedCount: number;
  failedCount: number;
  totalCount: number;
  executionDisclaimer: string;
  actualExitCode?: number;
  actualDurationMs?: number;
  rawStdout?: string;
  rawStderr?: string;
}

export interface VerificationEvidence {
  sessionId: string;
  sourceRevision: string;
  patchSha256Placeholder: string;
  testSuiteIdentifier: string;
  testRunTimestampPlaceholder: string;
  individualTestResultsCount: number;
  exitCodePlaceholder: number;
  verificationEnvironment: string;
  integrityNotice: string;
}

export interface VerificationReport {
  id: string;
  sessionId: string;
  scenarioId: ScenarioId;
  scenarioName: string;
  createdAt: string;
  finalStatus: FinalReportStatus;
  verificationLevel: string;
  sandboxVerification: string;
  productionVerification: string;
  actualTestsExecuted: boolean;
  realPaymentProcessed: boolean;
  originalFailureSummary: string;
  probableRootCause: string;
  patchSummary: string;
  baselineSummary: { passed: number; failed: number; total: number };
  afterFixSummary: { passed: number; failed: number; total: number };
  regressionChecks: {
    checkName: string;
    status: 'pass' | 'fail';
    description: string;
  }[];
  limitations: string[];
  evidence: VerificationEvidence;
}

export type RemediationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RemediationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type RemediationSourceType = 'DETERMINISTIC' | 'AI_SUGGESTION';

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  priority: RemediationPriority;
  status: RemediationStatus;
  sourceType: RemediationSourceType;
  reason: string;
  developerNotes?: string;
  completedAt?: string;
  createdAt: string;
}

export type ErrorReportCategory = 'ERROR' | 'VERIFICATION_PASS' | 'VERIFICATION_FAIL' | 'INCONCLUSIVE';
export type ReportSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ErrorReport {
  id: string;
  sessionId: string;
  category: ErrorReportCategory;
  severity: ReportSeverity;
  title: string;
  scenarioName: string;
  scenarioId: ScenarioId;
  description: string;
  errorCategory: string;
  errorMessage: string;
  affectedComponent: string;
  affectedFile: string;
  affectedFunction: string;
  observedEvidence: string;
  confirmedCause?: string;
  aiHypothesis: string;
  aiConfidenceLabel: string;
  missingEvidence?: string;
  remediationActions: RemediationAction[];
  executionMode: string;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  patchId?: string;
  patchSha256?: string;
  baselineTestResults?: { passed: number; failed: number; total: number };
  afterFixTestResults?: { passed: number; failed: number; total: number };
  failedTests?: string[];
  newRegressions?: string[];
  exactFailureMessages?: string[];
  relevantLogs?: string[];
  exitCode?: number;
  whatWasAttempted?: string;
  whatExecuted?: string;
  whatDidNotExecute?: string;
  whyInconclusiveReason?: string;
}

export interface DebugSession {
  id: string;
  scenarioId: ScenarioId;
  scenarioName: string;
  sampleApp: string;
  status: SessionWorkflowStatus;
  lastUpdated: string;
  createdAt: string;

  // Failure Reproduction
  reproductionStatus: FailureReproductionStatus;
  reproduction?: FailureReproduction;

  // AI Diagnosis
  diagnosisStatus: DiagnosisStatus;
  diagnosis?: AIDiagnosis;

  // Proposed Patch
  patchId?: string;
  patch?: ProposedPatch;
  patchReviewStatus: PatchReviewStatus;

  // Verification Run
  verificationMode: VerificationMode;
  verificationStatus: VerificationStatus;
  verificationProgress?: number;
  verificationRun?: VerificationRun;

  // Generated Report
  reportId?: string;
  report?: VerificationReport;

  // Active test cases
  testCases: TestCase[];

  // Helper flags
  isReproducing?: boolean;
  isDiagnosing?: boolean;
  isVerifying?: boolean;
}
