import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DB_DIR = STORAGE_DIR / "db"
UPLOADS_DIR = STORAGE_DIR / "uploads"
REPORTS_DIR = STORAGE_DIR / "reports"
DATA_DIR = BASE_DIR / "app" / "data"

for directory in [STORAGE_DIR, DB_DIR, UPLOADS_DIR, REPORTS_DIR, DATA_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{DB_DIR / 'praman_ai.db'}"

# Verification Thresholds
EXACT_MATCH_THRESHOLD = 0.99
MODIFIED_QUOTE_MIN_THRESHOLD = 0.65
SEMANTIC_RETRIEVAL_TOP_K = 5
MAX_UPLOAD_SIZE_MB = 25
ALLOWED_EXTENSIONS = {".pdf", ".txt"}

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]
