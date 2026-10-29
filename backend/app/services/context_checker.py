import re
from typing import Dict, Any, List, Optional
from app.services.text_normalizer import normalize_text

PARTY_ARGUMENT_PATTERNS = [
    r'\b(?:learned\s+counsel|learned\s+senior\s+counsel|advocate\s+general|attorney\s+general)\s+(?:submitted|argued|contended|pleaded|urged)\b',
    r'\b(?:it\s+was\s+(?:submitted|contended|argued|pleaded|urged)\s+(?:that|by|on\s+behalf))\b',
    r'\b(?:the\s+petitioner|the\s+appellant|the\s+respondent|the\s+plaintiff|the\s+defendant)\s+(?:submitted|contended|argued|urged|claimed)\b',
    r'\b(?:on\s+behalf\s+of\s+the\s+(?:petitioner|appellant|respondent|state|union))\b',
    r'\b(?:the\s+submission\s+of\s+(?:the|mr\.|ms\.|dr\.))\b'
]

JUDICIAL_RATIO_PATTERNS = [
    r'\b(?:we\s+are\s+of\s+the\s+(?:opinion|considered\s+view)|we\s+hold\s+that|it\s+is\s+held\s+that)\b',
    r'\b(?:the\s+court\s+observes|this\s+court\s+has\s+repeatedly\s+held|the\s+law\s+is\s+well\s+settled)\b',
    r'\b(?:we\s+accordingly\s+declare|in\s+our\s+view|we\s+find\s+merit|we\s+find\s+no\s+substance)\b'
]

QUALIFYING_CAVEATS = [
    "subject to reasonable restrictions",
    "subject to the provisions of",
    "save and except",
    "provided however",
    "provided that",
    "unless expressly provided",
    "in exceptional circumstances",
    "not an absolute right",
    "cannot be exercised arbitrarily",
    "subject to public order, morality and health",
    "within the parameters laid down",
    "only where there is no adequate remedy"
]

def analyze_context_integrity(
    submitted_quote: str,
    matched_passage: str,
    preceding_passage: Optional[str] = None,
    succeeding_passage: Optional[str] = None,
    passage_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Checks whether a quotation preserves context integrity or suffers from:
    1. Party argument cited as judicial determination
    2. Dissenting opinion cited without attribution
    3. Omission of essential legal caveats/qualifications
    """
    warnings: List[str] = []
    omitted_qualifications: List[str] = []
    
    meta = passage_metadata or {}
    norm_sub = normalize_text(submitted_quote).lower()
    norm_match = normalize_text(matched_passage)
    combined_context = f"{preceding_passage or ''} {matched_passage} {succeeding_passage or ''}"
    
    # 1. Party Argument check
    is_party_arg = meta.get("is_party_argument", False)
    speaker_or_party = meta.get("speaker_or_party")
    
    # Heuristic regex check if not explicitly set in metadata
    if not is_party_arg:
        for pat in PARTY_ARGUMENT_PATTERNS:
            if re.search(pat, matched_passage, flags=re.IGNORECASE) or (preceding_passage and re.search(pat, preceding_passage, flags=re.IGNORECASE)):
                # Verify that it isn't accompanied by a direct court rejection/holding
                if not any(re.search(r_pat, matched_passage, flags=re.IGNORECASE) for r_pat in JUDICIAL_RATIO_PATTERNS):
                    is_party_arg = True
                    break
                    
    if is_party_arg:
        party_desc = f" ({speaker_or_party})" if speaker_or_party else ""
        warnings.append(
            f"Party Submission Warning: This passage appears in the argument/submission section{party_desc} "
            f"rather than the Court's authoritative holding or ratio decidendi."
        )

    # 2. Dissenting Opinion check
    is_dissent = meta.get("is_dissent", False)
    section_title = meta.get("section_title", "")
    if "dissent" in section_title.lower() or "minority" in section_title.lower():
        is_dissent = True
        
    if is_dissent:
        warnings.append(
            f"Dissenting Opinion Warning: This passage is from a minority/dissenting opinion "
            f"and does not represent the binding majority judgment of the bench."
        )

    # 3. Omission of Qualifications & Caveats
    match_lower = norm_match.lower()
    for caveat in QUALIFYING_CAVEATS:
        if caveat in match_lower and caveat not in norm_sub:
            omitted_qualifications.append(caveat)
            warnings.append(
                f"Omitted Qualification: The original judgment passage conditions this principle with "
                f"'{caveat}', which was omitted from the submitted quotation."
            )

    has_warnings = len(warnings) > 0

    return {
        "has_warnings": has_warnings,
        "warnings": warnings,
        "is_party_argument": is_party_arg,
        "is_dissent": is_dissent,
        "speaker_or_party": speaker_or_party,
        "omitted_qualifications": omitted_qualifications,
        "preceding_text": preceding_passage,
        "matched_text": matched_passage,
        "succeeding_text": succeeding_passage
    }
