"""
NetraVote Data Pipeline
Handles: PDF/CSV ingestion, OCR, address normalization, duplicate detection
"""
import re
import io
from typing import Optional

def normalize_address(raw: str) -> str:
    """Normalize Indian addresses: lowercase, expand abbreviations, remove noise."""
    addr = raw.lower().strip()
    replacements = {
        r"\bs/o\b": "son of", r"\bd/o\b": "daughter of", r"\bw/o\b": "wife of",
        r"\bh\.no\.?\b": "house number", r"\bfl\.?\b": "flat",
        r"\bapt(s)?\.?\b": "apartments", r"\brd\.?\b": "road",
        r"\bst\.?\b": "street", r"\bnr\.?\b": "near",
        r"\bop\.?\b": "opposite", r"\bplt\.?\b": "plot",
        r"\bsoc\.?\b": "society", r"\bcol\.?\b": "colony",
    }
    for pat, rep in replacements.items():
        addr = re.sub(pat, rep, addr)
    addr = re.sub(r"[,\.]+", " ", addr)
    addr = re.sub(r"\s{2,}", " ", addr)
    return addr.strip()

def extract_voters_from_pdf(content: bytes, constituency: str) -> dict:
    """Extract voter records from electoral roll PDF (with OCR fallback)."""
    voters = []
    errors = []
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                for voter in _parse_voter_lines(text, constituency):
                    voters.append(voter)
    except ImportError:
        errors.append("pdfplumber not installed — using OCR fallback")
        voters = _ocr_fallback(content, constituency)
    except Exception as e:
        errors.append(f"PDF parse error: {e}")
        voters = _ocr_fallback(content, constituency)

    return {"count": len(voters), "voters": voters, "errors": errors, "constituency": constituency}

def _parse_voter_lines(text: str, constituency: str) -> list:
    """Parse structured text from electoral roll PDF pages."""
    voters = []
    lines = text.split("\n")
    epic_pattern = re.compile(r"[A-Z]{3}\d{7}")
    for i, line in enumerate(lines):
        epic_match = epic_pattern.search(line)
        if epic_match:
            epic = epic_match.group()
            parts = line.split()
            name = " ".join(p for p in parts if not re.match(r"[A-Z]{3}\d{7}|\d+", p))[:40]
            age_match = re.search(r"\b(\d{2})\b", line)
            age = int(age_match.group()) if age_match and 18 <= int(age_match.group()) <= 110 else 30
            voters.append({
                "epic_number": epic,
                "name": name.strip() or "UNKNOWN",
                "age": age,
                "constituency": constituency,
                "source": "PDF_EXTRACTION",
                "raw_line": line[:100]
            })
    return voters

def _ocr_fallback(content: bytes, constituency: str) -> list:
    """OCR fallback using pytesseract for scanned PDFs."""
    try:
        import pytesseract
        from PIL import Image
        import io as _io
        # Convert PDF to images would require pdf2image — return empty for now
        return []
    except ImportError:
        return []

def detect_phonetic_duplicates(voters: list) -> list:
    """Find voters with phonetically similar names (potential duplicates)."""
    try:
        import jellyfish
        duplicates = []
        for i, v1 in enumerate(voters):
            for v2 in voters[i+1:]:
                if v1.get("epic_number") == v2.get("epic_number"):
                    duplicates.append({"type": "EXACT_EPIC", "voter1": v1, "voter2": v2, "similarity": 1.0})
                    continue
                n1 = v1.get("name", "").upper()
                n2 = v2.get("name", "").upper()
                if n1 and n2:
                    jw = jellyfish.jaro_winkler_similarity(n1, n2)
                    s1 = jellyfish.soundex(n1.split()[0]) if n1.split() else ""
                    s2 = jellyfish.soundex(n2.split()[0]) if n2.split() else ""
                    if (jw > 0.92 and s1 == s2):
                        duplicates.append({"type": "PHONETIC_MATCH", "voter1": v1, "voter2": v2,
                                           "jaro_winkler": round(jw, 3), "soundex_match": True})
        return duplicates
    except ImportError:
        return []
def upsert_voters_to_tg(voters: list, constituency: str, tg_config: dict):
    """Upsert extracted voter data into TigerGraph."""
    try:
        import pyTigerGraph as tg
        conn = tg.TigerGraphConnection(
            host=tg_config["host"],
            graphname=tg_config["graph"],
            apiToken=tg_config["token"]
        )

        v_voter, v_addr, v_booth = {}, {}, {}
        e_reg, e_assign, e_located = [], [], []

        # Default Booth & Constituency
        const_id = constituency.replace(" ", "_")
        conn.upsertVertices("Constituency", [(const_id, {"const_name": constituency, "state": "Unknown"})])

        for v in voters:
            epic = v["epic_number"]
            addr_text = normalize_address(v.get("raw_line", "UNKNOWN"))
            addr_id = f"ADDR_{hash(addr_text) % 10**8}"
            booth_id = f"BOOTH_{const_id}_001" # Default booth for prototype

            # Vertices
            v_voter[epic] = {
                "name": v["name"],
                "age": v["age"],
                "epic_number": epic,
                "registration_date": v.get("added_date", "2024-01-01 00:00:00"),
                "constituency": constituency
            }
            v_addr[addr_id] = {"full_address": addr_text, "normalized": addr_text}
            v_booth[booth_id] = {"booth_name": f"Booth 001 - {constituency}", "constituency": constituency}

            # Edges
            e_reg.append((epic, addr_id, {}))
            e_assign.append((epic, booth_id, {}))
            e_located.append((addr_id, booth_id, {}))

        # Perform Upsert
        conn.upsertVertices("Voter", [(k, v) for k, v in v_voter.items()])
        conn.upsertVertices("Address", [(k, v) for k, v in v_addr.items()])
        conn.upsertVertices("Booth", [(k, v) for k, v in v_booth.items()])

        conn.upsertEdges("Voter", "REGISTERED_AT", "Address", e_reg)
        conn.upsertEdges("Voter", "ASSIGNED_TO", "Booth", e_assign)
        conn.upsertEdges("Booth", "BELONGS_TO", "Constituency", [(booth_id, const_id, {})])

        return True
    except Exception as e:
        print(f"TigerGraph Upsert Failed: {e}")
        return False
