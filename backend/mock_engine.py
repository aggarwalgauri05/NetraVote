"""
NetraVote Mock Data Engine
Generates realistic synthetic Indian electoral roll data for demo/testing.
All data is fictitious and generated via Faker + statistical models.
"""
import random
import math
from datetime import datetime, timedelta
from faker import Faker

fake = Faker("en_IN")
random.seed(42)

DELHI_PINCODES = ["110001","110002","110003","110005","110006","110007","110008","110009","110010"]
REGISTRATION_SPIKES = ["2018-03-15","2019-04-01","2021-10-22","2023-11-01","2024-01-15"]
GENDERS = ["M","M","M","F","F","O"]
FEMALE_NAMES = ["Sunita","Kavita","Priya","Rekha","Meena","Geeta","Anita","Pooja","Ritu","Savita"]
MALE_NAMES   = ["Rahul","Amit","Suresh","Ramesh","Vikram","Raju","Bablu","Pintu","Sonu","Munna"]

def _risk_color(score: float) -> str:
    if score > 0.8: return "#ef4444"
    if score > 0.6: return "#f97316"
    if score > 0.3: return "#eab308"
    return "#22c55e"

def _voter(vid: str, name: str, age: int, gender: str, epic: str, reg_date: str,
           risk: float, addr_id: str, constituency: str) -> dict:
    return {
        "id": vid, "group": "Voters", "name": name, "age": age, "gender": gender,
        "epic_number": epic, "registration_date": reg_date, "riskScore": round(risk, 3),
        "address_id": addr_id, "constituency": constituency, "color": _risk_color(risk),
        "aadhaar_linked": risk < 0.5,
        "ml_score": round(random.uniform(max(0, risk - 0.1), min(1, risk + 0.1)), 3),
        "added_date": reg_date, "batch_id": f"BATCH-{random.randint(1,20)}"
    }

