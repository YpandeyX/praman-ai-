import re
import difflib
from typing import List, Dict, Any, Tuple
from app.services.text_normalizer import normalize_text, extract_sentences

CRITICAL_NEGATIONS = {
    "not", "never", "no", "neither", "nor", "none", "cannot", "without",
    "failed", "denied", "prohibited", "unlawful", "unconstitutional", "void", "invalid"
}

CRITICAL_MODALS = {
    ("shall", "may"), ("may", "shall"),
    ("must", "can"), ("can", "must"),
    ("mandatory", "discretionary"), ("discretionary", "mandatory"),
    ("binding", "persuasive"), ("persuasive", "binding"),
    ("absolute", "conditional"), ("conditional", "absolute"),
    ("fundamental", "statutory"), ("statutory", "fundamental"),
    ("void", "valid"), ("valid", "void")
}

NUMBER_PATTERN = re.compile(r'\b(?:\d{1,4}(?:,\d{3})*(?:\.\d+)?|\d+st|\d+nd|\d+rd|\d+th)\b')
DATE_PATTERN = re.compile(r'\b(?:19|20)\d{2}\b')

def extract_best_matching_span(submitted_text: str, source_text: str) -> str:
    """
    Extracts the best-matching sub-span or excerpt from a source passage for accurate diffing.
    This ensures that when a quote is an exact excerpt of a multi-sentence paragraph,
    the diff compares the quote to its actual corresponding excerpt rather than penalizing it
    for the unquoted remaining sentences of the paragraph.
    """
    from app.services.text_normalizer import normalize_for_comparison
    norm_sub = normalize_text(submitted_text)
    norm_src = normalize_text(source_text)
    
    sub_words = norm_sub.split()
    src_words = norm_src.split()
    
    # If source is shorter or comparable in length, compare directly
    if len(src_words) <= len(sub_words) + 3:
        return norm_src
        
    cmp_sub = normalize_for_comparison(norm_sub)
    cmp_src = normalize_for_comparison(norm_src)
    
    # Check if normalized quote is directly contained in normalized source
    if cmp_sub in cmp_src:
        # Check window sizes around target length
        for delta in range(0, 4):
            for sign in [0, 1, -1] if delta > 0 else [0]:
                w_size = len(sub_words) + (delta * sign)
                if w_size <= 0 or w_size > len(src_words):
                    continue
                for i in range(len(src_words) - w_size + 1):
                    window = " ".join(src_words[i:i + w_size])
                    if normalize_for_comparison(window) == cmp_sub:
                        return window

    # Otherwise sliding window
    best_ratio = 0.0
    best_span = norm_src
    window_sizes = [len(sub_words) + k for k in range(-3, 5) if len(sub_words) + k > 0]
    
    for w_size in window_sizes:
        for i in range(0, len(src_words) - w_size + 1):
            window = " ".join(src_words[i:i + w_size])
            r = difflib.SequenceMatcher(None, sub_words, window.split()).ratio()
            if r > best_ratio:
                best_ratio = r
                best_span = window
                
    return best_span

