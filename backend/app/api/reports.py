from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
import json
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.schemas import RemediationUpdateRequest, ErrorReport
from backend.app.services.report_service import ReportService

router = APIRouter(prefix="/api", tags=["Evidence Reports & Remediation"])

def row_to_report(r, actions) -> dict:
    return {
        "id": r["id"],
        "sessionId": r["session_id"],
        "category": r["category"],
        "severity": r["severity"],
        "title": r["title"],
        "scenarioName": r["scenario_name"],
        "scenarioId": r["scenario_id"],
        "description": r["description"],
        "errorCategory": r["error_category"],
        "errorMessage": r["error_message"],
        "affectedComponent": r["affected_component"],
        "affectedFile": r["affected_file"],
        "affectedFunction": r["affected_function"],
        "observedEvidence": r["observed_evidence"],
        "confirmedCause": r["confirmed_cause"],
        "aiHypothesis": r["ai_hypothesis"],
        "aiConfidenceLabel": r["ai_confidence_label"],
        "missingEvidence": r["missing_evidence"],
        "executionMode": r["execution_mode"],
        "createdAt": r["created_at"],
        "status": r["status"],
        "patchId": r["patch_id"],
        "patchSha256": r["patch_sha256"],
        "baselineTestResults": json.loads(r["baseline_results_json"]) if r["baseline_results_json"] else None,
        "afterFixTestResults": json.loads(r["after_fix_results_json"]) if r["after_fix_results_json"] else None,
        "failedTests": json.loads(r["failed_tests_json"]) if r["failed_tests_json"] else [],
        "relevantLogs": json.loads(r["relevant_logs_json"]) if r["relevant_logs_json"] else [],
        "exitCode": r["exit_code"],
        "remediationActions": actions
    }

@router.get("/reports")
async def list_reports():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")
    report_rows = cursor.fetchall()

    reports = []
    for r in report_rows:
        cursor.execute("SELECT * FROM remediation_actions WHERE report_id = ?", (r["id"],))
        action_rows = cursor.fetchall()
        actions = [
            {
                "id": a["id"],
                "title": a["title"],
                "description": a["description"],
                "priority": a["priority"],
                "status": a["status"],
                "sourceType": a["source_type"],
                "reason": a["reason"],
                "developerNotes": a["developer_notes"],
                "completedAt": a["completed_at"],
                "createdAt": a["created_at"]
            }
            for a in action_rows
        ]
        reports.append(row_to_report(r, actions))

    conn.close()
    return reports

@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found.")

    cursor.execute("SELECT * FROM remediation_actions WHERE report_id = ?", (report_id,))
    action_rows = cursor.fetchall()
    actions = [
        {
            "id": a["id"],
            "title": a["title"],
            "description": a["description"],
            "priority": a["priority"],
            "status": a["status"],
            "sourceType": a["source_type"],
            "reason": a["reason"],
            "developerNotes": a["developer_notes"],
            "completedAt": a["completed_at"],
            "createdAt": a["created_at"]
        }
        for a in action_rows
    ]
    report_data = row_to_report(r, actions)
    conn.close()
    return report_data

@router.get("/reports/{report_id}/export")
async def export_report(report_id: str, format: str = Query("json", enum=["json", "html"])):
    report_data = await get_report(report_id)

    if format == "html":
        report_obj = ErrorReport(**report_data)
        html_content = ReportService.generate_html_export(report_obj)
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=integrateiq_report_{report_id}.html"}
        )
    else:
        json_content = json.dumps(report_data, indent=2)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=integrateiq_report_{report_id}.json"}
        )

@router.patch("/remediation-actions/{action_id}")
async def update_remediation_action(action_id: str, req: RemediationUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM remediation_actions WHERE id = ?", (action_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Remediation action not found.")

    now_iso = datetime.utcnow().isoformat() + "Z" if req.status == "COMPLETED" else row["completed_at"]
    notes = req.developerNotes if req.developerNotes is not None else row["developer_notes"]

    cursor.execute("""
    UPDATE remediation_actions SET
        status = ?,
        developer_notes = ?,
        completed_at = ?
    WHERE id = ?
    """, (req.status, notes, now_iso, action_id))

    conn.commit()
    conn.close()

    return {"status": "success", "action_id": action_id, "new_status": req.status}
