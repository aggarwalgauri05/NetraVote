"""
GhostWatch Mock Data Engine
Generates realistic synthetic Indian electoral roll data for demo/testing.
All data is fictitious and generated via Faker + statistical models.
"""
import random
import math
import hashlib
from datetime import datetime, timedelta
from faker import Faker

fake = Faker("en_IN")

DELHI_PINCODES = ["110001","110002","110003","110005","110006","110007","110008","110009","110010"]
REGISTRATION_SPIKES = ["2018-03-15","2019-04-01","2021-10-22","2023-11-01","2024-01-15"]
GENDERS = ["M","M","M","F","F","O"]
FEMALE_NAMES = ["Sunita","Kavita","Priya","Rekha","Meena","Geeta","Anita","Pooja","Ritu","Savita"]
MALE_NAMES   = ["Rahul","Amit","Suresh","Ramesh","Vikram","Raju","Bablu","Pintu","Sonu","Munna"]

def _get_seed(text: str) -> int:
    """Generate a stable integer seed from a string."""
    return int(hashlib.md5(text.encode()).hexdigest(), 16) % (10**8)

def _risk_color(score: float) -> str:
    if score > 0.8: return "#ef4444"
    if score > 0.6: return "#f97316"
    if score > 0.3: return "#eab308"
    return "#22c55e"

def _voter(vid: str, name: str, age: int, gender: str, epic: str, reg_date: str,
           risk: float, addr_id: str, constituency: str) -> dict:
    # Use a specific seed for the ML score to be stable per voter
    voter_seed = _get_seed(vid)
    rng = random.Random(voter_seed)
    return {
        "id": vid, "group": "Voters", "name": name, "age": age, "gender": gender,
        "epic_number": epic, "registration_date": reg_date, "riskScore": round(risk, 3),
        "address_id": addr_id, "constituency": constituency, "color": _risk_color(risk),
        "aadhaar_linked": risk < 0.5,
        "ml_score": round(rng.uniform(max(0, risk - 0.1), min(1, risk + 0.1)), 3),
        "added_date": reg_date, "batch_id": f"BATCH-{rng.randint(1,20)}"
    }

def generate_constituency_graph(constituency: str, limit: int = 200) -> dict:
    seed = _get_seed(constituency)
    random.seed(seed)
    
    nodes, edges = [], []
    pin1, pin2 = random.sample(DELHI_PINCODES, 2)
    booth1 = f"B-{constituency[:2].upper()}-101"
    booth2 = f"B-{constituency[:2].upper()}-102"
    fraud_addr_id = f"ADDR-FRAUD-{seed % 1000}"
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
    ghost_count = random.randint(40, 120)
    nodes.append({
        "id": fraud_addr_id, "group": "Addresses",
        "name": f"Flat {seed % 20}B, Shivalik Apts, {constituency}",
        "full_address": f"Flat {seed % 20}B, Shivalik Apartments, {constituency}",
        "@addressVoterCount": ghost_count, "riskScore": 0.95,
        "density_flag": "CRITICAL", "pagerank_score": 0.88,
        "normalized": f"flat {seed % 20}b shivalik apts {constituency.lower()}"
    })
    edges.append({"source": fraud_addr_id, "target": f"PIN-{pin1}", "type": "LOCATED_IN"})
    edges.append({"source": booth1, "target": f"PIN-{pin1}", "type": "BOOTH_LOCATED_IN"})
    edges.append({"source": booth2, "target": f"PIN-{pin2}", "type": "BOOTH_LOCATED_IN"})

    # Ghost voters at fraud address
    for i in range(1, ghost_count + 1):
        risk = 0.80 + random.random() * 0.19
        name = f"{random.choice(MALE_NAMES)} Kumar {i}"
        vid = f"VOTER-{prefix}-FRAUD-{i}"
        v = _voter(vid, name, 20 + (i % 30), "M", f"EPIC-FAKE-{10000+i+seed%100}",
                   "2023-11-01", risk, fraud_addr_id, constituency)
        nodes.append(v)
        edges.append({"source": vid, "target": fraud_addr_id, "type": "REGISTERED_AT"})
        edges.append({"source": vid, "target": booth1, "type": "ASSIGNED_TO"})
        if limit and len(nodes) > limit:
            break

    # Normal voters
    for b in range(1, 15):
        addr_id = f"ADDR-NORM-{prefix}-{b}"
        vc = random.randint(2, 6)
        nodes.append({
            "id": addr_id, "group": "Addresses",
            "name": f"House {b}, Block {chr(65+(b%26))}, {constituency}",
            "full_address": f"House {b}, Block {chr(65+(b%26))}, {constituency}",
            "@addressVoterCount": vc, "riskScore": 0,
            "density_flag": "NORMAL", "pagerank_score": round(random.random() * 0.2, 3),
            "normalized": f"house {b} block {chr(65+(b%26)).lower()} {constituency.lower()}"
        })
        edges.append({"source": addr_id, "target": f"PIN-{pin2}", "type": "LOCATED_IN"})
        for f in range(1, vc + 1):
            risk = random.random() * 0.25
            gdr = random.choice(GENDERS)
            name_pool = FEMALE_NAMES if gdr == "F" else MALE_NAMES
            vid = f"VOTER-{prefix}-NORM-{b}-{f}"
            v = _voter(vid, f"{random.choice(name_pool)} {fake.last_name()}", 25 + f * 7, gdr,
                       f"EPIC-{prefix}-{b}{f}-{seed%100}",
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
    seed = _get_seed(constituency)
    random.seed(seed)
    return [
        {"address_id": f"ADDR-FRAUD-{seed%1000}", "address_text": f"Flat {seed%20}B, Shivalik Apts, {constituency}",
         "voter_count": random.randint(60, 100), "threshold": threshold, "density_flag": "CRITICAL",
         "district": "Central", "pin_code": random.choice(DELHI_PINCODES),
         "pagerank_score": 0.88, "risk_level": "HIGH",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(1, 11)]},
        {"address_id": f"ADDR-FRAUD-{(seed+1)%1000}", "address_text": f"Room {seed%50}, Basti Colony, {constituency}",
         "voter_count": random.randint(30, 50), "threshold": threshold, "density_flag": "HIGH",
         "district": "East", "pin_code": random.choice(DELHI_PINCODES),
         "pagerank_score": 0.72, "risk_level": "HIGH",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(81, 91)]},
        {"address_id": f"ADDR-WATCH-{(seed+2)%1000}", "address_text": f"DDA Flat B-{seed%100}, {constituency}",
         "voter_count": random.randint(15, 25), "threshold": threshold, "density_flag": "ELEVATED",
         "district": "South", "pin_code": random.choice(DELHI_PINCODES),
         "pagerank_score": 0.41, "risk_level": "MEDIUM",
         "voters": [f"VOTER-NORM-{i}" for i in range(1, 6)]},
    ]

