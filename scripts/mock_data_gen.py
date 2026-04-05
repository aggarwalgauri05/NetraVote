import os
import time
import random
from datetime import datetime, timedelta
import pyTigerGraph as tg

# Configuration
HOST = "https://tg-ff37ebfe-4099-4784-9c48-0f3df5b4c804.tg-2635877100.i.tgcloud.io"
GRAPH = "vote"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWluYW51c2hyZWUyMDA1QGdtYWlsLmNvbSIsImlhdCI6MTc3NDk3NTMxOCwiZXhwIjoxNzgyNzUxMzIzLCJpc3MiOiJUaWdlckdyYXBoIn0.EsP1xIC0asrGwcCMxb_d80jieP1fTWbTUkDnGKNjLL0"

conn = tg.TigerGraphConnection(
    host=HOST, 
    graphname=GRAPH, 
    apiToken=TOKEN
)

def seed_data():
    print(f"Connecting to TigerGraph at {HOST}...")
    
    # Vertices and Edges containers
    v_voter = {}
    v_addr = {}
    v_booth = {}
    v_const = {}
    v_pin = {}
    v_phone = {}
    v_device = {}
    
    e_reg = []
    e_fam = []
    e_dup = []
    e_assign = []
    e_in_const = []
    e_pin_belong = []
    e_use_phone = []
    e_use_device = []

    # 1. Base Structure: Constituencies and PinCodes
    v_const["ND-1"] = {"name": "New Delhi Central", "state": "Delhi"}
    v_pin["110001"] = {"district": "New Delhi", "state": "Delhi"}
    v_pin["110002"] = {"district": "New Delhi", "state": "Delhi"}

    # 2. Booths
    v_booth["B-001"] = {"name": "CP Primary School", "constituency": "New Delhi Central", "state": "Delhi", "total_voters": 0}
    v_booth["B-002"] = {"name": "Mandi House Block A", "constituency": "New Delhi Central", "state": "Delhi", "total_voters": 0}
    e_in_const.append(("B-001", "ND-1"))
    e_in_const.append(("B-002", "ND-1"))

    # 3. FRAUD PATTERN 1: Address Overcrowding (85 voters at 1 address)
    fraud_addr_id = "ADDR-CROWD-001"
    v_addr[fraud_addr_id] = {
        "raw_text": "Room 12, Gali No 4, Shanti Nagar, CP",
        "pin_code": "110001",
        "voter_density": 85,
        "density_flag": True
    }
    e_pin_belong.append((fraud_addr_id, "110001"))

    for i in range(85):
        v_id = f"V-CROWD-{i}"
        v_voter[v_id] = {
            "name": f"Voter Crowd {i}",
            "age": 22 + (i % 40),
            "epic_id": f"EPIC-CROWD-{1000+i}",
            "added_date": "2023-11-20 00:00:00"
        }
        e_reg.append((v_id, fraud_addr_id, {"since_date": "2023-11-20 00:00:00", "batch_id": "BATCH-NOV-23"}))
        e_assign.append((v_id, "B-001", {"since_date": "2023-11-20 00:00:00"}))

    # 4. FRAUD PATTERN 2: Impossible Families (Son older than Parent)
    p_id = "V-FAM-PARENT"
    s_id = "V-FAM-SON"
    v_voter[p_id] = {"name": "Senior Parent", "age": 30, "epic_id": "EPIC-FAM-P"}
    v_voter[s_id] = {"name": "Junior Son", "age": 45, "epic_id": "EPIC-FAM-S"}
    # Son (45) is older than Parent (30)
    e_fam.append((s_id, p_id, {"relation_type": "son", "declared_age_gap": 15, "impossible_flag": True}))
    
    # 5. FRAUD PATTERN 3: Overnight Batch (200 voters in one booth at once)
    batch_ts = "2024-01-15 02:00:00"
    for i in range(200):
        v_id = f"V-BATCH-{i}"
        v_voter[v_id] = {
            "name": f"Batch Ghost {i}",
            "age": 18 + (i % 60),
            "epic_id": f"EPIC-BATCH-{5000+i}",
            "added_date": batch_ts,
            "batch_id": "FACTORY-BATCH-001"
        }
        e_assign.append((v_id, "B-002", {"since_date": batch_ts}))

    # 6. FRAUD PATTERN 4: Multi-Booth Ghost (Voter linked to Address in B1 but assigned to B2)
    # Actually, let's link one voter to two booths
    v_id = "V-GHOST-DUAL"
    v_voter[v_id] = {"name": "Dual Registered Voter", "age": 35, "epic_id": "EPIC-DUAL-X"}
    e_assign.append((v_id, "B-001", {"since_date": "2020-01-01 00:00:00"}))
    e_assign.append((v_id, "B-002", {"since_date": "2020-01-01 00:00:00"}))

    # 7. Normal Background Data
    for b in range(10):
        addr_id = f"ADDR-NORM-{b}"
        v_addr[addr_id] = {"raw_text": f"Normal House {b}, Lane {b}, CP", "pin_code": "110001"}
        e_pin_belong.append((addr_id, "110001"))
        for f in range(3):
            v_id = f"V-NORM-{b}-{f}"
            v_voter[v_id] = {"name": f"Regular Citizen {b}-{f}", "age": 25+f*10, "epic_id": f"EPIC-NORM-{b}{f}"}
            e_reg.append((v_id, addr_id, {"since_date": "2015-01-01 00:00:00"}))
            e_assign.append((v_id, "B-001", {"since_date": "2015-01-01 00:00:00"}))

    print("Upserting Vertices...")
    conn.upsertVertices("Constituency", [(k, v) for k, v in v_const.items()])
    conn.upsertVertices("PinCode", [(k, v) for k, v in v_pin.items()])
    conn.upsertVertices("Booth", [(k, v) for k, v in v_booth.items()])
    conn.upsertVertices("Address", [(k, v) for k, v in v_addr.items()])
    conn.upsertVertices("Voter", [(k, v) for k, v in v_voter.items()])

    print("Upserting Edges...")
    conn.upsertEdges("Booth", "IN_CONSTITUENCY", "Constituency", [(*e, {}) for e in e_in_const])
    conn.upsertEdges("Address", "PIN_BELONGS_TO", "PinCode", [(*e, {}) for e in e_pin_belong])
    conn.upsertEdges("Voter", "REGISTERED_AT", "Address", [(e[0], e[1], e[2]) for e in e_reg])
    conn.upsertEdges("Voter", "FAMILY_OF", "Voter", [(e[0], e[1], e[2]) for e in e_fam])
    conn.upsertEdges("Voter", "ASSIGNED_TO", "Booth", [(e[0], e[1], e[2]) for e in e_assign])

    print("Data Seeding Complete!")

if __name__ == "__main__":
    seed_data()
