import pytest
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_config_status():
    response = client.get("/api/config/status")
    assert response.status_code == 200
    data = response.json()
    assert "gemini" in data
    assert "paypal" in data
    assert "test_runner" in data
    assert data["test_runner"]["status"] == "ACTIVE"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "totalSessions" in data
    assert data["totalSessions"] >= 3
    assert "recentSessions" in data
    assert len(data["recentSessions"]) > 0

def test_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 3
    assert any(s["id"] == "wh-signature" for s in scenarios)

def test_end_to_end_session_lifecycle():
    # 1. Create a new session
    create_res = client.post("/api/sessions", json={"scenarioId": "wh-signature"})
    assert create_res.status_code == 200
    session = create_res.json()
    session_id = session["id"]
    assert session["status"] == "CREATED"
    assert session["reproductionStatus"] == "NOT_REPRODUCED"

    # 2. Reproduce failure (runs real Pytest!)
    reproduce_res = client.post(f"/api/sessions/{session_id}/reproduce")
    assert reproduce_res.status_code == 200
    session = reproduce_res.json()
    assert session["status"] == "FAILURE_REPRODUCED"
    assert session["reproductionStatus"] == "REPRODUCED"
    assert session["reproduction"] is not None
    assert session["reproduction"]["actualExitCode"] == 1  # Genuine test failure!

    # 3. Diagnose
    diag_res = client.post(f"/api/sessions/{session_id}/diagnose")
    assert diag_res.status_code == 200
    session = diag_res.json()
    assert session["status"] == "PATCH_READY"
    assert session["diagnosis"] is not None
    assert session["patch"] is not None
    patch_id = session["patchId"]
    assert patch_id is not None

    # 4. Approve patch
    approve_res = client.post(f"/api/patches/{patch_id}/approve")
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 5. Run Verification (runs real Pytest with fix!)
    verify_res = client.post(f"/api/sessions/{session_id}/verify")
    assert verify_res.status_code == 200
    session = verify_res.json()
    assert session["status"] == "VERIFICATION_COMPLETED"
    assert session["verificationStatus"] == "PASS"
    assert session["verificationRun"]["actualExitCode"] == 0  # 4/4 Passed!
    assert session["reportId"] is not None

    # 6. Verify report exists in reports list
    reports_res = client.get("/api/reports")
    assert reports_res.status_code == 200
    reports = reports_res.json()
    report_ids = [r["id"] for r in reports]
    assert session["reportId"] in report_ids

    # 7. Test Export JSON
    export_json = client.get(f"/api/reports/{session['reportId']}/export?format=json")
    assert export_json.status_code == 200
    assert export_json.headers["content-type"].startswith("application/json")

    # 8. Test Export HTML
    export_html = client.get(f"/api/reports/{session['reportId']}/export?format=html")
    assert export_html.status_code == 200
    assert export_html.headers["content-type"].startswith("text/html")
    assert "IntegrateIQ Evidence Report" in export_html.text
