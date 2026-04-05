"""
NetraVote Risk Scoring Engine
Implements the full 7-signal weighted scoring system (0-100).
Classifies voters as: Clean / Watch / Suspicious / Ghost Voter
"""
import random
import hashlib


SIGNAL_WEIGHTS = {
    "address_overcrowding": 30,
    "epic_duplication":     25,
    "impossible_family":    20,
    "no_aadhaar":           15,
    "multi_booth":          15,
    "temporal_anomaly":     10,
    "cross_pincode":        10,
}

CLASSIFICATION = [
    (80, "GHOST_VOTER",  "Critical"),
    (60, "SUSPICIOUS",   "High"),
    (30, "WATCH",        "Medium"),
    (0,  "CLEAN",        "Low"),
]


def classify(score: float) -> dict:
    for threshold, label, severity in CLASSIFICATION:
        if score >= threshold:
            return {"label": label, "severity": severity, "threshold": threshold}
    return {"label": "CLEAN", "severity": "Low", "threshold": 0}


def compute_voter_risk(voter_id: str, signals: dict = None) -> dict:
    """
    Compute normalized risk score (0–100) from weighted signals.
    If signals not provided, mock values are generated from voter_id hash.
    """
    if signals is None:
        # Deterministically generate signals from voter_id for demo
        seed = int(hashlib.md5(voter_id.encode()).hexdigest(), 16) % 1000
        random.seed(seed)
        is_ghost = "FRAUD" in voter_id.upper()
        signals = {
            "address_overcrowding": is_ghost or random.random() < 0.15,
            "epic_duplication":     is_ghost or random.random() < 0.08,
            "impossible_family":    random.random() < 0.05,
            "no_aadhaar":           is_ghost or random.random() < 0.20,
            "multi_booth":          is_ghost and random.random() < 0.6,
            "temporal_anomaly":     is_ghost or random.random() < 0.12,
            "cross_pincode":        is_ghost and random.random() < 0.4,
        }

    # Weighted raw score
    raw = sum(SIGNAL_WEIGHTS[s] for s, v in signals.items() if v)
    max_possible = sum(SIGNAL_WEIGHTS.values())   # 125
    normalized = min(100, round((raw / max_possible) * 100))

    cls = classify(normalized)

    return {
        "voter_id":        voter_id,
        "risk_score":      normalized,
        "raw_score":       raw,
        "max_possible":    max_possible,
        "classification":  cls["label"],
        "severity":        cls["severity"],
        "signals_triggered": {s: {"triggered": v, "weight": SIGNAL_WEIGHTS[s]}
                               for s, v in signals.items()},
        "recommendation":  _recommendation(cls["label"]),
        "model_version":   "v3.2",
        "score_band":      _band(normalized),
    }


def _band(score: int) -> str:
    if score >= 80: return "80–100"
    if score >= 60: return "60–79"
    if score >= 30: return "31–59"
    return "0–30"


def _recommendation(label: str) -> str:
    recs = {
        "GHOST_VOTER": "Immediate physical verification required. Refer to Booth Level Officer (BLO) and District Election Officer (DEO).",
        "SUSPICIOUS":  "Schedule field verification within 15 days. Cross-reference with Aadhaar database.",
        "WATCH":       "Flag for next audit cycle. Monitor for additional signals.",
        "CLEAN":       "No action required. Continue routine monitoring.",
    }
    return recs.get(label, "Review manually.")


def batch_score_voters(voter_ids: list[str]) -> list[dict]:
    """Score a batch of voters."""
    return [compute_voter_risk(vid) for vid in voter_ids]


def compute_address_pagerank(address_id: str, voter_count: int) -> float:
    """
    Simplified PageRank proxy: higher voter density = higher centrality.
    Real implementation requires the full graph traversal from TigerGraph.
    """
    if voter_count >= 50: return round(0.85 + random.random() * 0.14, 3)
    if voter_count >= 20: return round(0.60 + random.random() * 0.24, 3)
    if voter_count >= 10: return round(0.30 + random.random() * 0.29, 3)
    return round(random.random() * 0.29, 3)
