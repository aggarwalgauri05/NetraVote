import os
import csv
import pyTigerGraph as tg
from dotenv import load_dotenv

# Load env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

# Initialize connection
conn = tg.TigerGraphConnection(
    host=HOST, 
    graphname=GRAPH, 
    apiToken=TOKEN
)

def load_csv(filename):
    data = []
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return []
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def run_load():
    base_path = "c:\\Users\\Anushree Jain\\.gemini\\antigravity\\scratch\\GHOST-VOTER-NETWORK\\backend\\data"
    
    print("--- Starting Reliable Load ---")
    
    # 1. Load Constituencies
    consts = load_csv(os.path.join(base_path, "constituencies.csv"))
    for c in consts:
        conn.upsertVertex("Constituency", c["id"], {"const_name": c["name"], "state": c["state"]})
    print(f"Loaded {len(consts)} Constituencies")

    # 2. Load Booths
    booths = load_csv(os.path.join(base_path, "booths.csv"))
    for b in booths:
        conn.upsertVertex("Booth", b["id"], {"booth_name": b["name"], "constituency": b["constituency"], "state": b["state"]})
        conn.upsertEdge("Booth", b["id"], "BELONGS_TO", "Constituency", b["constituency"])
    print(f"Loaded {len(booths)} Booths and Relationships")

    # 3. Load Addresses
    addrs = load_csv(os.path.join(base_path, "addresses.csv"))
    for a in addrs:
        conn.upsertVertex("Address", a["id"], {"full_address": a["address"], "pin_code": a["pincode"], "state": a["state"], "voter_density": int(a["density"])})
    print(f"Loaded {len(addrs)} Addresses")

    # 4. Load Voters
    voters = load_csv(os.path.join(base_path, "voters.csv"))
    for v in voters:
        v_id = v["id"]
        conn.upsertVertex("Voter", v_id, {
            "name": v["name"],
            "age": int(v["age"]),
            "gender": v["gender"],
            "epic_number": v["epic"],
            "added_date": v["added_date"],
            "risk_score": float(v["risk"])
        })
        conn.upsertEdge("Voter", v_id, "REGISTERED_AT", "Address", v["address_id"])
        conn.upsertEdge("Voter", v_id, "ASSIGNED_TO", "Booth", v["booth_id"])
    print(f"Loaded {len(voters)} Voters and Network Relationships")

    print("\n--- Load Complete ---")

if __name__ == "__main__":
    run_load()
