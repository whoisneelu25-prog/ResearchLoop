import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import Base, engine, SessionLocal
from app.seed.seeder import seed_database
from app.api.auth import router as auth_router
from app.api.research import router as research_router
from app.api.papers import router as papers_router
from app.api.evidence import router as evidence_router
from app.api.contradictions import router as contradictions_router
from app.api.gaps import router as gaps_router
from app.api.hypotheses import router as hypotheses_router
from app.api.whatif import router as whatif_router
from app.api.graph import router as graph_router
from app.api.system import router as system_router
from app.api.copilot import router as copilot_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("researchloop")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ResearchLoop database and seed fixtures...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database and demo fixtures verified successfully.")
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}", exc_info=True)
    finally:
        db.close()
    yield
    logger.info("Shutting down ResearchLoop backend.")

app = FastAPI(
    title="ResearchLoop API",
    description="AI-Powered Biomedical Research Intelligence Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(research_router)
app.include_router(papers_router)
app.include_router(evidence_router)
app.include_router(contradictions_router)
app.include_router(gaps_router)
app.include_router(hypotheses_router)
app.include_router(whatif_router)
app.include_router(graph_router)
app.include_router(system_router)
app.include_router(copilot_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResearchLoop API",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "name": "ResearchLoop API",
        "tagline": "Turn past research into the next research direction.",
        "docs": "/docs",
        "health": "/health"
    }