def compute_word_diff(submitted_text: str, source_text: str) -> Dict[str, Any]:
    """
    Computes a comprehensive word-level diff between the submitted quote and the source passage.
    Returns:
    - similarity_ratio
    - added_words (words in quote not in source)
    - removed_words (words in source missing from quote)
    - replaced_words (pairs of [submitted, source])
    - missing_sentences
    - critical_alterations (negation shifts, modal changes, dates/numbers)
    - chunks: list of DiffChunk for unified diff viewer
    - submitted_tokens_highlighted: list of tokens with visual tags for quote view
    - source_tokens_highlighted: list of tokens with visual tags for source view
    """
    norm_sub = normalize_text(submitted_text)
    norm_src = normalize_text(source_text)
    
    sub_words = norm_sub.split()
    src_words = norm_src.split()
    
    matcher = difflib.SequenceMatcher(None, src_words, sub_words)
    similarity_ratio = round(matcher.ratio(), 4)
    
    added_words: List[str] = []
    removed_words: List[str] = []
    replaced_words: List[Dict[str, str]] = []
    critical_alterations: List[Dict[str, str]] = []
    
    chunks: List[Dict[str, Any]] = []
    sub_highlights: List[Dict[str, Any]] = []
    src_highlights: List[Dict[str, Any]] = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        src_slice = src_words[i1:i2]
        sub_slice = sub_words[j1:j2]
        
        if tag == "equal":
            eq_text = " ".join(sub_slice)
            chunks.append({
                "type": "equal",
                "text": eq_text,
                "submitted_text": eq_text,
                "source_text": eq_text,
                "is_critical": False,
                "critical_reason": None
            })
            for w in sub_slice:
                sub_highlights.append({"word": w, "status": "equal"})
            for w in src_slice:
                src_highlights.append({"word": w, "status": "equal"})
                
        elif tag == "insert":
            # Words present in submitted quote, but NOT in source
            ins_text = " ".join(sub_slice)
            for w in sub_slice:
                added_words.append(w)
                is_crit, reason = check_critical_word(w, "")
                if is_crit:
                    critical_alterations.append({
                        "type": "addition",
                        "submitted": w,
                        "source": "",
                        "reason": reason
                    })
                sub_highlights.append({
                    "word": w,
                    "status": "inserted",
                    "is_critical": is_crit,
                    "critical_reason": reason
                })
            chunks.append({
                "type": "insert",
                "text": ins_text,
                "submitted_text": ins_text,
                "source_text": "",
                "is_critical": any(check_critical_word(w, "")[0] for w in sub_slice),
                "critical_reason": "Extra words introduced into quotation"
            })
            
        elif tag == "delete":
            # Words present in source, but OMITTED from submitted quote
            del_text = " ".join(src_slice)
            for w in src_slice:
                removed_words.append(w)
                is_crit, reason = check_critical_word("", w)
                if is_crit:
                    critical_alterations.append({
                        "type": "omission",
                        "submitted": "",
                        "source": w,
                        "reason": reason
                    })
                src_highlights.append({
                    "word": w,
                    "status": "deleted",
                    "is_critical": is_crit,
                    "critical_reason": reason
                })
            chunks.append({
                "type": "delete",
                "text": del_text,
                "submitted_text": "",
                "source_text": del_text,
                "is_critical": any(check_critical_word("", w)[0] for w in src_slice),
                "critical_reason": "Original words omitted from quotation"
            })
            
        elif tag == "replace":
            # Word substitution
            sub_text = " ".join(sub_slice)
            src_text = " ".join(src_slice)
            
            # Check for critical shifts
            is_crit, reason = check_critical_substitution(sub_text, src_text)
            if is_crit:
                critical_alterations.append({
                    "type": "replacement",
                    "submitted": sub_text,
                    "source": src_text,
                    "reason": reason
                })
                
            replaced_words.append({
                "submitted": sub_text,
                "source": src_text
            })
            
            chunks.append({
                "type": "replace",
                "text": f"{sub_text} (originally: {src_text})",
                "submitted_text": sub_text,
                "source_text": src_text,
                "is_critical": is_crit,
                "critical_reason": reason if is_crit else "Word substitution"
            })
            
            for w in sub_slice:
                sub_highlights.append({
                    "word": w,
                    "status": "replaced",
                    "original": src_text,
                    "is_critical": is_crit,
                    "critical_reason": reason
                })
            for w in src_slice:
                src_highlights.append({
                    "word": w,
                    "status": "replaced_by",
                    "replaced_with": sub_text,
                    "is_critical": is_crit,
                    "critical_reason": reason
                })

    # Sentence-level omission check
    missing_sentences = find_missing_sentences(norm_sub, norm_src)
    
    return {
        "similarity_ratio": similarity_ratio,
        "added_words": added_words[:50],
        "removed_words": removed_words[:50],
        "replaced_words": replaced_words[:50],
        "missing_sentences": missing_sentences,
        "critical_alterations": critical_alterations,
        "chunks": chunks,
        "submitted_tokens_highlighted": sub_highlights,
        "source_tokens_highlighted": src_highlights
    }

def check_critical_word(sub_w: str, src_w: str) -> Tuple[bool, str]:
    """Checks if a single word addition/omission is legally sensitive."""
    w = (sub_w or src_w).lower().strip(".,;:\"'()[]")
    if w in CRITICAL_NEGATIONS:
        action = "added" if sub_w else "omitted"
        return True, f"Critical negation word '{w}' was {action}, potentially reversing legal meaning."
    if NUMBER_PATTERN.match(w):
        action = "added" if sub_w else "omitted"
        return True, f"Numerical figure or date '{w}' was {action}."
    return False, ""

def check_critical_substitution(sub_text: str, src_text: str) -> Tuple[bool, str]:
    """Identifies critical legal semantic inversions between replaced phrases."""
    sub_l = sub_text.lower().strip(".,;:\"'()[]")
    src_l = src_text.lower().strip(".,;:\"'()[]")
    
    # Check modal verbs / legal directives
    for m1, m2 in CRITICAL_MODALS:
        if (m1 in sub_l and m2 in src_l) or (m2 in sub_l and m1 in src_l):
            return True, f"Legal modal altered: '{src_l}' was changed to '{sub_l}', transforming obligation/discretion."
            
    # Check negation inversion
    sub_has_neg = any(neg in sub_l.split() for neg in CRITICAL_NEGATIONS)
    src_has_neg = any(neg in src_l.split() for neg in CRITICAL_NEGATIONS)
    if sub_has_neg != src_has_neg:
        return True, f"Negation polarity shift: '{src_text}' vs '{sub_text}' inverts affirmation/denial."
        
    # Check numbers or dates
    sub_nums = NUMBER_PATTERN.findall(sub_text)
    src_nums = NUMBER_PATTERN.findall(src_text)
    if sub_nums != src_nums and (sub_nums or src_nums):
        return True, f"Discrepancy in date or numerical quantity: '{src_text}' -> '{sub_text}'."
        
    return False, ""

def find_missing_sentences(sub_text: str, src_text: str) -> List[str]:
    """Identifies complete sentences in the source passage omitted from the quotation."""
    src_sents = extract_sentences(src_text)
    sub_norm = sub_text.lower()
    missing: List[str] = []
    
    for sent in src_sents:
        # Check if 70% or more of sentence is absent
        sent_words = [w for w in sent.lower().split() if len(w) > 3]
        if not sent_words:
            continue
        found = sum(1 for w in sent_words if w in sub_norm)
        if (found / len(sent_words)) < 0.4:
            missing.append(sent)
            
    return missing