def generate_constituency_graph(constituency: str, limit: int = 200) -> dict:
    nodes, edges = [], []
    pin1, pin2 = random.sample(DELHI_PINCODES, 2)
    booth1 = f"B-{constituency[:2].upper()}-101"
    booth2 = f"B-{constituency[:2].upper()}-102"
    fraud_addr_id = "ADDR-FRAUD-999"
    prefix = constituency[:3].upper().replace(" ","")

    # Booths
    nodes.append({"id": booth1, "group": "TargetBooths", "name": f"{constituency} School No.1",
                  "booth_name": f"{constituency} School No.1", "constituency": constituency, "riskScore": 0,
                  "total_voters": 200, "anomaly_score": 0.85, "overnight_flag": True})
    nodes.append({"id": booth2, "group": "TargetBooths", "name": f"{constituency} Community Hall",
                  "booth_name": f"{constituency} Community Hall", "constituency": constituency, "riskScore": 0,
                  "total_voters": 180, "anomaly_score": 0.2, "overnight_flag": False})

    # PinCodes
    nodes.append({"id": f"PIN-{pin1}", "group": "Pins", "name": pin1, "riskScore": 0})
    nodes.append({"id": f"PIN-{pin2}", "group": "Pins", "name": pin2, "riskScore": 0})

    # Fraud cluster address
    ghost_count = 80
    nodes.append({
        "id": fraud_addr_id, "group": "Addresses",
        "name": f"Flat 4B, Shivalik Apts, {constituency}",
        "full_address": f"Flat 4B, Shivalik Apartments, {constituency}",
        "@addressVoterCount": ghost_count, "riskScore": 0.95,
        "density_flag": "CRITICAL", "pagerank_score": 0.88,
        "normalized": f"flat 4b shivalik apts {constituency.lower()}"
    })
    edges.append({"source": fraud_addr_id, "target": f"PIN-{pin1}", "type": "LOCATED_IN"})
    edges.append({"source": booth1, "target": f"PIN-{pin1}", "type": "BOOTH_LOCATED_IN"})
    edges.append({"source": booth2, "target": f"PIN-{pin2}", "type": "BOOTH_LOCATED_IN"})

    # Ghost voters at fraud address
    for i in range(1, ghost_count + 1):
        risk = 0.80 + random.random() * 0.19
        name = f"{random.choice(MALE_NAMES)} Kumar {i}"
        vid = f"VOTER-{prefix}-FRAUD-{i}"
        v = _voter(vid, name, 20 + (i % 30), "M", f"EPIC-FAKE-{10000+i}",
                   "2023-11-01", risk, fraud_addr_id, constituency)
        nodes.append(v)
        edges.append({"source": vid, "target": fraud_addr_id, "type": "REGISTERED_AT"})
        edges.append({"source": vid, "target": booth1, "type": "ASSIGNED_TO"})
        if limit and len(nodes) > limit:
            break

    # Normal voters
    for b in range(1, 12):
        addr_id = f"ADDR-NORM-{prefix}-{b}"
        vc = random.randint(2, 4)
        nodes.append({
            "id": addr_id, "group": "Addresses",
            "name": f"House {b}, Block {chr(64+b)}, {constituency}",
            "full_address": f"House {b}, Block {chr(64+b)}, {constituency}",
            "@addressVoterCount": vc, "riskScore": 0,
            "density_flag": "NORMAL", "pagerank_score": round(random.random() * 0.2, 3),
            "normalized": f"house {b} block {chr(64+b).lower()} {constituency.lower()}"
        })
        edges.append({"source": addr_id, "target": f"PIN-{pin2}", "type": "LOCATED_IN"})
        for f in range(1, vc + 1):
            risk = random.random() * 0.25
            gdr = random.choice(GENDERS)
            name_pool = FEMALE_NAMES if gdr == "F" else MALE_NAMES
            vid = f"VOTER-{prefix}-NORM-{b}-{f}"
            v = _voter(vid, f"{random.choice(name_pool)} {fake.last_name()}", 25 + f * 7, gdr,
                       f"EPIC-{prefix}-{b}{f}",
                       random.choice(["2018-05-12","2019-03-22","2021-09-14"]),
                       risk, addr_id, constituency)
            nodes.append(v)
            edges.append({"source": vid, "target": addr_id, "type": "REGISTERED_AT"})
            edges.append({"source": vid, "target": booth2, "type": "ASSIGNED_TO"})
        if limit and len(nodes) > limit:
            break

    voters = [n for n in nodes if n["group"] == "Voters"]
    ghosts = [v for v in voters if v.get("riskScore", 0) > 0.6]
    return {
        "nodes": nodes, "edges": edges, "isMock": True,
        "constituency": constituency,
        "stats": {
            "totalVoters": len(voters),
            "ghostVoters": len(ghosts),
            "legitimateVoters": len(voters) - len(ghosts),
            "fraudHubs": 1,
            "averageRiskScore": round(sum(v.get("riskScore",0) for v in voters)/max(len(voters),1), 2),
            "integrityScore": round((1 - len(ghosts)/max(len(voters),1)) * 100),
        }
    }

def generate_overcrowded_addresses(constituency: str, threshold: int = 10) -> list:
    return [
        {"address_id": "ADDR-FRAUD-999", "address_text": f"Flat 4B, Shivalik Apts, {constituency}",
         "voter_count": 80, "threshold": threshold, "density_flag": "CRITICAL",
         "district": "Central", "pin_code": "110001",
         "pagerank_score": 0.88, "risk_level": "HIGH",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(1, 11)]},
        {"address_id": "ADDR-FRAUD-777", "address_text": f"Room 2, Basti Colony, {constituency}",
         "voter_count": 45, "threshold": threshold, "density_flag": "HIGH",
         "district": "East", "pin_code": "110002",
         "pagerank_score": 0.72, "risk_level": "HIGH",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(81, 91)]},
        {"address_id": "ADDR-WATCH-123", "address_text": f"DDA Flat B-12, {constituency}",
         "voter_count": 18, "threshold": threshold, "density_flag": "ELEVATED",
         "district": "South", "pin_code": "110003",
         "pagerank_score": 0.41, "risk_level": "MEDIUM",
         "voters": [f"VOTER-NORM-{i}" for i in range(1, 6)]},
    ]

