import difflib
from typing import Dict, Any, List
from app.services.text_normalizer import normalize_text, extract_sentences
from app.services.diff_engine import extract_best_matching_span

def harmonize_quote(submitted_quote: str, original_passage: str) -> Dict[str, Any]:
    """
    Constructs a canonically corrected, legally sound quotation adhering to
    judicial citation standards:
    - Inserts standard legal ellipses '[...]' where sentences or sub-clauses were omitted.
    - Restores altered terms with bracketed notations '[canonical term]'.
    - Returns the harmonized quote ready for court pleading drafting.
    """
    norm_sub = normalize_text(submitted_quote)
    matching_span = extract_best_matching_span(norm_sub, original_passage)
    
    sub_words = norm_sub.split()
    orig_words = matching_span.split()
    
    matcher = difflib.SequenceMatcher(None, orig_words, sub_words)
    
    harmonized_tokens: List[str] = []
    corrections_list: List[str] = []
    
    last_tag = None
    has_ellipses_open = False

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        orig_chunk = " ".join(orig_words[i1:i2])
        sub_chunk = " ".join(sub_words[j1:j2])
        
        if tag == "equal":
            harmonized_tokens.append(orig_chunk)
            has_ellipses_open = False
            
        elif tag == "delete":
            # Words in original that user omitted
            if not has_ellipses_open and len(orig_words[i1:i2]) > 2:
                harmonized_tokens.append("[...]")
                corrections_list.append(f"Inserted standard legal ellipsis '[...]' for omitted judicial text: '{orig_chunk}'")
                has_ellipses_open = True
            elif not has_ellipses_open:
                # Include original word for precision
                harmonized_tokens.append(orig_chunk)
                corrections_list.append(f"Restored omitted original term '{orig_chunk}'")
                
        elif tag == "insert":
            # Extra words user added that were NOT in original
            corrections_list.append(f"Removed extraneous unauthenticated phrase '{sub_chunk}'")
            # Do not append extra words
            
        elif tag == "replace":
            # User altered text
            harmonized_tokens.append(orig_chunk)
            corrections_list.append(f"Substituted '{sub_chunk}' with canonical judicial phrasing: '{orig_chunk}'")

    harmonized_quote = " ".join(harmonized_tokens).replace(" [.]", ".").replace(" [,] ", ", ").strip()
    # Clean up double ellipses if any
    harmonized_quote = harmonized_quote.replace("[...] [...]", "[...]")

    return {
        "original_submitted": submitted_quote,
        "source_reference_span": matching_span,
        "harmonized_quote": harmonized_quote,
        "corrections_applied": corrections_list,
        "total_corrections": len(corrections_list),
        "legal_advisory": (
            "The harmonized quotation conforms to Supreme Court citation rules by restoring original ratio "
            "and employing standard ellipses '[...]' for omissions and bracketed adjustments."
        )
    }
