from fastapi import APIRouter
from backend.app.services.gemini_service import GeminiService
from backend.app.services.paypal_service import PayPalService
from backend.app.config import settings

router = APIRouter(prefix="/api", tags=["Health & Status"])

@router.get("/health")
async def get_health():
    return {
        "status": "healthy",
        "service": "IntegrateIQ Backend Engine",
        "version": "1.0.0",
        "env": settings.INTEGRATEIQ_ENV
    }

@router.get("/config/status")
async def get_config_status():
    """Returns genuine connection and availability status for Gemini and PayPal."""
    gemini_status = GeminiService.check_connection()
    paypal_status = await PayPalService.check_connection()

    return {
        "gemini": gemini_status,
        "paypal": paypal_status,
        "test_runner": {
            "status": "ACTIVE",
            "runtime": "Python 3.12 / Pytest 9.1",
            "timeout_seconds": settings.TEST_TIMEOUT_SECONDS,
            "isolation": "Temporary Directory Sandbox"
        }
    }
