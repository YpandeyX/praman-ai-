import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, SessionLocal, engine
from app.main import seed_database_if_empty
from app.services.citation_formatter import format_citations
from app.services.harmonizer import harmonize_quote
from app.services.doctrine_timeline import get_doctrine_lineage_for_case
from app.services.brief_scanner import scan_and_audit_brief

def setup_module():
    Base.metadata.create_all(bind=engine)
    seed_database_if_empty()

def test_citation_formatter():
    cites = format_citations(
        judgment_title="Justice K.S. Puttaswamy (Retd.) v. Union of India",
        citation="(2017) 10 SCC 1",
        year=2017,
        para_number=298,
        page_number=265,
        quote_text="Privacy is the constitutional core of human dignity."
    )
    assert "SCC" in cites["scc"]
    assert "para 298" in cites["scc"]
    assert "AIR 2017 SC" in cites["air"]
    assert "2017 INSC" in cites["neutral_insc"]
    assert "pleading_blockquote" in cites

def test_quote_harmonizer():
    sub = "Privacy is the core of human dignity. The negative content restrains the State from committing intrusion."
    orig = "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen."
    res = harmonize_quote(sub, orig)
    assert "[...]" in res["harmonized_quote"]
    assert res["total_corrections"] > 0
    assert len(res["corrections_applied"]) > 0

def test_doctrine_timeline():
    timeline = get_doctrine_lineage_for_case("Puttaswamy")
    assert "Privacy" in timeline["doctrine_name"]
    assert len(timeline["nodes"]) >= 4

def test_brief_scanner():
    db = SessionLocal()
    try:
        sample_brief = (
            "PETITION UNDER ARTICLE 32 OF THE CONSTITUTION OF INDIA:\n\n"
            "1. The Petitioner submits that as held by the Hon'ble Supreme Court in "
            '"Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents." '
            '[Justice K.S. Puttaswamy v. Union of India, (2017) 10 SCC 1], privacy cannot be infringed without due process.\n\n'
            "2. Furthermore, in the landmark ruling on amending power, this Court affirmed that "
            '"The power to amend the Constitution under Article 368 includes the discretionary power to alter the basic framework." '
            '[Kesavananda Bharati v. State of Kerala].'
        )
        res = scan_and_audit_brief(sample_brief, db)
        assert res["total_quotes"] >= 2
        assert len(res["spans"]) >= 2
        assert res["spans"][0]["status"] == "Exact Match"
        assert res["spans"][1]["status"] == "Modified Quote"
    finally:
        db.close()

if __name__ == "__main__":
    setup_module()
    test_citation_formatter()
    test_quote_harmonizer()
    test_doctrine_timeline()
    test_brief_scanner()
    print("ALL ADVANCED TESTS PASSED SUCCESSFULLY!")
