import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database.seed_data import seed_database
from backend.app.services.background_worker import background_worker
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.books import router as books_router
from backend.app.api.intelligence import router as intelligence_router
from backend.app.api.summary import router as summary_router
from backend.app.api.ask_book import router as ask_book_router
from backend.app.api.demand import router as demand_router
from backend.app.api.orders import router as orders_router
from backend.app.api.academics import router as academics_router
from backend.app.api.resources import router as resources_router
from backend.app.api.ai_activity import router as ai_activity_router
from backend.app.api.search import router as search_router
from backend.app.api.realtime import router as realtime_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s")
logger = logging.getLogger("techz")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TECHZ Education ERP Platform...")
    seed_database()
    await background_worker.start()
    yield
    await background_worker.stop()
    logger.info("TECHZ Education ERP Platform shut down.")

app = FastAPI(
    title="TECHZ — Autonomous AI Education ERP",
    description="Autonomous AI Education Management & Book Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(books_router, prefix="/api")
app.include_router(intelligence_router, prefix="/api")
app.include_router(summary_router, prefix="/api")
app.include_router(ask_book_router, prefix="/api")
app.include_router(demand_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(academics_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(ai_activity_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(realtime_router, prefix="/api")

@app.get("/")
def root():
    return {
        "product": "TECHZ",
        "tagline": "Manage. Predict. Understand. Execute.",
        "positioning": "Autonomous AI Education Management & Intelligence Platform",
        "status": "ONLINE",
        "institution": settings.INSTITUTION_NAME,
        "current_semester": settings.CURRENT_SEMESTER,
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
