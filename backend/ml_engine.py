"""
NetraVote ML Engine
GraphSAGE embeddings + Isolation Forest for unsupervised ghost voter detection.
Falls back to rule-based scoring if sklearn/numpy not available.
"""
import random
import math
from typing import Optional

def _try_imports():
    try:
        import numpy as np
        from sklearn.ensemble import IsolationForest
        return np, IsolationForest
    except ImportError:
        return None, None

def generate_graph_sage_embedding(voter_features: dict) -> list:
    """
    Simulate GraphSAGE embedding (2-hop neighborhood aggregation).
    Real implementation requires PyTorch Geometric + TigerGraph graph data.
    Returns 64-dim embedding vector.
    """
    seed_val = hash(str(voter_features)) % 10000
    random.seed(seed_val)
    risk = voter_features.get("riskScore", 0.5)
    # Embeddings are clustered: high-risk voters cluster near [1,1,...] in embedding space
    noise = [random.gauss(0, 0.1) for _ in range(64)]
    signal = [risk + n for n in noise]
    # Normalize
    magnitude = math.sqrt(sum(x**2 for x in signal))
    return [round(x/magnitude, 6) for x in signal] if magnitude > 0 else signal

def run_isolation_forest(voters: list) -> list:
    """
    Run Isolation Forest on voter feature vectors.
    Returns voters with ml_score appended (0=normal, 1=anomaly).
    """
    np, IsolationForest = _try_imports()
    if np is None:
        # Fallback: use heuristic rule-based scoring
        return _heuristic_ml_score(voters)

    features = []
    for v in voters:
        features.append([
            v.get("age", 30) / 100,
            1 if v.get("gender") == "M" else 0,
            1 if not v.get("aadhaar_linked", True) else 0,
            v.get("riskScore", 0),
            v.get("@addressVoterCount", 1) / 100,
        ])

    X = np.array(features)
    clf = IsolationForest(contamination=0.15, random_state=42)
    preds = clf.fit_predict(X)
    scores = clf.score_samples(X)

    # Normalize scores to [0, 1] (higher = more anomalous)
    s_min, s_max = scores.min(), scores.max()
    ml_scores = [(s - s_min) / (s_max - s_min + 1e-9) for s in scores]
    anomalies = preds == -1

    result = []
    for i, v in enumerate(voters):
        result.append({
            **v,
            "ml_score": round(1 - ml_scores[i], 3),  # invert: 1=anomaly
            "ml_anomaly": bool(anomalies[i]),
            "ml_model": "IsolationForest_v1"
        })
    return result

def _heuristic_ml_score(voters: list) -> list:
    """Fallback when sklearn not available."""
    result = []
    for v in voters:
        rs = v.get("riskScore", 0)
        age = v.get("age", 30)
        no_aadhaar = not v.get("aadhaar_linked", True)
        ml = rs * 0.7 + (0.1 if no_aadhaar else 0) + (0.1 if age < 20 else 0)
        result.append({**v, "ml_score": round(min(ml, 1.0), 3), "ml_anomaly": ml > 0.6, "ml_model": "heuristic"})
    return result

def combine_scores(rule_score: float, ml_score: float, weights=(0.6, 0.4)) -> float:
    """Combine rule-based and ML scores with configurable weights."""
    return round(rule_score * weights[0] + ml_score * weights[1], 3)
