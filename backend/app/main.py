import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, DATA_DIR, REPORTS_DIR
from app.database import engine, Base, SessionLocal
from app.models import Judgment, JudgmentPassage
from app.services.text_normalizer import normalize_text

from app.routes.verify import router as verify_router
from app.routes.sources import router as sources_router
from app.routes.history import router as history_router
from app.routes.reports import router as reports_router
from app.routes.evaluation import router as eval_router
from app.routes.advanced import router as advanced_router

app = FastAPI(
    title="Praman AI — Legal Quote Verification Platform",
    description="Intelligent legal quotation authentication, explainable text diffing, context integrity checking, and evidence certification.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(verify_router)
app.include_router(sources_router)
app.include_router(history_router)
app.include_router(reports_router)
app.include_router(eval_router)
app.include_router(advanced_router)

def seed_database_if_empty():
    """Seeds authentic landmark Indian Supreme Court judgments if database is empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Judgment).count()
        if count == 0:
            seed_file = DATA_DIR / "seed_judgments.json"
            if seed_file.exists():
                with open(seed_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                for j_data in data:
                    judgment = Judgment(
                        title=j_data["title"],
                        citation=j_data.get("citation"),
                        court=j_data.get("court", "Supreme Court of India"),
                        year=j_data.get("year"),
                        bench=j_data.get("bench"),
                        source_url=j_data.get("source_url"),
                        is_landmark=j_data.get("is_landmark", True)
                    )
                    db.add(judgment)
                    db.flush()
                    
                    for p in j_data.get("passages", []):
                        raw_text = p["text"]
                        cleaned = normalize_text(raw_text)
                        passage = JudgmentPassage(
                            judgment_id=judgment.id,
                            para_number=p.get("para_number"),
                            page_number=p.get("page_number"),
                            text=raw_text,
                            cleaned_text=cleaned,
                            is_holding=p.get("is_holding", True),
                            is_party_argument=p.get("is_party_argument", False),
                            is_dissent=p.get("is_dissent", False),
                            speaker_or_party=p.get("speaker_or_party"),
                            section_title=p.get("section_title")
                        )
                        db.add(passage)
                db.commit()
                print("Database seeded with landmark judgments successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    seed_database_if_empty()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Praman AI",
        "version": "1.0.0",
        "core_principle": "Deterministic proof-carrying legal verification"
    }

# Mount frontend dist static files if built
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

