from typing import List, Dict, Any, Optional

def trace_cross_case_origins(
    target_matches: List[Dict[str, Any]],
    current_judgment_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Analyzes multiple judgment passage matches to identify if a quotation originated
    or appeared in an earlier case or alternative trusted source.
    """
    if not target_matches:
        return {
            "alternative_source_found": False,
            "earliest_case_title": None,
            "earliest_citation": None,
            "earliest_year": None,
            "earliest_court": None,
            "trace_summary": None,
            "all_matching_cases": []
        }
        
    # Group by judgment
    distinct_cases: Dict[int, Dict[str, Any]] = {}
    for match in target_matches:
        j_id = match.get("judgment_id")
        if not j_id:
            continue
        if j_id not in distinct_cases or match.get("similarity", 0) > distinct_cases[j_id].get("similarity", 0):
            distinct_cases[j_id] = match

    case_list = list(distinct_cases.values())
    
    # Sort by year ascending (earliest first)
    case_list.sort(key=lambda x: (x.get("judgment_year") or 9999, -(x.get("similarity") or 0)))
    
    # If there are multiple cases or the earliest case is different from current_judgment_id
    earliest = case_list[0] if case_list else None
    
    alternative_found = False
    trace_summary = None
    
    if len(case_list) > 1:
        alternative_found = True
        trace_summary = (
            f"Cross-Case Trace: Quotation appears in {len(case_list)} distinct indexed decisions. "
            f"The earliest recorded instance in the repository is '{earliest.get('judgment_title')}' "
            f"({earliest.get('judgment_year') or 'Year Unknown'}), citation: {earliest.get('judgment_citation') or 'N/A'}."
        )
    elif earliest and current_judgment_id and earliest.get("judgment_id") != current_judgment_id:
        alternative_found = True
        trace_summary = (
            f"Alternative Source Found: The quotation strongly matches '{earliest.get('judgment_title')}' "
            f"({earliest.get('judgment_year') or 'N/A'}), citation: {earliest.get('judgment_citation') or 'N/A'}, "
            f"rather than the submitted case reference."
        )
        
    return {
        "alternative_source_found": alternative_found,
        "earliest_case_title": earliest.get("judgment_title") if earliest else None,
        "earliest_citation": earliest.get("judgment_citation") if earliest else None,
        "earliest_year": earliest.get("judgment_year") if earliest else None,
        "earliest_court": earliest.get("judgment_court") if earliest else None,
        "trace_summary": trace_summary,
        "all_matching_cases": [
            {
                "judgment_id": c.get("judgment_id"),
                "title": c.get("judgment_title"),
                "citation": c.get("judgment_citation"),
                "year": c.get("judgment_year"),
                "similarity": c.get("similarity"),
                "para_number": c.get("para_number")
            }
            for c in case_list
        ]
    }
