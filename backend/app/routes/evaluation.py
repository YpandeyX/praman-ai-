from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import EvaluationReportResponse
from app.services.evaluator import run_evaluation_benchmark

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation Benchmark"])

@router.get("/run", response_model=EvaluationReportResponse)
def execute_benchmark(db: Session = Depends(get_db)):
    """
    Executes the automated benchmark evaluation suite across all 5 verification outcome classes
    and returns Precision, Recall, F1, Accuracy, and per-sample results.
    """
    metrics = run_evaluation_benchmark(db)
    return metrics
