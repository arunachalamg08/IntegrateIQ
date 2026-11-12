import asyncio
import httpx
from backend.app.main import app

async def main():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health
        res = await client.get("/api/health")
        print("1. Health:", res.status_code, res.json())

        # 2. Config status
        res = await client.get("/api/config/status")
        print("2. Config Status:", res.status_code, res.json())

        # 3. Dashboard summary
        res = await client.get("/api/dashboard/summary")
        print("3. Dashboard Summary:", res.status_code, res.json()["totalSessions"], "sessions")

        # 4. Scenarios
        res = await client.get("/api/scenarios")
        print("4. Scenarios count:", len(res.json()))

        # 5. Create Session
        res = await client.post("/api/sessions", json={"scenarioId": "wh-signature"})
        session = res.json()
        session_id = session["id"]
        print("5. Created Session:", session_id, session["status"])

        # 6. Reproduce Failure (Subprocess Pytest!)
        print("6. Reproducing failure via Pytest runner...")
        res = await client.post(f"/api/sessions/{session_id}/reproduce")
        session = res.json()
        print("   Reproduction status:", session["reproductionStatus"], "exit_code:", session["reproduction"]["actualExitCode"])

        # 7. Diagnose
        print("7. Generating diagnosis...")
        res = await client.post(f"/api/sessions/{session_id}/diagnose")
        session = res.json()
        print("   Diagnosis status:", session["diagnosisStatus"], "patchId:", session["patchId"])

        # 8. Approve Patch
        print("8. Approving patch...")
        res = await client.post(f"/api/patches/{session['patchId']}/approve")
        print("   Patch approval:", res.json()["status"])

        # 9. Run Verification (Subprocess Pytest with fix!)
        print("9. Running verification suite via Pytest runner...")
        res = await client.post(f"/api/sessions/{session_id}/verify")
        session = res.json()
        print("   Verification status:", session["verificationStatus"], "Report ID:", session["reportId"])

        # 10. Reports
        res = await client.get("/api/reports")
        print("10. Total Reports in DB:", len(res.json()))

        # 11. Export HTML
        res = await client.get(f"/api/reports/{session['reportId']}/export?format=html")
        print("11. HTML Export length:", len(res.text))

if __name__ == "__main__":
    asyncio.run(main())
