import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, SessionLocal, engine
from app.main import seed_database_if_empty
from app.services.search_engine import VerificationEngine
from app.services.diff_engine import compute_word_diff
from app.services.context_checker import analyze_context_integrity
from app.services.report_generator import generate_evidence_pdf
from app.services.evaluator import run_evaluation_benchmark

def setup_module():
    Base.metadata.create_all(bind=engine)
    seed_database_if_empty()

def test_exact_match_puttaswamy():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen."
        res = engine.search_and_verify(
            quote=quote,
            case_name="Justice K.S. Puttaswamy (Retd.) v. Union of India"
        )
        assert res["status"] == "Exact Match"
        assert res["confidence"] >= 0.98
        assert res["judgment_title"] == "Justice K.S. Puttaswamy (Retd.) v. Union of India"
        assert res["para_number"] == 298
    finally:
        db.close()

def test_modified_quote_kesavananda():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "The power to amend the Constitution under Article 368 includes the discretionary power to alter the basic framework of the Constitution so as to adapt its identity."
        res = engine.search_and_verify(
            quote=quote,
            case_name="Kesavananda Bharati v. State of Kerala"
        )
        assert res["status"] == "Modified Quote"
        assert len(res["diff"]["critical_alterations"]) > 0
    finally:
        db.close()

def test_context_mismatch_party_argument():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "The Constitution does not specifically guarantee a right to privacy and privacy is an elitist concept that must yield to the socio-economic welfare entitlements of the impoverished masses."
        res = engine.search_and_verify(
            quote=quote,
            case_name="Justice K.S. Puttaswamy (Retd.) v. Union of India"
        )
        assert res["status"] == "Context Mismatch"
        assert res["context_analysis"]["is_party_argument"] is True
    finally:
        db.close()

def test_context_mismatch_dissent():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "Even in the absence of Article 21 in the Constitution, the State has got no power to deprive a person of his life or liberty without the authority of law."
        res = engine.search_and_verify(
            quote=quote,
            case_name="Additional District Magistrate, Jabalpur v. Shivkant Shukla"
        )
        assert res["status"] == "Context Mismatch"
        assert res["context_analysis"]["is_dissent"] is True
    finally:
        db.close()

def test_source_not_found_hallucination():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "The Supreme Court of India in its landmark decision held that artificial intelligence models are legal persons under Article 300A with property rights in their generated software algorithms."
        res = engine.search_and_verify(
            quote=quote,
            case_name="AI Robotics Society v. Union of India"
        )
        assert res["status"] == "Source Not Found"
    finally:
        db.close()

def test_pdf_evidence_report_generation():
    db = SessionLocal()
    try:
        engine = VerificationEngine(db)
        quote = "Privacy is the constitutional core of human dignity."
        res = engine.search_and_verify(quote=quote)
        res["id"] = 999
        pdf_path = generate_evidence_pdf(res, "test_report_999.pdf")
        assert os.path.exists(pdf_path)
        assert os.path.getsize(pdf_path) > 1000
    finally:
        db.close()

def test_evaluation_benchmark():
    db = SessionLocal()
    try:
        metrics = run_evaluation_benchmark(db)
        assert metrics["total_samples"] >= 10
        assert metrics["accuracy"] >= 0.85
        assert metrics["false_positive_rate"] == 0.0
    finally:
        db.close()

if __name__ == "__main__":
    setup_module()
    test_exact_match_puttaswamy()
    test_modified_quote_kesavananda()
    test_context_mismatch_party_argument()
    test_context_mismatch_dissent()
    test_source_not_found_hallucination()
    test_pdf_evidence_report_generation()
    test_evaluation_benchmark()
    print("ALL TESTS PASSED SUCCESSFULLY!")
