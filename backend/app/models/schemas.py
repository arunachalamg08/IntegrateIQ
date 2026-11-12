from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Scenarios
ScenarioId = Literal['wh-signature', 'idempotency-retry', 'env-mismatch']
ScenarioDifficulty = Literal['Low', 'Medium', 'High']
ScenarioCategory = Literal[
    'Positive Tests',
    'Negative Tests',
    'Regression Tests',
    'Configuration Tests',
    'Security'
]

class TestCase(BaseModel):
    id: str
    name: str
    category: ScenarioCategory
    baselineResult: Literal['pass', 'fail']
    afterFixResult: Literal['pass', 'fail', 'pending'] = 'pending'
    durationMs: int = 0
    description: str
    observedOutput: str

class ScenarioDefinition(BaseModel):
    id: ScenarioId
    name: str
    shortDescription: str
    exampleSymptom: str
    difficulty: ScenarioDifficulty
    iconName: str
    rootCauseSummary: str
    affectedFile: str
    targetEndpoint: str
    categories: List[ScenarioCategory]
    fullDescription: str
    expectedOutcome: str
    availability: Literal['Available in Demo', 'Mock Catalogue', 'Available Live']
    testCases: List[TestCase]

# Workflow & Execution
class FailureReproduction(BaseModel):
    eventId: str
    eventType: str
    simulatedStatus: int
    simulatedError: str
    headers: Dict[str, str]
    payloadJson: str
    expectedBehavior: str
    observedDemoBehavior: str
    actualExitCode: Optional[int] = None
    actualStdout: Optional[str] = None
    actualStderr: Optional[str] = None
    executionMode: Literal['OFFLINE_CONTRACT_TEST', 'PAYPAL_SANDBOX_INTEGRATION_TEST'] = 'OFFLINE_CONTRACT_TEST'

class AIDiagnosisFileRef(BaseModel):
    file: str
    line: int
    snippet: Optional[str] = None

class AIDiagnosis(BaseModel):
    probableRootCause: str
    supportingEvidence: str
    fileReferences: List[AIDiagnosisFileRef]
    confidenceLabel: str
    confidencePercentage: float
    alternativeHypotheses: List[str]
    recommendedNextStep: str
    simulatedNote: Optional[str] = None
    provider: str = "Google Gemini"
    model: str = "gemini-2.5-flash"
    promptTokens: Optional[int] = None
    completionTokens: Optional[int] = None
    durationMs: Optional[int] = None
    isLiveAiResponse: bool = False

class CodeDiffLine(BaseModel):
    type: Literal['unchanged', 'addition', 'deletion']
    lineNumOriginal: Optional[int] = None
    lineNumProposed: Optional[int] = None
    content: str

class ProposedPatch(BaseModel):
    id: str
    filePath: str
    fileRevision: str
    explanation: str
    riskAssessment: Literal['Low Risk', 'Medium Risk', 'High Risk']
    riskDetails: str
    securityImplications: str
    potentialRegressions: str
    linesAdded: int
    linesRemoved: int
    diffLines: List[CodeDiffLine]
    originalCodeSnippet: str
    proposedCodeSnippet: str
    rawUnifiedDiff: Optional[str] = None
    sha256DigestBefore: Optional[str] = None
    sha256DigestAfter: Optional[str] = None
    isApplied: bool = False

SessionWorkflowStatus = Literal[
    'CREATED',
    'FAILURE_REPRODUCED',
    'DIAGNOSIS_READY',
    'PATCH_READY',
    'PATCH_APPROVED',
    'PATCH_REJECTED',
    'VERIFICATION_RUNNING',
    'VERIFICATION_COMPLETED',
    'VERIFICATION_FAILED',
    'VERIFICATION_INCONCLUSIVE'
]

PatchReviewStatus = Literal['PENDING', 'APPROVED', 'REJECTED']
FailureReproductionStatus = Literal['NOT_REPRODUCED', 'REPRODUCING', 'REPRODUCED', 'FAILED']
DiagnosisStatus = Literal['NOT_DIAGNOSED', 'DIAGNOSING', 'DIAGNOSED', 'FAILED']
VerificationMode = Literal['SIMULATED', 'LOCAL_FIXTURE', 'MOCK_API', 'PAYPAL_SANDBOX']
VerificationStatus = Literal['NOT_RUN', 'RUNNING', 'PASS', 'FAIL', 'INCONCLUSIVE']
FinalReportStatus = Literal['PASS', 'FAIL', 'INCONCLUSIVE']

class VerificationRun(BaseModel):
    id: str
    sessionId: str
    patchId: str
    mode: VerificationMode
    status: VerificationStatus
    timestamp: str
    testResults: List[TestCase]
    passedCount: int
    failedCount: int
    totalCount: int
    executionDisclaimer: str
    actualDurationMs: Optional[int] = None
    actualExitCode: Optional[int] = None
    rawStdout: Optional[str] = None
    rawStderr: Optional[str] = None

