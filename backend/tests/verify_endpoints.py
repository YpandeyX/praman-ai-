import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    # 1. Health
    h = json.loads(urllib.request.urlopen(f"{BASE_URL}/api/health").read().decode())
    print("HEALTH:", h["status"])

    # 2. Harmonize
    harm_payload = {
        "submitted_quote": "Privacy is core of dignity.",
        "original_passage": "Privacy is the constitutional core of human dignity."
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/advanced/harmonize",
        data=json.dumps(harm_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    harm_res = json.loads(urllib.request.urlopen(req).read().decode())
    print("HARMONIZED QUOTE:", harm_res["harmonized_quote"])

    # 3. Timeline
    t_res = json.loads(urllib.request.urlopen(f"{BASE_URL}/api/advanced/timeline/Puttaswamy").read().decode())
    print("TIMELINE DOCTRINE:", t_res["doctrine_name"], "NODES:", len(t_res["nodes"]))

    # 4. Citations format
    cite_payload = {
        "judgment_title": "Justice K.S. Puttaswamy v. Union of India",
        "citation": "(2017) 10 SCC 1",
        "para_number": 298
    }
    req2 = urllib.request.Request(
        f"{BASE_URL}/api/advanced/citations/format",
        data=json.dumps(cite_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    cite_res = json.loads(urllib.request.urlopen(req2).read().decode())
    print("SCC CITATION:", cite_res["scc"])

    # 5. Brief scan
    brief_doc = (
        'WRIT PETITION:\n'
        'The Supreme Court in "Privacy is the constitutional core of human dignity. Privacy has both positive and negative contents." '
        '[Justice K.S. Puttaswamy v. Union of India, (2017) 10 SCC 1] held that privacy is a fundamental right.'
    )
    req3 = urllib.request.Request(
        f"{BASE_URL}/api/advanced/scan-brief",
        data=json.dumps({"document_text": brief_doc}).encode(),
        headers={"Content-Type": "application/json"}
    )
    brief_res = json.loads(urllib.request.urlopen(req3).read().decode())
    print("BRIEF QUOTES DETECTED:", brief_res["total_quotes"], "STATUS:", brief_res["spans"][0]["status"])

    print("ALL ADVANCED ENDPOINTS VERIFIED SUCCESSFULLY OVER HTTP!")

if __name__ == "__main__":
    test_endpoints()
