from fastapi import APIRouter, HTTPException
from typing import Optional
import json
from datetime import datetime
from backend.app.database import get_db
from backend.app.services.event_service import event_broadcaster

router = APIRouter(prefix="/api/patches", tags=["Patch Review & Approval"])

@router.get("")
async def list_patches():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, patch_id, patch_json, patch_review_status, scenario_name FROM sessions WHERE patch_id IS NOT NULL")
    rows = cursor.fetchall()
    patches = []
    for r in rows:
        if r["patch_json"]:
            p = json.loads(r["patch_json"])
            p["sessionId"] = r["id"]
            p["scenarioName"] = r["scenario_name"]
            p["patchReviewStatus"] = r["patch_review_status"]
            patches.append(p)
    conn.close()
    return patches

@router.get("/{patch_id}")
async def get_patch(patch_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, patch_id, patch_json, patch_review_status, scenario_name FROM sessions WHERE patch_id = ?", (patch_id,))
    row = cursor.fetchone()
    conn.close()
    if not row or not row["patch_json"]:
        raise HTTPException(status_code=404, detail="Patch not found.")
    p = json.loads(row["patch_json"])
    p["sessionId"] = row["id"]
    p["scenarioName"] = row["scenario_name"]
    p["patchReviewStatus"] = row["patch_review_status"]
    return p

@router.post("/{patch_id}/approve")
async def approve_patch(patch_id: str, session_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("SELECT id, patch_json FROM sessions WHERE id = ?", (session_id,))
    else:
        cursor.execute("SELECT id, patch_json FROM sessions WHERE patch_id = ? ORDER BY created_at DESC", (patch_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patch or Session not found.")

    target_session_id = row["id"]
    now_iso = datetime.utcnow().isoformat() + "Z"

    cursor.execute("""
    UPDATE sessions SET
        status = 'PATCH_APPROVED',
        patch_review_status = 'APPROVED',
        last_updated = 'Just now'
    WHERE id = ?
    """, (target_session_id,))

    cursor.execute("""
    INSERT INTO audit_events (session_id, event_type, details_json, created_at)
    VALUES (?, 'PATCH_APPROVED', ?, ?)
    """, (target_session_id, json.dumps({"patch_id": patch_id}), now_iso))

    conn.commit()
    conn.close()

    await event_broadcaster.broadcast_event("PATCH_APPROVED", target_session_id, {"patch_id": patch_id, "status": "APPROVED"})
    return {"status": "APPROVED", "patch_id": patch_id, "session_id": target_session_id}

@router.post("/{patch_id}/reject")
async def reject_patch(patch_id: str, session_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if session_id:
        cursor.execute("SELECT id, patch_json FROM sessions WHERE id = ?", (session_id,))
    else:
        cursor.execute("SELECT id, patch_json FROM sessions WHERE patch_id = ? ORDER BY created_at DESC", (patch_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patch or Session not found.")

    target_session_id = row["id"]
    now_iso = datetime.utcnow().isoformat() + "Z"

    cursor.execute("""
    UPDATE sessions SET
        status = 'PATCH_REJECTED',
        patch_review_status = 'REJECTED',
        last_updated = 'Just now'
    WHERE id = ?
    """, (target_session_id,))

    cursor.execute("""
    INSERT INTO audit_events (session_id, event_type, details_json, created_at)
    VALUES (?, 'PATCH_REJECTED', ?, ?)
    """, (target_session_id, json.dumps({"patch_id": patch_id}), now_iso))

    conn.commit()
    conn.close()

    await event_broadcaster.broadcast_event("PATCH_REJECTED", target_session_id, {"patch_id": patch_id, "status": "REJECTED"})
    return {"status": "REJECTED", "patch_id": patch_id, "session_id": target_session_id}