def generate_duplicate_voters(constituency: str) -> list:
    return [
        {"cluster_id": "DUP-CLUSTER-1",
         "type": "EXACT_EPIC",
         "voters": [
             {"voter_id": "VOTER-FRAUD-1", "name": "Rahul Kumar", "epic": "EPIC-FAKE-10001", "age": 21, "booth": "B-ND-101"},
             {"voter_id": "VOTER-FRAUD-45", "name": "Rahul Kumar", "epic": "EPIC-FAKE-10001", "age": 21, "booth": "B-ND-102"},
         ],
         "similarity_score": 1.0, "detection_method": "Exact EPIC Match", "risk_level": "CRITICAL"},
        {"cluster_id": "DUP-CLUSTER-2",
         "type": "PHONETIC_NAME",
         "voters": [
             {"voter_id": "VOTER-NORM-1-1", "name": "Sunita Devi", "epic": "EPIC-ND-11", "age": 32, "booth": "B-ND-102"},
             {"voter_id": "VOTER-FRAUD-20", "name": "Sunitha Devi", "epic": "EPIC-FAKE-10020", "age": 31, "booth": "B-ND-101"},
         ],
         "similarity_score": 0.91, "detection_method": "Soundex + Levenshtein", "risk_level": "HIGH"},
        {"cluster_id": "DUP-CLUSTER-3",
         "type": "ADDRESS_EPIC_COMBO",
         "voters": [
             {"voter_id": "VOTER-FRAUD-10", "name": "Amit Sharma", "epic": "EPIC-FAKE-10010", "age": 28, "booth": "B-ND-101"},
             {"voter_id": "VOTER-FRAUD-55", "name": "Amit Sherma", "epic": "EPIC-FAKE-10055", "age": 29, "booth": "B-ND-101"},
         ],
         "similarity_score": 0.87, "detection_method": "Address + Name Phonetics", "risk_level": "HIGH"},
    ]

def generate_family_anomalies(constituency: str) -> list:
    return [
        {"anomaly_id": "FAM-001", "type": "SON_OLDER_THAN_FATHER",
         "father": {"voter_id": "VOTER-FAM-F1", "name": "Mohan Lal", "age": 35, "epic": "EPIC-FAM-001"},
         "son":    {"voter_id": "VOTER-FAM-S1", "name": "Mohan Lal Jr.", "age": 40, "epic": "EPIC-FAM-002"},
         "age_difference": -5, "confidence": 0.99, "risk_level": "CRITICAL",
         "explanation": "Son is 5 years OLDER than listed father — impossible family tree"},
        {"anomaly_id": "FAM-002", "type": "EXTREME_AGE_GAP",
         "father": {"voter_id": "VOTER-FAM-F2", "name": "Raju Singh", "age": 22, "epic": "EPIC-FAM-003"},
         "son":    {"voter_id": "VOTER-FAM-S2", "name": "Raju Singh Jr.", "age": 19, "epic": "EPIC-FAM-004"},
         "age_difference": 3, "confidence": 0.95, "risk_level": "HIGH",
         "explanation": "Father is only 3 years older than son — statistically impossible"},
        {"anomaly_id": "FAM-003", "type": "GHOST_FAMILY_CLUSTER",
         "family_head": {"voter_id": "VOTER-FAM-H1", "name": "Shankar Das", "age": 45, "epic": "EPIC-FAM-010"},
         "members": 12, "address": "ADDR-FRAUD-999",
         "confidence": 0.88, "risk_level": "HIGH",
         "explanation": "12 family members at same address with coordinated registration dates"},
    ]

def generate_temporal_fraud(constituency: str) -> list:
    return [
        {"spike_id": "SPIKE-001", "date": "2023-11-01", "constituency": constituency,
         "registrations": 80, "expected": 3, "ratio": 26.7,
         "anomaly_score": 0.97, "risk_level": "CRITICAL",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(1, 81)],
         "explanation": "80 voters registered on a single day — 26.7× historical average"},
        {"spike_id": "SPIKE-002", "date": "2024-01-15", "constituency": constituency,
         "registrations": 34, "expected": 3, "ratio": 11.3,
         "anomaly_score": 0.78, "risk_level": "HIGH",
         "voters": [f"VOTER-BATCH-{i}" for i in range(1, 35)],
         "explanation": "34 registrations on election eve — 11× spike"},
        {"spike_id": "SPIKE-003", "date": "2021-10-22", "constituency": constituency,
         "registrations": 21, "expected": 4, "ratio": 5.25,
         "anomaly_score": 0.61, "risk_level": "MEDIUM",
         "voters": [f"VOTER-NORM-{i}" for i in range(1, 22)],
         "explanation": "21 registrations in single night window"},
    ]

