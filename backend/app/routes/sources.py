from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Judgment, JudgmentPassage
from app.schemas import JudgmentOut, SampleQuotePreset

router = APIRouter(prefix="/api/sources", tags=["Sources"])

@router.get("", response_model=List[JudgmentOut])
def get_sources(db: Session = Depends(get_db)):
    """
    Returns all indexed judgment sources with their passage counts.
    """
    judgments = db.query(Judgment).order_by(Judgment.year.desc().nullslast()).all()
    out = []
    for j in judgments:
        p_count = db.query(JudgmentPassage).filter(JudgmentPassage.judgment_id == j.id).count()
        out.append(
            JudgmentOut(
                id=j.id,
                title=j.title,
                citation=j.citation,
                court=j.court,
                year=j.year,
                bench=j.bench,
                source_url=j.source_url,
                is_landmark=j.is_landmark,
                passages_count=p_count
            )
        )
    return out


@router.get("/{id}")
def get_source_detail(id: int, db: Session = Depends(get_db)):
    """
    Returns full judgment metadata and its extracted passages.
    """
    judgment = db.query(Judgment).filter(Judgment.id == id).first()
    if not judgment:
        raise HTTPException(status_code=404, detail="Judgment source not found")
        
    passages = db.query(JudgmentPassage).filter(JudgmentPassage.judgment_id == id).order_by(JudgmentPassage.para_number.asc()).all()
    return {
        "id": judgment.id,
        "title": judgment.title,
        "citation": judgment.citation,
        "court": judgment.court,
        "year": judgment.year,
        "bench": judgment.bench,
        "source_url": judgment.source_url,
        "original_filename": judgment.original_filename,
        "is_landmark": judgment.is_landmark,
        "passages": [
            {
                "id": p.id,
                "para_number": p.para_number,
                "page_number": p.page_number,
                "text": p.text,
                "is_holding": p.is_holding,
                "is_party_argument": p.is_party_argument,
                "is_dissent": p.is_dissent,
                "speaker_or_party": p.speaker_or_party,
                "section_title": p.section_title
            }
            for p in passages
        ]
    }


@router.get("/presets/sample-quotes", response_model=List[SampleQuotePreset])
def get_sample_quotes():
    """
    Provides pre-loaded, authentic sample quotes covering every verification scenario
    to give users an immediate 1-click test drive of Praman AI.
    """
    return [
        SampleQuotePreset(
            id="sample-puttaswamy-exact",
            label="Privacy as Core of Dignity (Exact)",
            category="Exact Match",
            quote="Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents. The negative content restrains the State from committing an intrusion upon the life and personal liberty of a citizen.",
            case_name="Justice K.S. Puttaswamy (Retd.) v. Union of India",
            citation="(2017) 10 SCC 1",
            court_name="Supreme Court of India",
            expected_status="Exact Match",
            description="Verbatim excerpt from Justice D.Y. Chandrachud's majority ruling in the 9-judge privacy bench."
        ),
        SampleQuotePreset(
            id="sample-kesavananda-modified",
            label="Basic Structure Amendment (Modified)",
            category="Modified Quote",
            quote="The power to amend the Constitution under Article 368 includes the discretionary power to alter the basic framework of the Constitution so as to adapt its identity.",
            case_name="Kesavananda Bharati v. State of Kerala",
            citation="(1973) 4 SCC 225",
            court_name="Supreme Court of India",
            expected_status="Modified Quote",
            description="Critical alteration where 'does not include' is changed to 'includes the discretionary power', reversing the constitutional holding."
        ),
        SampleQuotePreset(
            id="sample-puttaswamy-party-arg",
            label="Privacy is Elitist (Party Argument Misattribution)",
            category="Context Mismatch",
            quote="The Constitution does not specifically guarantee a right to privacy and privacy is an elitist concept that must yield to the socio-economic welfare entitlements of the impoverished masses.",
            case_name="Justice K.S. Puttaswamy (Retd.) v. Union of India",
            citation="(2017) 10 SCC 1",
            court_name="Supreme Court of India",
            expected_status="Context Mismatch",
            description="Attorney General's submission on behalf of the Union of India, falsely cited as if it were the Court's judicial ratio."
        ),
        SampleQuotePreset(
            id="sample-admjabalpur-dissent",
            label="Justice Khanna Dissent (Dissenting Opinion)",
            category="Context Mismatch",
            quote="Even in the absence of Article 21 in the Constitution, the State has got no power to deprive a person of his life or liberty without the authority of law.",
            case_name="Additional District Magistrate, Jabalpur v. Shivkant Shukla",
            citation="(1976) 2 SCC 521",
            court_name="Supreme Court of India",
            expected_status="Context Mismatch",
            description="Justice H.R. Khanna's heroic solitary dissent in ADM Jabalpur, representing the minority opinion."
        ),
        SampleQuotePreset(
            id="sample-maneka-cross-case",
            label="Procedure Established by Law (Cross-Case Origin)",
            category="Cross-Case Tracing",
            quote="The procedure prescribed by law under Article 21 must be just, fair and reasonable and not arbitrary, fanciful or oppressive.",
            case_name="Justice K.S. Puttaswamy (Retd.) v. Union of India",
            citation="(2017) 10 SCC 1",
            court_name="Supreme Court of India",
            expected_status="Modified Quote / Cross-Case Tracing",
            description="Famous ratio originated in Maneka Gandhi (1978) 1 SCC 248, attributed here to Puttaswamy to test cross-case origin tracing."
        ),
        SampleQuotePreset(
            id="sample-hallucinated-ai",
            label="AI Legal Personhood (Fabricated / Unsupported)",
            category="Source Not Found",
            quote="The Supreme Court of India in its landmark decision held that artificial intelligence models are legal persons under Article 300A with property rights in their generated software algorithms.",
            case_name="AI Robotics Society v. Union of India",
            citation="(2024) 4 SCC 999",
            court_name="Supreme Court of India",
            expected_status="Source Not Found",
            description="Fictitious legal quotation and non-existent case citation generated by an ungrounded LLM."
        )
    ]
