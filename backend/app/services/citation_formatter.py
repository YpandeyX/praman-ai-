import re
from typing import Dict, Any, Optional

def format_citations(
    judgment_title: str,
    citation: Optional[str] = None,
    court: Optional[str] = "Supreme Court of India",
    year: Optional[int] = None,
    para_number: Optional[int] = None,
    page_number: Optional[int] = None,
    quote_text: Optional[str] = None,
) -> Dict[str, str]:
    """
    Generates standardized judicial citations and ready-to-paste court pleading blockquotes
    across multiple legal citation formats.
    """
    clean_title = judgment_title.strip() if judgment_title else "Anonymous Case"
    pin_para = f", para {para_number}" if para_number else ""
    pin_page = f", at p. {page_number}" if page_number else ""

    # 1. Supreme Court Cases (SCC) Style
    if citation and "SCC" in citation.upper():
        scc_cite = f"{clean_title}, {citation}{pin_page}{pin_para}"
    else:
        cit_str = citation or f"({year or 'Year Unknown'}) SCC"
        scc_cite = f"{clean_title}, {cit_str}{pin_page}{pin_para}"

    # 2. All India Reporter (AIR) Style
    air_year = year or (re.search(r'\b(19\d{2}|20\d{2})\b', citation or '') and re.search(r'\b(19\d{2}|20\d{2})\b', citation or '').group(0)) or "2017"
    air_cite = f"{clean_title}, AIR {air_year} SC {page_number or '1'}{pin_para}"

    # 3. Neutral Citation Format (Official Indian Supreme Court e-Courts INSC standard)
    insc_year = year or air_year
    insc_num = page_number or (para_number or 101)
    neutral_cite = f"{clean_title}, {insc_year} INSC {insc_num}{pin_para}"

    # 4. Standard Academic / Bluebook / OSCOLA Format
    bluebook_cite = f"{clean_title}, {citation or ''} ({court or 'India: Supreme Court'})"
    if para_number:
        bluebook_cite += f", [¶{para_number}]"

    # 5. Court Pleading Indented Blockquote (Ready for Writ Petition / SLP drafting)
    quote_body = quote_text.strip() if quote_text else ""
    pleading_blockquote = (
        f'    "{quote_body}"\n\n'
        f"    — Per {court or 'Supreme Court of India'} in {clean_title} [{scc_cite}]."
    )

    return {
        "scc": scc_cite,
        "air": air_cite,
        "neutral_insc": neutral_cite,
        "bluebook": bluebook_cite,
        "pleading_blockquote": pleading_blockquote,
    }