def generate_duplicate_voters(constituency: str) -> list:
    seed = _get_seed(constituency)
    random.seed(seed)
    prefix = constituency[:2].upper()
    return [
        {"cluster_id": f"DUP-CLUSTER-{seed%100}-1",
         "type": "EXACT_EPIC",
         "voters": [
             {"voter_id": f"VOTER-FRAUD-{seed%10}-1", "name": random.choice(MALE_NAMES) + " Kumar", "epic": f"EPIC-FAKE-{10000+seed%500}", "age": 21+(seed%10), "booth": f"B-{prefix}-101"},
             {"voter_id": f"VOTER-FRAUD-{seed%10}-45", "name": random.choice(MALE_NAMES) + " Kumar", "epic": f"EPIC-FAKE-{10000+seed%500}", "age": 21+(seed%10), "booth": f"B-{prefix}-102"},
         ],
         "similarity_score": 1.0, "detection_method": "Exact EPIC Match", "risk_level": "CRITICAL"},
        {"cluster_id": f"DUP-CLUSTER-{seed%100}-2",
         "type": "PHONETIC_NAME",
         "voters": [
             {"voter_id": f"VOTER-NORM-{seed%5}-1", "name": "Sunita Devi", "epic": f"EPIC-{prefix}-{seed%100}", "age": 32, "booth": f"B-{prefix}-102"},
             {"voter_id": f"VOTER-FRAUD-{seed%5}-20", "name": "Sunitha Devi", "epic": f"EPIC-FAKE-{20000+seed%50}", "age": 31, "booth": f"B-{prefix}-101"},
         ],
         "similarity_score": 0.91, "detection_method": "Soundex + Levenshtein", "risk_level": "HIGH"},
    ]

def generate_family_anomalies(constituency: str) -> list:
    seed = _get_seed(constituency)
    random.seed(seed)
    return [
        {"anomaly_id": f"FAM-{seed%1000}", "type": "SON_OLDER_THAN_FATHER",
         "father": {"voter_id": f"VOTER-FAM-F{seed%10}", "name": "Mohan Lal", "age": 35, "epic": f"EPIC-FAM-{seed%500}"},
         "son":    {"voter_id": f"VOTER-FAM-S{seed%10}", "name": "Mohan Lal Jr.", "age": 40, "epic": f"EPIC-FAM-{seed%500+1}"},
         "age_difference": -5, "confidence": 0.99, "risk_level": "CRITICAL",
         "explanation": "Son is 5 years OLDER than listed father — impossible family tree"},
        {"anomaly_id": f"FAM-{seed%1000+1}", "type": "GHOST_FAMILY_CLUSTER",
         "family_head": {"voter_id": f"VOTER-FAM-H{seed%10}", "name": "Shankar Das", "age": 45, "epic": f"EPIC-FAM-{seed%500+10}"},
         "members": random.randint(10, 15), "address": f"ADDR-FRAUD-{seed%1000}",
         "confidence": 0.88, "risk_level": "HIGH",
         "explanation": f"{random.randint(10,15)} family members at same address with coordinated registration dates"},
    ]

