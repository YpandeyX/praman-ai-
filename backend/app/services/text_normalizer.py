import re
import unicodedata

def normalize_text(text: str) -> str:
    """
    Normalizes text for matching without destroying legal meaning:
    - Normalizes unicode characters
    - Normalizes quotes (curved quotes to standard quotes)
    - Normalizes dashes and hyphens
    - Collapses multiple whitespace and newlines into single spaces
    - Strips leading and trailing whitespace
    """
    if not text:
        return ""
    
    # Unicode normalize
    text = unicodedata.normalize("NFKC", text)
    
    # Replace curved quotes and accents
    text = re.sub(r'[\u2018\u2019\u201A\u201B\u2032]', "'", text)
    text = re.sub(r'[\u201C\u201D\u201E\u201F\u2033]', '"', text)
    text = re.sub(r'[\u2013\u2014\u2015]', "-", text)
    
    # Collapse whitespace and tabs/newlines
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_for_comparison(text: str) -> str:
    """
    Case-folded, punctuation-smoothed version specifically for token set / fuzzy matching.
    """
    cleaned = normalize_text(text).lower()
    # Remove basic punctuation for tolerant comparison
    cleaned = re.sub(r'[^\w\s]', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def extract_sentences(text: str) -> list[str]:
    """
    Splits text into legal sentences respecting abbreviations like v., vs., No., Art., Sec., Para., Ltd., Pvt., etc.
    """
    normalized = normalize_text(text)
    if not normalized:
        return []
    # Protect common legal abbreviations
    protected = normalized
    replacements = [
        ("v.", "v__DOT__"),
        ("vs.", "vs__DOT__"),
        ("No.", "No__DOT__"),
        ("Art.", "Art__DOT__"),
        ("Sec.", "Sec__DOT__"),
        ("Para.", "Para__DOT__"),
        ("Ltd.", "Ltd__DOT__"),
        ("Pvt.", "Pvt__DOT__"),
        ("U.O.I.", "U__DOT__O__DOT__I__DOT__"),
        ("U.P.", "U__DOT__P__DOT__"),
        ("S.C.R.", "S__DOT__C__DOT__R__DOT__"),
        ("S.C.C.", "S__DOT__C__DOT__C__DOT__"),
        ("A.I.R.", "A__DOT__I__DOT__R__DOT__"),
    ]
    for orig, rep in replacements:
        protected = re.sub(re.escape(orig), rep, protected, flags=re.IGNORECASE)
        
    sentences = re.split(r'(?<=[.!?])\s+', protected)
    
    restored = []
    for s in sentences:
        for orig, rep in replacements:
            s = s.replace(rep, orig)
        s = s.strip()
        if s:
            restored.append(s)
            
    return restored
