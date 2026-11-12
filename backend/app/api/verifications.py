from fastapi import APIRouter, HTTPException
import json
from backend.app.database import get_db

router = APIRouter(prefix="/api/verifications", tags=["Verifications"])

@router.get("")
async def list_verifications():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, verification_run_json, verification_status, scenario_name, scenario_id FROM sessions WHERE verification_run_json IS NOT NULL")
    rows = cursor.fetchall()
    verifications = []
    for r in rows:
        run = json.loads(r["verification_run_json"])
        run["scenarioName"] = r["scenario_name"]
        run["scenarioId"] = r["scenario_id"]
        verifications.append(run)
    conn.close()
    return verifications

@router.get("/{verification_id}")
async def get_verification(verification_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT verification_run_json FROM sessions WHERE verification_run_json LIKE ?", (f"%{verification_id}%",))
    row = cursor.fetchone()
    conn.close()
    if not row or not row["verification_run_json"]:
        raise HTTPException(status_code=404, detail="Verification run not found.")
    return json.loads(row["verification_run_json"])
