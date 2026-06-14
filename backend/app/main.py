from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.routes import maintenance, safety, energy, production, chat, dashboard, reports, auth, demo
from app.services.live_sensor import start_simulation, stop_simulation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 APIS Backend starting up...")
    start_simulation()
    yield
    stop_simulation()
    logger.info("🛑 APIS Backend shutting down...")


app = FastAPI(
    title="Tata Steel APIS - Autonomous Plant Intelligence System",
    description="Multi-agent AI platform for industrial operations",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(dashboard.router,  prefix="/api/dashboard",  tags=["Dashboard"])
app.include_router(maintenance.router,prefix="/api/maintenance",tags=["Maintenance"])
app.include_router(safety.router,     prefix="/api/safety",     tags=["Safety"])
app.include_router(energy.router,     prefix="/api/energy",     tags=["Energy"])
app.include_router(production.router, prefix="/api/production", tags=["Production"])
app.include_router(chat.router,       prefix="/api/chat",       tags=["AI Chat"])
app.include_router(reports.router,    prefix="/api/reports",    tags=["Reports"])
app.include_router(demo.router,       prefix="/api/demo",       tags=["Live Demo"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "APIS Backend", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "message": "Tata Steel APIS - Autonomous Plant Intelligence System",
        "docs": "/api/docs",
        "health": "/health",
    }
