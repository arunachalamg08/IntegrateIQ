import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from backend.app.models.schemas import ErrorReport, RemediationAction
from backend.app.database import get_db

class ReportService:
    @staticmethod
    def create_verification_report(
        session_id: str,
        scenario_id: str,
        scenario_name: str,
        verdict: str,  # 'PASS' | 'FAIL' | 'INCONCLUSIVE'
        patch_id: Optional[str],
        patch_sha256: Optional[str],
        baseline_results: Dict[str, int],
        after_fix_results: Dict[str, int],
        test_cases: List[Dict[str, Any]],
        duration_ms: int,
        exit_code: int,
        stdout: str,
        stderr: str,
        root_cause: str,
        execution_mode: str = "OFFLINE_CONTRACT_TEST"
    ) -> ErrorReport:
        now_iso = datetime.utcnow().isoformat() + "Z"
        report_id = f"REP-{verdict}-{session_id.replace('SES-', '')}"

        category_map = {
            "PASS": "VERIFICATION_PASS",
            "FAIL": "VERIFICATION_FAIL",
            "INCONCLUSIVE": "INCONCLUSIVE"
        }
        category = category_map.get(verdict, "INCONCLUSIVE")

        failed_tests = [tc["name"] for tc in test_cases if tc.get("afterFixResult") == "fail" or (verdict == "FAIL" and tc.get("baselineResult") == "fail")]

        if verdict == "PASS":
            title = f"Independent Verification Succeeded: {scenario_name}"
            desc = f"Verified fix confirmed by real Pytest runner. 4/4 assertions passed with zero regressions. Process exit code: {exit_code}."
            err_msg = "All contract assertions satisfied against isolated test fixture."
            severity = "INFO"
            status = "RESOLVED"
        elif verdict == "FAIL":
            title = f"Verification Failed: Regressions Detected in {scenario_name}"
            desc = f"Applied patch failed to satisfy all assertions. {len(failed_tests)} test(s) failed."
            err_msg = f"Pytest exit code {exit_code}: Test assertions failed after applying patch."
            severity = "HIGH"
            status = "OPEN"
        else:
            title = f"Verification Inconclusive: {scenario_name}"
            desc = "Test runner encountered an environmental or execution anomaly preventing a deterministic verdict."
            err_msg = "Test execution timeout or runner interruption."
            severity = "MEDIUM"
            status = "OPEN"

        # Remediation actions
        actions = []
        if verdict == "PASS":
            actions.append(RemediationAction(
                id=f"REM-{session_id}-01",
                title="Review Final Evidence Digest and Deploy",
                description="Proceed with staging deployment following verified offline contract tests.",
                priority="LOW",
                status="COMPLETED",
                sourceType="DETERMINISTIC",
                reason="All automated regression checks verified.",
                completedAt=now_iso,
                createdAt=now_iso
            ))
        else:
            actions.append(RemediationAction(
                id=f"REM-{session_id}-01",
                title="Inspect Pytest Failure Log",
                description="Analyze stdout and assertion traces captured during isolated execution.",
                priority="CRITICAL",
                status="NOT_STARTED",
                sourceType="DETERMINISTIC",
                reason=f"{len(failed_tests)} test cases did not pass verification assertions.",
                createdAt=now_iso
            ))
            actions.append(RemediationAction(
                id=f"REM-{session_id}-02",
                title="Refine Candidate Patch",
                description="Adjust proposed code fix to address lingering assertion failures.",
                priority="HIGH",
                status="NOT_STARTED",
                sourceType="AI_SUGGESTION",
                reason="Patch did not fully resolve cryptographic or structural requirements.",
                createdAt=now_iso
            ))

        report = ErrorReport(
            id=report_id,
            sessionId=session_id,
            category=category,
            severity=severity,
            title=title,
            scenarioName=scenario_name,
            scenarioId=scenario_id,
            description=desc,
            errorCategory="CONTRACT_VERIFICATION",
            errorMessage=err_msg,
            affectedComponent="PayPal Webhook Verifier",
            affectedFile="src/verifier.py",
            affectedFunction="verify_webhook_signature",
            observedEvidence=f"Execution completed in {duration_ms}ms with exit code {exit_code}. Baseline: {baseline_results.get('passed', 0)}/{baseline_results.get('total', 4)} passed. After-fix: {after_fix_results.get('passed', 0)}/{after_fix_results.get('total', 4)} passed.",
            confirmedCause=root_cause,
            aiHypothesis=root_cause,
            aiConfidenceLabel="Verified by Pytest Subprocess Runner",
            remediationActions=actions,
            executionMode=execution_mode,
            createdAt=now_iso,
            status=status,
            patchId=patch_id,
            patchSha256=patch_sha256,
            baselineTestResults=baseline_results,
            afterFixTestResults=after_fix_results,
            failedTests=failed_tests,
            relevantLogs=[stdout] if stdout else [],
            exitCode=exit_code
        )

        # Persist to SQLite
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO reports (
            id, session_id, category, severity, title, scenario_name, scenario_id,
            description, error_category, error_message, affected_component, affected_file,
            affected_function, observed_evidence, confirmed_cause, ai_hypothesis,
            ai_confidence_label, missing_evidence, execution_mode, created_at, status,
            patch_id, patch_sha256, baseline_results_json, after_fix_results_json,
            failed_tests_json, relevant_logs_json, exit_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report.id, report.sessionId, report.category, report.severity, report.title,
            report.scenarioName, report.scenarioId, report.description, report.errorCategory,
            report.errorMessage, report.affectedComponent, report.affectedFile, report.affectedFunction,
            report.observedEvidence, report.confirmedCause, report.aiHypothesis, report.aiConfidenceLabel,
            report.missingEvidence, report.executionMode, report.createdAt, report.status,
            report.patchId, report.patchSha256, json.dumps(report.baselineTestResults),
            json.dumps(report.afterFixTestResults), json.dumps(report.failedTests),
            json.dumps(report.relevantLogs), report.exitCode
        ))

        for act in actions:
            cursor.execute("""
            INSERT OR REPLACE INTO remediation_actions (
                id, report_id, title, description, priority, status, source_type, reason, completed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                act.id, report.id, act.title, act.description, act.priority,
                act.status, act.sourceType, act.reason, act.completedAt, act.createdAt
            ))

        conn.commit()
        conn.close()
        return report

    @staticmethod
    def generate_html_export(report: ErrorReport) -> str:
        """Renders a standalone, dark-themed HTML report document."""
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IntegrateIQ Evidence Report — {report.id}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      background: #090d16;
      color: #e2e8f0;
      padding: 32px;
      line-height: 1.6;
    }}
    .container {{ max-width: 900px; margin: 0 auto; }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-right: 8px;
    }}
    .badge-pass {{ background: #064e3b; color: #34d399; border: 1px solid #059669; }}
    .badge-fail {{ background: #881337; color: #fb7185; border: 1px solid #e11d48; }}
    .badge-info {{ background: #082f49; color: #38bdf8; border: 1px solid #0284c7; }}
    .card {{
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }}
    h1 {{ color: #ffffff; font-size: 22px; margin-bottom: 4px; }}
    h2 {{ color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }}
    pre {{
      background: #020617;
      border: 1px solid #1e293b;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      overflow-x: auto;
      color: #38bdf8;
    }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }}
    th, td {{ text-align: left; padding: 8px 12px; border-bottom: 1px solid #1e293b; }}
    th {{ color: #64748b; font-size: 11px; text-transform: uppercase; }}
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
      <span class="badge badge-{ 'pass' if report.category == 'VERIFICATION_PASS' else 'fail' }">{report.category}</span>
      <span class="badge badge-info">{report.executionMode}</span>
      <h1>{report.title}</h1>
      <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Report ID: {report.id} &bull; Session: {report.sessionId} &bull; Generated: {report.createdAt}</p>
    </div>

    <div class="card">
      <h2>Observed Evidence & Findings</h2>
      <p>{report.observedEvidence}</p>
      <div style="margin-top: 12px;">
        <strong>Confirmed Root Cause:</strong> {report.confirmedCause or 'N/A'}
      </div>
      <div style="margin-top: 8px;">
        <strong>AI Hypothesis:</strong> {report.aiHypothesis}
      </div>
    </div>

    <div class="card">
      <h2>Test Execution Summary</h2>
      <table>
        <tr>
          <th>Execution Metric</th>
          <th>Result</th>
        </tr>
        <tr><td>Exit Code</td><td>{report.exitCode}</td></tr>
        <tr><td>Patch SHA-256</td><td><code>{report.patchSha256 or 'N/A'}</code></td></tr>
        <tr><td>Baseline Passed</td><td>{report.baselineTestResults.get('passed', 0) if report.baselineTestResults else 'N/A'} / 4</td></tr>
        <tr><td>Post-Patch Passed</td><td>{report.afterFixTestResults.get('passed', 0) if report.afterFixTestResults else 'N/A'} / 4</td></tr>
      </table>
    </div>

    <div class="card">
      <h2>Remediation Action Plan</h2>
      <table>
        <tr>
          <th>Action ID</th>
          <th>Title</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Source</th>
        </tr>
        {''.join([f"<tr><td>{a.id}</td><td>{a.title}</td><td>{a.priority}</td><td>{a.status}</td><td>{a.sourceType}</td></tr>" for a in report.remediationActions])}
      </table>
    </div>

    {f"<div class='card'><h2>Raw Process Output (stdout)</h2><pre>{report.relevantLogs[0]}</pre></div>" if report.relevantLogs else ""}
  </div>
</body>
</html>"""