def generate_temporal_fraud(constituency: str) -> list:
    seed = _get_seed(constituency)
    random.seed(seed)
    return [
        {"spike_id": f"SPIKE-{seed%100}-01", "date": "2023-11-01", "constituency": constituency,
         "registrations": random.randint(70, 130), "expected": 3, "ratio": 30.5,
         "anomaly_score": 0.97, "risk_level": "CRITICAL",
         "voters": [f"VOTER-FRAUD-{i}" for i in range(1, 11)],
         "explanation": f"{random.randint(70,130)} voters registered on a single day — massive spike detected"},
        {"spike_id": f"SPIKE-{seed%100}-02", "date": "2024-01-15", "constituency": constituency,
         "registrations": random.randint(30, 50), "expected": 3, "ratio": 12.0,
         "anomaly_score": 0.78, "risk_level": "HIGH",
         "voters": [f"VOTER-BATCH-{i}" for i in range(1, 11)],
         "explanation": "Bulk registrations detected on election eve"},
    ]

def generate_multi_booth_fraud(constituency: str) -> list:
    seed = _get_seed(constituency)
    random.seed(seed)
    return [
        {"voter_id": f"VOTER-MULTI-{seed%10}-1", "name": "Suresh Kumar", "epic": f"EPIC-MULTI-{seed%1000}",
         "age": 34, "booths": [f"B-{constituency[:2].upper()}-101", "B-SOUTH-102", "B-EAST-103"],
         "booth_count": 3, "risk_level": "CRITICAL",
         "constituencies": [constituency, "South Delhi", "East Delhi"],
         "explanation": "Same voter enrolled in 3 booths across multiple constituencies"},
    ]

def generate_cross_constituency(constituency: str = "New Delhi") -> dict:
    """Detect coordinated fraud rings spanning multiple constituencies."""
    seed = _get_seed(constituency)
    random.seed(seed)
    
    return {
        "networks": [
            {"network_id": f"CROSS-NET-{seed%100}-001",
             "constituencies": [constituency, "South Delhi", "East Delhi"],
             "shared_address": f"ADDR-FRAUD-{seed%1000}",
             "voter_count": random.randint(120, 200), "operator_voter_id": f"VOTER-OP-{seed%100}",
             "centrality_score": 0.94, "louvain_cluster": f"CLUSTER-{chr(65+(seed%5))}",
             "risk_level": "CRITICAL",
             "explanation": f"{random.randint(120,200)}-voter network spanning 3 constituencies with single operator node"},
            {"network_id": f"CROSS-NET-{seed%100}-002",
             "constituencies": ["Chandni Chowk", "Mumbai North"],
             "shared_address": f"ADDR-FRAUD-{(seed+5)%1000}",
             "voter_count": random.randint(50, 100), "operator_voter_id": f"VOTER-OP-{seed%100+10}",
             "centrality_score": 0.81, "louvain_cluster": f"CLUSTER-{chr(65+((seed+1)%5))}",
             "risk_level": "HIGH",
             "explanation": "Inter-state fraud ring with shared device fingerprints"},
        ],
        "summary": {
            "total_networks": 2, "total_voters_affected": random.randint(170, 300),
            "constituencies_involved": random.randint(4, 7), "highest_risk": "CRITICAL",
            "graph_algorithm": "Louvain Community Detection + Betweenness Centrality"
        }
    }

def generate_timeline_data(constituency: str, start_year: int = 2018, end_year: int = 2024) -> dict:
    """Year-by-year fraud detection trends."""
    seed = _get_seed(constituency)
    random.seed(seed)
    
    years = list(range(start_year, end_year + 1))
    data = []
    base_voters = 12000 + (seed % 5000)
    for yr in years:
        spike = yr in [2019, 2021, 2023]
        ghost_count = random.randint(300, 600) if spike else random.randint(40, 100)
        total = base_voters + random.randint(200, 800)
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
    for d in data:
        d["date"] = f"{d['year']}-01-01"
        d["legit_registrations"] = d.pop("legitimate_voters", d["total_voters"] - d["ghost_anomalies"])
    return {
        "timeline": data,
        "stats": {
            "constituency": constituency,
            "start_year": start_year,
            "end_year": end_year,
            "trend": "WORSENING" if data[-1]["ghost_anomalies"] > data[0]["ghost_anomalies"] else "IMPROVING",
            "peak_year": max(data, key=lambda d: d["ghost_anomalies"])["year"],
            "graph_algorithm_used": "Temporal WCC + PageRank"
        }
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
