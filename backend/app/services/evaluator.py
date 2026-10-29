import json
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.config import DATA_DIR
from app.services.search_engine import VerificationEngine

def run_evaluation_benchmark(db: Session) -> Dict[str, Any]:
    """
    Executes the standard Praman AI benchmark on the curated evaluation test set.
    Measures accuracy, precision, recall, F1, and false positive rates.
    """
    eval_file = DATA_DIR / "eval_dataset.json"
    if not eval_file.exists():
        return {
            "total_samples": 0,
            "correct_predictions": 0,
            "accuracy": 0.0,
            "precision_macro": 0.0,
            "recall_macro": 0.0,
            "f1_macro": 0.0,
            "false_positive_rate": 0.0,
            "status_metrics": {},
            "results": []
        }

    with open(eval_file, "r", encoding="utf-8") as f:
        test_samples = json.load(f)

    engine = VerificationEngine(db)
    results = []
    correct_count = 0

    all_statuses = ["Exact Match", "Modified Quote", "Context Mismatch", "Source Not Found", "Inconclusive"]
    matrix = {s: {"tp": 0, "fp": 0, "fn": 0, "tn": 0} for s in all_statuses}

    for item in test_samples:
        gt = item["ground_truth_status"]
        verif = engine.search_and_verify(
            quote=item["quote"],
            case_name=item.get("case_name"),
            citation=item.get("citation"),
            court_name=item.get("court_name")
        )
        pred = verif["status"]
        is_correct = (pred == gt)
        if is_correct:
            correct_count += 1

        # Update per-status confusion counts
        for s in all_statuses:
            if pred == s and gt == s:
                matrix[s]["tp"] += 1
            elif pred == s and gt != s:
                matrix[s]["fp"] += 1
            elif pred != s and gt == s:
                matrix[s]["fn"] += 1
            else:
                matrix[s]["tn"] += 1

        results.append({
            "id": item["id"],
            "test_type": item["test_type"],
            "quote": item["quote"],
            "case_name": item.get("case_name") or "N/A",
            "ground_truth_status": gt,
            "predicted_status": pred,
            "is_correct": is_correct,
            "confidence": verif["confidence"],
            "explanation": verif["explanation"]
        })

    total = len(test_samples)
    accuracy = round((correct_count / total), 4) if total > 0 else 0.0

    # Macro Precision, Recall, F1
    status_metrics: Dict[str, Dict[str, float]] = {}
    precisions = []
    recalls = []
    f1s = []

    for s, m in matrix.items():
        tp, fp, fn = m["tp"], m["fp"], m["fn"]
        p = (tp / (tp + fp)) if (tp + fp) > 0 else 1.0
        r = (tp / (tp + fn)) if (tp + fn) > 0 else 1.0
        f1 = (2 * p * r / (p + r)) if (p + r) > 0 else 0.0
        precisions.append(p)
        recalls.append(r)
        f1s.append(f1)
        status_metrics[s] = {
            "precision": round(p, 4),
            "recall": round(r, 4),
            "f1": round(f1, 4),
            "support": tp + fn
        }

    p_macro = round(sum(precisions) / len(precisions), 4) if precisions else 0.0
    r_macro = round(sum(recalls) / len(recalls), 4) if recalls else 0.0
    f1_macro = round(sum(f1s) / len(f1s), 4) if f1s else 0.0

    # False Positive Rate on Source Not Found (marking a hallucination as verified)
    hallucination_cases = [r for r in results if r["ground_truth_status"] == "Source Not Found"]
    hallucination_fp = sum(1 for r in hallucination_cases if r["predicted_status"] in {"Exact Match", "Modified Quote"})
    fpr = round(hallucination_fp / len(hallucination_cases), 4) if hallucination_cases else 0.0

    return {
        "total_samples": total,
        "correct_predictions": correct_count,
        "accuracy": accuracy,
        "precision_macro": p_macro,
        "recall_macro": r_macro,
        "f1_macro": f1_macro,
        "false_positive_rate": fpr,
        "status_metrics": status_metrics,
        "results": results
    }
