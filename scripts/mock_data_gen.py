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
    
    e_reg = []
    e_fam = []
    e_assign = []
    e_belongs = []
    e_located = []

    # 1. Base Structure: Constituencies and PinCodes
    const_id = "ND-1"
    v_const[const_id] = {"const_name": "New Delhi Central", "state": "Delhi"}
    v_pin["110001"] = {"district": "New Delhi"}
    v_pin["110002"] = {"district": "New Delhi"}

    # 2. Booths
    v_booth["B-001"] = {"booth_name": "CP Primary School", "constituency": "New Delhi Central", "state": "Delhi", "total_voters": 0}
    v_booth["B-002"] = {"booth_name": "Mandi House Block A", "constituency": "New Delhi Central", "state": "Delhi", "total_voters": 0}
    e_belongs.append(("B-001", const_id))
    e_belongs.append(("B-002", const_id))

    # 3. FRAUD PATTERN 1: Address Overcrowding (85 voters at 1 address)
    fraud_addr_id = "ADDR-CROWD-001"
    v_addr[fraud_addr_id] = {
        "full_address": "Room 12, Gali No 4, Shanti Nagar, CP",
        "pin_code": "110001",
        "voter_density": 85,
        "density_flag": True,
        "state": "Delhi"
    }
    e_located.append((fraud_addr_id, "110001"))

    for i in range(85):
        v_id = f"V-CROWD-{i}"
        v_voter[v_id] = {
            "name": f"Voter Crowd {i}",
            "age": 22 + (i % 40),
            "epic_number": f"EPIC-CROWD-{1000+i}",
            "added_date": "2023-11-20 00:00:00",
            "constituency": "New Delhi Central"
        }
        e_reg.append((v_id, fraud_addr_id, {}))
        e_assign.append((v_id, "B-001", {}))

    # 4. FRAUD PATTERN 2: Impossible Families (Son older than Parent)
    p_id = "V-FAM-PARENT"
    s_id = "V-FAM-SON"
    v_voter[p_id] = {"name": "Senior Parent", "age": 30, "epic_number": "EPIC-FAM-P", "constituency": "New Delhi Central"}
    v_voter[s_id] = {"name": "Junior Son", "age": 45, "epic_number": "EPIC-FAM-S", "constituency": "New Delhi Central"}
    e_fam.append((s_id, p_id, {"relation_type": "PARENT_CHILD"})) # schema relation_type is STRING
    
    # 5. FRAUD PATTERN 3: Overnight Batch (200 voters in one booth at once)
    batch_ts = "2024-01-15 02:00:00"
    for i in range(200):
        v_id = f"V-BATCH-{i}"
        v_voter[v_id] = {
            "name": f"Batch Ghost {i}",
            "age": 18 + (i % 60),
            "epic_number": f"EPIC-BATCH-{5000+i}",
            "added_date": batch_ts,
            "batch_id": "FACTORY-BATCH-001",
            "constituency": "New Delhi Central"
        }
        e_assign.append((v_id, "B-002", {}))

    # 6. FRAUD PATTERN 4: Multi-Booth Ghost
    v_id = "V-GHOST-DUAL"
    v_voter[v_id] = {"name": "Dual Registered Voter", "age": 35, "epic_number": "EPIC-DUAL-X", "constituency": "New Delhi Central"}
    e_assign.append((v_id, "B-001", {}))
    e_assign.append((v_id, "B-002", {}))

    print("Upserting Vertices...")
    conn.upsertVertices("Constituency", [(k, v) for k, v in v_const.items()])
    conn.upsertVertices("PinCode", [(k, v) for k, v in v_pin.items()])
    conn.upsertVertices("Booth", [(k, v) for k, v in v_booth.items()])
    conn.upsertVertices("Address", [(k, v) for k, v in v_addr.items()])
    conn.upsertVertices("Voter", [(k, v) for k, v in v_voter.items()])

    print("Upserting Edges...")
    conn.upsertEdges("Booth", "BELONGS_TO", "Constituency", [(*e, {}) for e in e_belongs])
    conn.upsertEdges("Address", "LOCATED_IN", "PinCode", [(*e, {}) for e in e_located])
    conn.upsertEdges("Voter", "REGISTERED_AT", "Address", [(*e, {}) for e in e_reg])
    conn.upsertEdges("Voter", "FAMILY_OF", "Voter", [(*e, {}) for e in e_fam])
    conn.upsertEdges("Voter", "ASSIGNED_TO", "Booth", [(*e, {}) for e in e_assign])

    print("Data Seeding Complete!")

if __name__ == "__main__":
    seed_data()
