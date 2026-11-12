import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.health import router as health_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.scenarios import router as scenarios_router
from backend.app.api.sessions import router as sessions_router
from backend.app.api.patches import router as patches_router
from backend.app.api.verifications import router as verifications_router
from backend.app.api.reports import router as reports_router
from backend.app.api.events import router as events_router
from backend.app.api.paypal_inspector import router as paypal_inspector_router
from backend.app.api.error_analyzer import router as error_analyzer_router
from backend.app.api.webhooks import router as webhooks_router

# Initialize SQLite database immediately
init_db()

app = FastAPI(
    title="IntegrateIQ Backend API",
    description="AI-Assisted PayPal Integration Debugging & Independent Verification Platform",
    version="1.0.0"
)

# Configure CORS for local development and Vite proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(scenarios_router)
app.include_router(sessions_router)
app.include_router(patches_router)
app.include_router(verifications_router)
app.include_router(reports_router)
app.include_router(events_router)
app.include_router(paypal_inspector_router)
app.include_router(error_analyzer_router)
app.include_router(webhooks_router)

@app.get("/")
async def root():
    return {
        "app": "IntegrateIQ Engine",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
