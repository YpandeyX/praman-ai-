from typing import Dict, Any, List, Optional

DOCTRINE_REGISTRY = {
    "privacy": {
        "doctrine_name": "Right to Privacy & Human Dignity",
        "description": "Evolution of the fundamental right to privacy under Article 21 from early denial to constitutional landmark.",
        "nodes": [
            {
                "year": 1954,
                "case_title": "M.P. Sharma v. Satish Chandra",
                "citation": "1954 SCR 1077",
                "bench": "8-Judge Bench",
                "ruling_summary": "Held that the Indian Constitution does not explicitly protect a right to privacy akin to the US Fourth Amendment.",
                "status": "Overruled",
                "impact": "Set early precedent denying constitutional privacy protection for over 6 decades."
            },
            {
                "year": 1962,
                "case_title": "Kharak Singh v. State of U.P.",
                "citation": "AIR 1963 SC 1295",
                "bench": "6-Judge Bench",
                "ruling_summary": "Majority held domiciliary visits violated personal liberty, but denied privacy as a fundamental right. Subba Rao, J. dissented.",
                "status": "Partially Overruled",
                "impact": "Subba Rao, J.'s dissent laid the intellectual seed for privacy as an essential ingredient of liberty."
            },
            {
                "year": 1975,
                "case_title": "Govind v. State of M.P.",
                "citation": "(1975) 2 SCC 148",
                "bench": "3-Judge Bench (Mathew, J.)",
                "ruling_summary": "Recognized a limited, evolving right to privacy subject to compelling state interest.",
                "status": "Precursor",
                "impact": "First judicial acknowledgment of privacy rights in Indian jurisprudence."
            },
            {
                "year": 1978,
                "case_title": "Maneka Gandhi v. Union of India",
                "citation": "(1978) 1 SCC 248",
                "bench": "7-Judge Bench",
                "ruling_summary": "Interlinked Articles 14, 19, and 21. Procedure depriving personal liberty must be just, fair and reasonable.",
                "status": "Foundational",
                "impact": "Expanded Article 21 to cover substantive due process and personal dignity."
            },
            {
                "year": 2017,
                "case_title": "Justice K.S. Puttaswamy (Retd.) v. Union of India",
                "citation": "(2017) 10 SCC 1",
                "bench": "9-Judge Constitution Bench (Unanimous)",
                "ruling_summary": "Unanimously affirmed the Right to Privacy as an intrinsic fundamental right under Article 21. Overruled M.P. Sharma and Kharak Singh.",
                "status": "Authoritative Landmark",
                "impact": "Established the 3-fold proportionality test (Legality, Legitimate Aim, Proportionality)."
            }
        ]
    },
    "basic_structure": {
        "doctrine_name": "Basic Structure Doctrine",
        "description": "Evolution of constitutional limitations on Parliament's constituent amending power under Article 368.",
        "nodes": [
            {
                "year": 1951,
                "case_title": "Shankari Prasad v. Union of India",
                "citation": "AIR 1951 SC 458",
                "bench": "5-Judge Bench",
                "ruling_summary": "Held that Parliament's power to amend the Constitution under Article 368 includes the power to amend Fundamental Rights.",
                "status": "Overruled",
                "impact": "Early absolute parliamentary sovereignty doctrine."
            },
            {
                "year": 1967,
                "case_title": "I.C. Golaknath v. State of Punjab",
                "citation": "AIR 1967 SC 1643",
                "bench": "11-Judge Bench",
                "ruling_summary": "Held by 6:5 majority that Fundamental Rights are transcendental and Parliament cannot abridge them via amendment.",
                "status": "Overruled",
                "impact": "Triggered constitutional amendments 24th and 25th leading to Kesavananda."
            },
            {
                "year": 1973,
                "case_title": "Kesavananda Bharati v. State of Kerala",
                "citation": "(1973) 4 SCC 225",
                "bench": "13-Judge Constitution Bench",
                "ruling_summary": "Held by 7:6 majority that Parliament cannot alter the basic structure or framework of the Constitution.",
                "status": "Foundational & Authoritative",
                "impact": "Established the cornerstone of Indian constitutionalism and judicial review."
            },
            {
                "year": 1980,
                "case_title": "Minerva Mills Ltd. v. Union of India",
                "citation": "(1980) 3 SCC 625",
                "bench": "5-Judge Bench",
                "ruling_summary": "Struck down clauses barring judicial review. Held the balance between Fundamental Rights and Directive Principles is basic structure.",
                "status": "Affirmed & Reinforced",
                "impact": "Consolidated the irrevocable nature of the Basic Structure doctrine."
            }
        ]
    },
    "due_process": {
        "doctrine_name": "Procedure Established by Law & Substantive Due Process",
        "description": "Shift from formalistic procedure to substantive fairness and golden triangle inter-relationship.",
        "nodes": [
            {
                "year": 1950,
                "case_title": "A.K. Gopalan v. State of Madras",
                "citation": "AIR 1950 SC 27",
                "bench": "6-Judge Bench",
                "ruling_summary": "Restricted Article 21 strictly to positive enacted law. Held Articles 19 and 21 were mutually exclusive water-tight compartments.",
                "status": "Overruled",
                "impact": "Subjugated personal liberty to state legislative fiat for 28 years."
            },
            {
                "year": 1976,
                "case_title": "ADM Jabalpur v. Shivkant Shukla",
                "citation": "(1976) 2 SCC 521",
                "bench": "5-Judge Bench",
                "ruling_summary": "Majority held no citizen has locus standi to move court for Habeas Corpus during Emergency. Khanna, J. dissented.",
                "status": "Overruled",
                "impact": "Justice Khanna's dissent preserved the inviolability of natural life and liberty."
            },
            {
                "year": 1978,
                "case_title": "Maneka Gandhi v. Union of India",
                "citation": "(1978) 1 SCC 248",
                "bench": "7-Judge Bench",
                "ruling_summary": "Overruled Gopalan. Held that procedure under Article 21 must satisfy principles of natural justice and reasonableness under Article 14.",
                "status": "Foundational & Authoritative",
                "impact": "Infused American substantive due process into Indian constitutional jurisprudence."
            }
        ]
    }
}

def get_doctrine_lineage_for_case(case_name: Optional[str]) -> Dict[str, Any]:
    """
    Returns the doctrine evolution graph matching the case or doctrine theme.
    """
    if not case_name:
        return DOCTRINE_REGISTRY["privacy"]
        
    c_lower = case_name.lower()
    if "puttaswamy" in c_lower or "privacy" in c_lower or "aadhar" in c_lower:
        return DOCTRINE_REGISTRY["privacy"]
    elif "kesavananda" in c_lower or "bharati" in c_lower or "minerva" in c_lower or "amend" in c_lower:
        return DOCTRINE_REGISTRY["basic_structure"]
    elif "maneka" in c_lower or "gandhi" in c_lower or "jabalpur" in c_lower or "gopalan" in c_lower:
        return DOCTRINE_REGISTRY["due_process"]
    else:
        # Default to privacy doctrine as reference
        return DOCTRINE_REGISTRY["privacy"]