class VerificationEvidence(BaseModel):
    sessionId: str
    sourceRevision: str
    patchSha256Placeholder: str
    testSuiteIdentifier: str
    testRunTimestampPlaceholder: str
    individualTestResultsCount: int = 4
    exitCodePlaceholder: int
    verificationEnvironment: str
    integrityNotice: str

class VerificationReport(BaseModel):
    id: str
    sessionId: str
    scenarioId: ScenarioId
    scenarioName: str
    createdAt: str
    finalStatus: FinalReportStatus
    verificationLevel: str
    sandboxVerification: str
    productionVerification: str
    actualTestsExecuted: bool
    realPaymentProcessed: bool
    originalFailureSummary: str
    probableRootCause: str
    patchSummary: str
    baselineSummary: Dict[str, int]
    afterFixSummary: Dict[str, int]
    regressionChecks: List[Dict[str, Any]]
    limitations: List[str]
    evidence: VerificationEvidence

# Remediation & Error Reports
RemediationPriority = Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
RemediationStatus = Literal['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']
RemediationSourceType = Literal['DETERMINISTIC', 'AI_SUGGESTION']

class RemediationAction(BaseModel):
    id: str
    title: str
    description: str
    priority: RemediationPriority
    status: RemediationStatus
    sourceType: RemediationSourceType
    reason: str
    developerNotes: Optional[str] = None
    completedAt: Optional[str] = None
    createdAt: str

ErrorReportCategory = Literal['ERROR', 'VERIFICATION_PASS', 'VERIFICATION_FAIL', 'INCONCLUSIVE']
ReportSeverity = Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

class ErrorReport(BaseModel):
    id: str
    sessionId: str
    category: ErrorReportCategory
    severity: ReportSeverity
    title: str
    scenarioName: str
    scenarioId: ScenarioId
    description: str
    errorCategory: str
    errorMessage: str
    affectedComponent: str
    affectedFile: str
    affectedFunction: str
    observedEvidence: str
    confirmedCause: Optional[str] = None
    aiHypothesis: str
    aiConfidenceLabel: str
    missingEvidence: Optional[str] = None
    remediationActions: List[RemediationAction]
    executionMode: str
    createdAt: str
    status: Literal['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] = 'OPEN'
    patchId: Optional[str] = None
    patchSha256: Optional[str] = None
    baselineTestResults: Optional[Dict[str, int]] = None
    afterFixTestResults: Optional[Dict[str, int]] = None
    failedTests: Optional[List[str]] = None
    newRegressions: Optional[List[str]] = None
    exactFailureMessages: Optional[List[str]] = None
    relevantLogs: Optional[List[str]] = None
    exitCode: Optional[int] = None
    whatWasAttempted: Optional[str] = None
    whatExecuted: Optional[str] = None
    whatDidNotExecute: Optional[str] = None
    whyInconclusiveReason: Optional[str] = None

# Debug Session
class DebugSession(BaseModel):
    id: str
    scenarioId: ScenarioId
    scenarioName: str
    sampleApp: str = "PayPal Webhook Receiver — Python / FastAPI & Express"
    status: SessionWorkflowStatus = "CREATED"
    lastUpdated: str = "Just now"
    createdAt: str
    reproductionStatus: FailureReproductionStatus = "NOT_REPRODUCED"
    reproduction: Optional[FailureReproduction] = None
    diagnosisStatus: DiagnosisStatus = "NOT_DIAGNOSED"
    diagnosis: Optional[AIDiagnosis] = None
    patchId: Optional[str] = None
    patch: Optional[ProposedPatch] = None
    patchReviewStatus: PatchReviewStatus = "PENDING"
    verificationMode: VerificationMode = "LOCAL_FIXTURE"
    verificationStatus: VerificationStatus = "NOT_RUN"
    verificationProgress: Optional[int] = 0
    verificationRun: Optional[VerificationRun] = None
    reportId: Optional[str] = None
    report: Optional[VerificationReport] = None
    testCases: List[TestCase] = []
    isReproducing: Optional[bool] = False
    isDiagnosing: Optional[bool] = False
    isVerifying: Optional[bool] = False

# API Request/Response Models
class CreateSessionRequest(BaseModel):
    scenarioId: ScenarioId
    title: Optional[str] = None
    description: Optional[str] = None
    executionMode: Optional[str] = "OFFLINE"

class PatchApprovalRequest(BaseModel):
    notes: Optional[str] = None

class RemediationUpdateRequest(BaseModel):
    status: RemediationStatus
    developerNotes: Optional[str] = None

class DashboardSummary(BaseModel):
    totalSessions: int
    verifiedPass: int
    verifiedFail: int
    inconclusive: int
    pendingReview: int
    openDebugSessions: int
    recentSessions: List[DebugSession]
    geminiStatus: str
    paypalStatus: str
    testRunnerStatus: str
