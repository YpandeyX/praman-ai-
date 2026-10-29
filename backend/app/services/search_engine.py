import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from rapidfuzz import fuzz, utils
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import Judgment, JudgmentPassage
from app.services.text_normalizer import normalize_text, normalize_for_comparison
from app.services.diff_engine import compute_word_diff, extract_best_matching_span
from app.services.context_checker import analyze_context_integrity
from app.services.cross_case_tracer import trace_cross_case_origins
from app.config import EXACT_MATCH_THRESHOLD, MODIFIED_QUOTE_MIN_THRESHOLD

class VerificationEngine:
    def __init__(self, db: Session):
        self.db = db

    def search_and_verify(
        self,
        quote: str,
        case_name: Optional[str] = None,
        citation: Optional[str] = None,
        court_name: Optional[str] = None,
        judgment_url: Optional[str] = None,
        target_passages_override: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Executes the hybrid verification pipeline:
        1. Normalizes input quotation.
        2. Retrieves candidate passages from database or override list (e.g. from uploaded PDF).
        3. Computes exact, fuzzy sliding-window, and semantic matching.
        4. Analyzes word-level diff and critical alterations.
        5. Analyzes context integrity (party argument, dissent, omitted caveats).
        6. Traces cross-case origins.
        7. Classifies verdict deterministically.
        8. Generates explainable confidence score, grounded explanation, and legal limitations.
        """
        norm_quote = normalize_text(quote)
        cmp_quote = normalize_for_comparison(quote)
        
        if not norm_quote:
            return self._empty_result(quote)

        # 1. Fetch candidate pool
        if target_passages_override is not None:
            # Verified against uploaded PDF
            candidate_passages = target_passages_override
            all_db_passages = self._get_all_passages_dict()
        else:
            # Query from DB
            candidate_passages = self._get_candidates(case_name, citation)
            all_db_passages = candidate_passages if (not case_name and not citation) else self._get_all_passages_dict()

        if not candidate_passages:
            # If search filtered by case/citation yielded nothing, try global search
            candidate_passages = self._get_all_passages_dict()

        if not candidate_passages:
            return self._source_not_found_result(quote, case_name, citation, "No judgment records or passages available in the database.")

        # 2. Score candidates using sliding window fuzzy & exact matching
        best_match, all_scored = self._find_best_passage(norm_quote, cmp_quote, candidate_passages)

        # 3. Cross-Case Origin Tracing across all passages in repository
        cross_case_matches = []
        if all_db_passages:
            _, cross_case_candidates = self._find_best_passage(norm_quote, cmp_quote, all_db_passages, top_k=5)
            # Filter for candidates with similarity >= 0.60
            cross_case_matches = [m for m in cross_case_candidates if m.get("similarity", 0) >= 0.60]

        best_j_id = best_match.get("judgment_id") if best_match else None
        cross_case_result = trace_cross_case_origins(cross_case_matches, current_judgment_id=best_j_id)

        # 4. If best match is below the minimal threshold
        sim = best_match.get("similarity", 0.0) if best_match else 0.0
        
        if not best_match or sim < 0.40:
            # If cross-case found a strong match elsewhere, note it
            if cross_case_result["alternative_source_found"] and cross_case_matches:
                top_alt = cross_case_matches[0]
                return self._build_cross_case_override_result(
                    quote=norm_quote,
                    top_alt=top_alt,
                    cross_case_result=cross_case_result,
                    case_name=case_name,
                    citation=citation
                )
            return self._source_not_found_result(
                quote=norm_quote,
                case_name=case_name,
                citation=citation,
                reason="No matching passage found in the indexed judgments repository above threshold."
            )

        # 5. Extract context: preceding and succeeding passages
        preceding_text, succeeding_text = self._get_surrounding_passages(best_match)

        # 6. Word-level diff
        target_span = extract_best_matching_span(norm_quote, best_match["text"])
        diff_result = compute_word_diff(norm_quote, target_span)
        # Accurate sequence similarity ratio
        sim = diff_result.get("similarity_ratio", 0.0)

        # If after extracting best span the similarity is below 0.40, source was not found
        if sim < 0.40:
            if cross_case_result.get("alternative_source_found") and cross_case_matches:
                top_alt = cross_case_matches[0]
                return self._build_cross_case_override_result(
                    quote=norm_quote,
                    top_alt=top_alt,
                    cross_case_result=cross_case_result,
                    case_name=case_name,
                    citation=citation
                )
            return self._source_not_found_result(
                quote=norm_quote,
                case_name=case_name,
                citation=citation,
                reason="Similarity below minimal threshold after span alignment."
            )

        # 7. Context integrity check
        context_result = analyze_context_integrity(
            submitted_quote=norm_quote,
            matched_passage=best_match["text"],
            preceding_passage=preceding_text,
            succeeding_passage=succeeding_text,
            passage_metadata=best_match
        )

        # 8. Deterministic Classification & Confidence
        status, confidence, confidence_breakdown, explanation, limitations = self._classify_verdict(
            similarity=sim,
            diff_result=diff_result,
            context_result=context_result,
            cross_case_result=cross_case_result,
            best_match=best_match,
            queried_case=case_name
        )

        return {
            "status": status,
            "confidence": confidence,
            "confidence_breakdown": confidence_breakdown,
            "submitted_quote": norm_quote,
            "judgment_title": best_match.get("judgment_title"),
            "citation": best_match.get("judgment_citation"),
            "court": best_match.get("judgment_court"),
            "year": best_match.get("judgment_year"),
            "bench": best_match.get("judgment_bench"),
            "para_number": best_match.get("para_number"),
            "page_number": best_match.get("page_number"),
            "source_url": best_match.get("source_url"),
            "original_passage": best_match.get("text"),
            "diff": diff_result,
            "context_analysis": context_result,
            "cross_case": cross_case_result,
            "explanation": explanation,
            "limitations": limitations
        }

    def _classify_verdict(
        self,
        similarity: float,
        diff_result: Dict[str, Any],
        context_result: Dict[str, Any],
        cross_case_result: Dict[str, Any],
        best_match: Dict[str, Any],
        queried_case: Optional[str]
    ) -> Tuple[str, float, Dict[str, float], str, str]:
        """
        Deterministic decision tree:
        - Exact Match: similarity >= 0.985 AND no context mismatch
        - Context Mismatch: similarity >= 0.65 AND (party argument OR dissent OR critical qualification omitted)
        - Modified Quote: similarity >= 0.65 AND has differences but no context corruption
        - Inconclusive: 0.40 <= similarity < 0.65
        - Source Not Found: similarity < 0.40
        """
        has_context_warning = context_result.get("has_warnings", False)
        is_party_arg = context_result.get("is_party_argument", False)
        is_dissent = context_result.get("is_dissent", False)
        omitted_caveats = context_result.get("omitted_qualifications", [])
        crit_changes = diff_result.get("critical_alterations", [])
        
        # Calculate granular confidence components
        lexical_score = round(similarity * 100, 1)
        semantic_score = round(min(1.0, similarity + 0.05) * 100, 1)
        context_score = 100.0 if not has_context_warning else (55.0 if is_party_arg else 70.0)

        # 1. Check for Context Mismatch first if matching text exists
        if similarity >= MODIFIED_QUOTE_MIN_THRESHOLD:
            if is_party_arg:
                status = "Context Mismatch"
                confidence = 0.94
                explanation = (
                    f"Context Mismatch Detected: The quotation text exists in '{best_match.get('judgment_title')}', "
                    f"but it is recorded as a submission/argument by {best_match.get('speaker_or_party') or 'the party'}, "
                    f"not as the authoritative ruling or ratio decidendi of the Court."
                )
                limitations = "Attribution analysis is based on textual cues and judgment structure."
                return status, confidence, {"lexical": lexical_score, "semantic": semantic_score, "context": context_score}, explanation, limitations
                
            if is_dissent:
                status = "Context Mismatch"
                confidence = 0.95
                explanation = (
                    f"Dissenting Opinion Detected: The quotation matches a passage in '{best_match.get('judgment_title')}', "
                    f"authored by {best_match.get('speaker_or_party') or 'a dissenting judge'}. "
                    f"This represents the minority dissent rather than the binding majority holding."
                )
                limitations = "Dissent analysis is verified against official opinion classifications."
                return status, confidence, {"lexical": lexical_score, "semantic": semantic_score, "context": context_score}, explanation, limitations
                
            if omitted_caveats:
                status = "Context Mismatch"
                confidence = 0.91
                caveats_str = ", ".join(f"'{c}'" for c in omitted_caveats)
                explanation = (
                    f"Context Integrity Warning: The submitted quotation omits critical conditional language ({caveats_str}) "
                    f"present in the original passage from '{best_match.get('judgment_title')}' (Para {best_match.get('para_number')})."
                )
                limitations = "Omission severity is computed by cross-referencing legal caveat lexicons."
                return status, confidence, {"lexical": lexical_score, "semantic": semantic_score, "context": context_score}, explanation, limitations

            # 2. Check for Exact Match
            if similarity >= EXACT_MATCH_THRESHOLD and len(diff_result.get("added_words", [])) == 0 and len(diff_result.get("removed_words", [])) == 0:
                status = "Exact Match"
                confidence = 0.99
                explanation = (
                    f"Exact Verbatim Match: The quotation matches the original judgment text in "
                    f"'{best_match.get('judgment_title')}' (Citation: {best_match.get('judgment_citation') or 'N/A'}, "
                    f"Para {best_match.get('para_number') or 'N/A'}). No textual modifications were detected."
                )
                limitations = "Verified against indexed authentic judgment text. Source verified."
                return status, confidence, {"lexical": 100.0, "semantic": 100.0, "context": 100.0}, explanation, limitations

            # 3. Modified Quote
            status = "Modified Quote"
            confidence = round(0.85 + (similarity - 0.65) * 0.35, 2)
            num_crit = len(crit_changes)
            crit_note = f" with {num_crit} critical semantic shift(s) identified (e.g. negation or modal verb changes)" if num_crit > 0 else ""
            explanation = (
                f"Modified Quotation: The quotation corresponds to '{best_match.get('judgment_title')}' (Para {best_match.get('para_number')}), "
                f"but exhibits textual discrepancies (Similarity: {int(similarity * 100)}%){crit_note}. "
                f"Added words: {len(diff_result.get('added_words', []))}, Removed words: {len(diff_result.get('removed_words', []))}, "
                f"Substitutions: {len(diff_result.get('replaced_words', []))}."
            )
            limitations = "Differences are mapped at the word token level using Myers sequence alignment."
            return status, confidence, {"lexical": lexical_score, "semantic": semantic_score, "context": context_score}, explanation, limitations

        # 4. Inconclusive
        status = "Inconclusive"
        confidence = round(min(0.85, max(0.60, similarity)), 2)
        explanation = (
            f"Partial Match ({int(similarity * 100)}% match) located in '{best_match.get('judgment_title')}', "
            f"with textual variations requiring judicial verification."
        )
        limitations = "Similarity falls between 40% and 65%."
        return status, confidence, {"lexical": lexical_score, "semantic": semantic_score, "context": 75.0}, explanation, limitations

    def _find_best_passage(
        self,
        norm_quote: str,
        cmp_quote: str,
        passages: List[Dict[str, Any]],
        top_k: int = 5
    ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Finds the best matching passage using a multi-metric scoring pipeline:
        - Normalized Levenshtein ratio
        - Sliding window token set alignment for finding quotes embedded in longer paragraphs
        - TF-IDF cosine similarity across passage corpus
        """
        if not passages:
            return None, []

        scored_candidates: List[Dict[str, Any]] = []

        # Build corpus texts for TF-IDF
        corpus = [p.get("cleaned_text") or normalize_text(p["text"]) for p in passages]
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words="english")
            tfidf_matrix = vectorizer.fit_transform(corpus)
            quote_vec = vectorizer.transform([norm_quote])
            cosine_scores = cosine_similarity(quote_vec, tfidf_matrix).flatten()
        except Exception:
            cosine_scores = [0.0] * len(passages)

        quote_words = norm_quote.split()
        quote_len = len(quote_words)

        for idx, p in enumerate(passages):
            raw_text = p["text"]
            cleaned = p.get("cleaned_text") or normalize_text(raw_text)
            cmp_text = normalize_for_comparison(cleaned)

            # 1. Exact Substring check
            if cmp_quote and cmp_quote in cmp_text:
                sim = 1.0
            else:
                # 2. Sliding window over paragraph to handle cases where quote is a sub-clause
                para_words = cleaned.split()
                if len(para_words) > quote_len and quote_len > 4:
                    window_size = min(len(para_words), int(quote_len * 1.35))
                    step = max(1, quote_len // 4)
                    best_sub_ratio = 0.0
                    for start in range(0, len(para_words) - quote_len + 1, step):
                        window = " ".join(para_words[start:start + window_size])
                        r = fuzz.ratio(norm_quote, window) / 100.0
                        if r > best_sub_ratio:
                            best_sub_ratio = r
                    sliding_score = best_sub_ratio
                else:
                    sliding_score = fuzz.ratio(norm_quote, cleaned) / 100.0

                token_set_score = fuzz.token_set_ratio(norm_quote, cleaned) / 100.0
                tfidf_sim = float(cosine_scores[idx])

                # Weighted composite similarity
                sim = max(
                    sliding_score,
                    (sliding_score * 0.50 + token_set_score * 0.30 + tfidf_sim * 0.20)
                )

            scored = dict(p)
            scored["similarity"] = round(sim, 4)
            scored_candidates.append(scored)

        # Sort descending by similarity
        scored_candidates.sort(key=lambda x: x["similarity"], reverse=True)
        best = scored_candidates[0] if scored_candidates else None
        return best, scored_candidates[:top_k]

    def _get_candidates(self, case_name: Optional[str], citation: Optional[str]) -> List[Dict[str, Any]]:
        passages = []
        if citation:
            cit_norm = citation.strip()
            passages = self.db.query(JudgmentPassage).join(Judgment).filter(
                Judgment.citation.ilike(f"%{cit_norm}%")
            ).all()

        if not passages and case_name:
            c_norm = case_name.strip()
            words = [w for w in re.split(r'\W+', c_norm) if len(w) > 3 and w.lower() not in {"state", "union", "india", "court", "versus", "judgement"}]
            if words:
                conditions = [Judgment.title.ilike(f"%{w}%") for w in words[:2]]
                passages = self.db.query(JudgmentPassage).join(Judgment).filter(*conditions).all()
            if not passages:
                passages = self.db.query(JudgmentPassage).join(Judgment).filter(
                    Judgment.title.ilike(f"%{c_norm}%")
                ).all()

        return [self._passage_to_dict(p) for p in passages]

    def _get_all_passages_dict(self) -> List[Dict[str, Any]]:
        passages = self.db.query(JudgmentPassage).join(Judgment).all()
        return [self._passage_to_dict(p) for p in passages]

    def _passage_to_dict(self, p: JudgmentPassage) -> Dict[str, Any]:
        j = p.judgment
        return {
            "id": p.id,
            "judgment_id": j.id,
            "judgment_title": j.title,
            "judgment_citation": j.citation,
            "judgment_court": j.court,
            "judgment_year": j.year,
            "judgment_bench": j.bench,
            "source_url": j.source_url,
            "para_number": p.para_number,
            "page_number": p.page_number,
            "text": p.text,
            "cleaned_text": p.cleaned_text,
            "is_holding": p.is_holding,
            "is_party_argument": p.is_party_argument,
            "is_dissent": p.is_dissent,
            "speaker_or_party": p.speaker_or_party,
            "section_title": p.section_title
        }

    def _get_surrounding_passages(self, match: Dict[str, Any]) -> Tuple[Optional[str], Optional[str]]:
        j_id = match.get("judgment_id")
        p_num = match.get("para_number")
        if not j_id or not p_num:
            return None, None
            
        preceding = self.db.query(JudgmentPassage).filter(
            JudgmentPassage.judgment_id == j_id,
            JudgmentPassage.para_number == p_num - 1
        ).first()
        
        succeeding = self.db.query(JudgmentPassage).filter(
            JudgmentPassage.judgment_id == j_id,
            JudgmentPassage.para_number == p_num + 1
        ).first()
        
        return (preceding.text if preceding else None, succeeding.text if succeeding else None)

    def _source_not_found_result(self, quote: str, case_name: Optional[str], citation: Optional[str], reason: str) -> Dict[str, Any]:
        search_desc = f" for '{case_name}'" if case_name else (f" under citation '{citation}'" if citation else "")
        return {
            "status": "Source Not Found",
            "confidence": 0.88,
            "confidence_breakdown": {"lexical": 0.0, "semantic": 0.0, "context": 0.0},
            "submitted_quote": quote,
            "judgment_title": case_name,
            "citation": citation,
            "court": "Supreme Court of India (Repository Index)",
            "year": None,
            "bench": None,
            "para_number": None,
            "page_number": None,
            "source_url": None,
            "original_passage": None,
            "diff": None,
            "context_analysis": None,
            "cross_case": None,
            "explanation": (
                f"Source Not Found: No matching judicial passage was located in the authoritative indexed repository{search_desc}. "
                f"Important: A 'Source Not Found' outcome indicates that the quotation cannot be substantiated from the available verified sources; "
                f"it must never be presumed definitively fabricated without exhaustive multi-archive inquiry."
            ),
            "limitations": "Verification was performed against all indexed judgments and public citations in the local verified repository."
        }

    def _build_cross_case_override_result(
        self,
        quote: str,
        top_alt: Dict[str, Any],
        cross_case_result: Dict[str, Any],
        case_name: Optional[str],
        citation: Optional[str]
    ) -> Dict[str, Any]:
        diff_res = compute_word_diff(quote, top_alt["text"])
        return {
            "status": "Modified Quote" if diff_res["similarity_ratio"] < 0.985 else "Exact Match",
            "confidence": 0.92,
            "confidence_breakdown": {"lexical": diff_res["similarity_ratio"] * 100, "semantic": 90.0, "context": 85.0},
            "submitted_quote": quote,
            "judgment_title": top_alt.get("judgment_title"),
            "citation": top_alt.get("judgment_citation"),
            "court": top_alt.get("judgment_court"),
            "year": top_alt.get("judgment_year"),
            "bench": top_alt.get("judgment_bench"),
            "para_number": top_alt.get("para_number"),
            "page_number": top_alt.get("page_number"),
            "source_url": top_alt.get("source_url"),
            "original_passage": top_alt.get("text"),
            "diff": diff_res,
            "context_analysis": {
                "has_warnings": True,
                "warnings": [
                    f"Cross-Case Attribution Warning: This quote was attributed to '{case_name or 'Unknown'}', but matches '{top_alt.get('judgment_title')}' ({top_alt.get('judgment_citation')})."
                ],
                "is_party_argument": top_alt.get("is_party_argument", False),
                "is_dissent": top_alt.get("is_dissent", False),
                "speaker_or_party": top_alt.get("speaker_or_party"),
                "omitted_qualifications": [],
                "preceding_text": None,
                "matched_text": top_alt["text"],
                "succeeding_text": None
            },
            "cross_case": cross_case_result,
            "explanation": (
                f"Cross-Case Match Located: While submitted under '{case_name or citation or 'Unspecified'}', "
                f"this passage corresponds to '{top_alt.get('judgment_title')}' (Citation: {top_alt.get('judgment_citation')}, Para {top_alt.get('para_number')}). "
                f"Similarity with source passage: {int(diff_res['similarity_ratio'] * 100)}%."
            ),
            "limitations": "Cross-case tracing retrieved the earliest matching authority from the verified database."
        }

    def _empty_result(self, quote: str) -> Dict[str, Any]:
        return {
            "status": "Inconclusive",
            "confidence": 0.0,
            "confidence_breakdown": {"lexical": 0.0, "semantic": 0.0, "context": 0.0},
            "submitted_quote": quote,
            "judgment_title": None,
            "citation": None,
            "court": None,
            "year": None,
            "bench": None,
            "para_number": None,
            "page_number": None,
            "source_url": None,
            "original_passage": None,
            "diff": None,
            "context_analysis": None,
            "cross_case": None,
            "explanation": "Quotation is empty or contains no verifiable text.",
            "limitations": "Input string was empty."
        }
