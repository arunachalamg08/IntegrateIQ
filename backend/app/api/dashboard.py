from fastapi import APIRouter
import json
from backend.app.database import get_db
from backend.app.services.gemini_service import GeminiService
from backend.app.services.paypal_service import PayPalService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM sessions")
    total_sessions = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sessions WHERE verification_status = 'PASS'")
    verified_pass = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sessions WHERE verification_status = 'FAIL'")
    verified_fail = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sessions WHERE verification_status = 'INCONCLUSIVE'")
    inconclusive = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sessions WHERE patch_review_status = 'PENDING' AND patch_id IS NOT NULL")
    pending_review = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sessions WHERE status NOT IN ('VERIFICATION_COMPLETED', 'VERIFICATION_FAILED')")
    open_debug_sessions = cursor.fetchone()[0]

    # Fetch recent sessions
    cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC LIMIT 6")
    rows = cursor.fetchall()

    recent_sessions = []
    for r in rows:
        recent_sessions.append({
            "id": r["id"],
            "scenarioId": r["scenario_id"],
            "scenarioName": r["scenario_name"],
            "sampleApp": r["sample_app"],
            "status": r["status"],
            "lastUpdated": r["last_updated"],
            "createdAt": r["created_at"],
            "reproductionStatus": r["reproduction_status"],
            "reproduction": json.loads(r["reproduction_json"]) if r["reproduction_json"] else None,
            "diagnosisStatus": r["diagnosis_status"],
            "diagnosis": json.loads(r["diagnosis_json"]) if r["diagnosis_json"] else None,
            "patchId": r["patch_id"],
            "patch": json.loads(r["patch_json"]) if r["patch_json"] else None,
            "patchReviewStatus": r["patch_review_status"],
            "verificationMode": r["verification_mode"],
            "verificationStatus": r["verification_status"],
            "verificationProgress": r["verification_progress"],
            "verificationRun": json.loads(r["verification_run_json"]) if r["verification_run_json"] else None,
            "reportId": r["report_id"],
            "report": json.loads(r["report_json"]) if r["report_json"] else None,
            "testCases": json.loads(r["test_cases_json"]) if r["test_cases_json"] else []
        })

    conn.close()

    gemini_status = GeminiService.check_connection()
    paypal_status = await PayPalService.check_connection()

    return {
        "totalSessions": total_sessions,
        "verifiedPass": verified_pass,
        "verifiedFail": verified_fail,
        "inconclusive": inconclusive,
        "pendingReview": pending_review,
        "openDebugSessions": open_debug_sessions,
        "recentSessions": recent_sessions,
        "geminiStatus": gemini_status.get("status", "CONFIGURATION_REQUIRED"),
        "paypalStatus": paypal_status.get("status", "CONFIGURATION_REQUIRED"),
        "testRunnerStatus": "READY"
    }

@router.get("/activity")
async def get_dashboard_activity():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 20")
    rows = cursor.fetchall()
    events = [dict(r) for r in rows]
    conn.close()
    return events