def generate_multi_booth_fraud(constituency: str) -> list:
    return [
        {"voter_id": "VOTER-MULTI-1", "name": "Suresh Kumar", "epic": "EPIC-MULTI-001",
         "age": 34, "booths": ["B-ND-101", "B-ND-102", "B-ND-103"],
         "booth_count": 3, "risk_level": "CRITICAL",
         "constituencies": [constituency, "South Delhi"],
         "explanation": "Same voter enrolled in 3 booths across 2 constituencies"},
        {"voter_id": "VOTER-MULTI-2", "name": "Ramesh Singh", "epic": "EPIC-MULTI-002",
         "age": 28, "booths": ["B-ND-101", "B-SD-205"],
         "booth_count": 2, "risk_level": "HIGH",
         "constituencies": [constituency, "South Delhi"],
         "explanation": "Voter enrolled in 2 booths in different constituencies"},
        {"voter_id": "VOTER-MULTI-3", "name": "Pintu Sharma", "epic": "EPIC-MULTI-003",
         "age": 22, "booths": ["B-ND-101", "B-ND-104"],
         "booth_count": 2, "risk_level": "HIGH",
         "constituencies": [constituency],
         "explanation": "Duplicate enrollment within same constituency"},
    ]

def generate_cross_constituency() -> list:
    """Detect coordinated fraud rings spanning multiple constituencies."""
    return {
        "networks": [
            {"network_id": "CROSS-NET-001",
             "constituencies": ["New Delhi", "South Delhi", "East Delhi"],
             "shared_address": "ADDR-FRAUD-999",
             "voter_count": 145, "operator_voter_id": "VOTER-FRAUD-1",
             "centrality_score": 0.94, "louvain_cluster": "CLUSTER-A",
             "risk_level": "CRITICAL",
             "explanation": "145-voter network spanning 3 constituencies with single operator node"},
            {"network_id": "CROSS-NET-002",
             "constituencies": ["Chandni Chowk", "Mumbai North"],
             "shared_address": "ADDR-FRAUD-777",
             "voter_count": 88, "operator_voter_id": "VOTER-FRAUD-15",
             "centrality_score": 0.81, "louvain_cluster": "CLUSTER-B",
             "risk_level": "HIGH",
             "explanation": "Inter-state fraud ring with shared device fingerprints"},
        ],
        "summary": {
            "total_networks": 2, "total_voters_affected": 233,
            "constituencies_involved": 5, "highest_risk": "CRITICAL",
            "graph_algorithm": "Louvain Community Detection + Betweenness Centrality"
        }
    }

def generate_timeline_data(constituency: str, start_year: int = 2018, end_year: int = 2024) -> dict:
    """Year-by-year fraud detection trends."""
    years = list(range(start_year, end_year + 1))
    data = []
    base_voters = 12000
    for yr in years:
        spike = yr in [2019, 2021, 2023]
        ghost_count = random.randint(300, 500) if spike else random.randint(30, 80)
        total = base_voters + random.randint(-500, 500)
        data.append({
            "year": yr,
            "total_voters": total,
            "ghost_anomalies": ghost_count,
            "legitimate_voters": total - ghost_count,
            "integrity_score": round((1 - ghost_count/total) * 100, 1),
            "fraud_rate_pct": round(ghost_count/total*100, 2),
            "spike": spike,
            "spike_reason": "Pre-election bulk registration" if spike else None,
            "pagerank_avg": round(random.uniform(0.1, 0.4), 3),
            "new_addresses": random.randint(50, 200) if not spike else random.randint(5, 15),
        })
        base_voters = total
    return {
        "constituency": constituency,
        "start_year": start_year,
        "end_year": end_year,
        "timeline": data,
        "trend": "WORSENING" if data[-1]["ghost_anomalies"] > data[0]["ghost_anomalies"] else "IMPROVING",
        "peak_year": max(data, key=lambda d: d["ghost_anomalies"])["year"],
        "graph_algorithm_used": "Temporal WCC + PageRank"
    }

def generate_boost_score(voter_id: str) -> dict:
    """ML + rule-based combined risk score."""
    base = random.uniform(0.6, 0.98)
    return {
        "voter_id": voter_id,
        "final_score": round(base, 3),
        "ml_score": round(base + random.uniform(-0.05, 0.05), 3),
        "rule_score": round(base + random.uniform(-0.1, 0.1), 3),
        "signals_triggered": {
            "address_overcrowding": True,
            "epic_duplication": random.choice([True, False]),
            "impossible_family": False,
            "no_aadhaar": True,
            "multi_booth": random.choice([True, False]),
            "temporal_anomaly": True,
            "cross_pincode": False,
        }
    }
