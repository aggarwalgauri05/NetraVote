import os
import pyTigerGraph as tg
from dotenv import load_dotenv
import random
from datetime import datetime

# Load env from backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

# Initialize connection
conn = tg.TigerGraphConnection(host=HOST, graphname=GRAPH, apiToken=TOKEN)

def seed_demo_data():
    print(f"--- Seeding Demo Data for {GRAPH} ---")
    
    # 1. Create Constituencies
    # Schema: const_id, const_name, state
    constituencies = [
        {"id": "New Delhi", "name": "New Delhi", "state": "Delhi"},
        {"id": "South Delhi", "name": "South Delhi", "state": "Delhi"},
        {"id": "Varanasi", "name": "Varanasi", "state": "Uttar Pradesh"}
    ]
    
    for c in constituencies:
        conn.upsertVertex("Constituency", c["id"], {"const_name": c["name"], "state": c["state"]})
        print(f"Upserted Constituency: {c['name']}")

    # --- Scenario A: New Delhi (Density Fraud) ---
    # 35 voters in one address
    address_id = "ADDR_ND_GHOST"
    conn.upsertVertex("Address", address_id, {
        "full_address": "Flat 101, Block C, Green Park, New Delhi",
        "pin_code": "110016",
        "state": "Delhi",
        "density_flag": True,
        "voter_density": 35
    })
    
    booth_id = "BOOTH_ND_1"
    conn.upsertVertex("Booth", booth_id, {
        "booth_name": "Green Park Primary School", 
        "constituency": "New Delhi",
        "state": "Delhi"
    })
    conn.upsertEdge("Booth", booth_id, "BELONGS_TO", "Constituency", "New Delhi")

    for i in range(35):
        vid = f"V_ND_{1000+i}"
        conn.upsertVertex("Voter", vid, {
            "name": f"Voter {i}", 
            "age": random.randint(20, 70), 
            "gender": random.choice(["M", "F"]),
            "added_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "constituency": "New Delhi"
        })
        conn.upsertEdge("Voter", vid, "REGISTERED_AT", "Address", address_id)
        conn.upsertEdge("Voter", vid, "ASSIGNED_TO", "Booth", booth_id)

    print(f"Scenario A (New Delhi): Created 35 voters at {address_id}")

    # --- Scenario B: South Delhi (Identity Duplicates) ---
    # 5 pairs of voters with identical names and ages
    booth_sd = "BOOTH_SD_1"
    conn.upsertVertex("Booth", booth_sd, {
        "booth_name": "Saket Community Center", 
        "constituency": "South Delhi",
        "state": "Delhi"
    })
    conn.upsertEdge("Booth", booth_sd, "BELONGS_TO", "Constituency", "South Delhi")

    duplicate_names = ["Arjun Sharma", "Priya Singh", "Amit Kumar", "Sonia Gandhi", "Rahul Verma"]
    for i, name in enumerate(duplicate_names):
        addr_id = f"ADDR_SD_DUP_{i}"
        conn.upsertVertex("Address", addr_id, {
            "full_address": f"H.No {random.randint(1,100)}, Saket, New Delhi",
            "pin_code": "110017",
            "state": "Delhi"
        })
        
        for j in range(2):
            vid = f"V_SD_DUP_{i}_{j}"
            conn.upsertVertex("Voter", vid, {
                "name": name, 
                "age": 30 + i, 
                "gender": random.choice(["M", "F"]),
                "added_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "constituency": "South Delhi"
            })
            conn.upsertEdge("Voter", vid, "REGISTERED_AT", "Address", addr_id)
            conn.upsertEdge("Voter", vid, "ASSIGNED_TO", "Booth", booth_sd)

    print("Scenario B (South Delhi): Created 5 pairs of Identity Duplicates")

    # --- Scenario C: Varanasi (Temporal Spike) ---
    # 50 voters registered in a single day
    booth_spike = "BOOTH_VAR_99"
    conn.upsertVertex("Booth", booth_spike, {
        "booth_name": "Ghat View Booth", 
        "constituency": "Varanasi",
        "state": "Uttar Pradesh",
        "overnight_flag": True
    })
    conn.upsertEdge("Booth", booth_spike, "BELONGS_TO", "Constituency", "Varanasi")
    
    spike_date = "2024-03-15 10:00:00"
    for i in range(50):
        vid = f"V_VAR_SPIKE_{i}"
        conn.upsertVertex("Voter", vid, {
            "name": f"Varanasi_Voter_{i}", 
            "age": random.randint(18, 90), 
            "gender": random.choice(["M", "F"]),
            "added_date": spike_date,
            "constituency": "Varanasi"
        })
        conn.upsertEdge("Voter", vid, "ASSIGNED_TO", "Booth", booth_spike)

    print("Scenario C (Varanasi): Created 2024 Temporal Spike")

    print("\n--- Seeding Complete. All Constituencies Operational. ---")

if __name__ == "__main__":
    seed_demo_data()
