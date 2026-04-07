import os, json, csv, httpx
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv("c:\\Users\\Anushree Jain\\.gemini\\antigravity\\scratch\\GHOST-VOTER-NETWORK\\backend\\.env")

HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

def load_csv(path):
    if not os.path.exists(path):
        print(f"Error: File not found {path}")
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))

def run_load():
    data_dir = "c:\\Users\\Anushree Jain\\.gemini\\antigravity\\scratch\\GHOST-VOTER-NETWORK\\backend\\data"
    
    print("--- GhostWatch Production Ingestion (Final Alignment) ---")
    
    v_voters = load_csv(f"{data_dir}/voters.csv")
    v_addrs = load_csv(f"{data_dir}/addresses.csv")
    v_booths = load_csv(f"{data_dir}/booths.csv")
    v_consts = load_csv(f"{data_dir}/constituencies.csv")

    if not v_voters:
        print("No data found to load. Exiting.")
        return

    # Payload matching 'vote' graph schema
    payload = {
        "vertices": {
            "Constituency": { c["id"]: {"name": c["name"], "state": c["state"]} for c in v_consts },
            "Booth": { b["id"]: {"name": b["name"], "constituency": b["constituency"], "state": b.get("state", "UP")} for b in v_booths },
            "Address": { a["id"]: {"raw_text": a["address"], "pin_code": a["pincode"], "voter_density": int(a["density"])} for a in v_addrs },
            "Voter": { v["id"]: {
                "epic_id": v["epic"],
                "name": v["name"], 
                "age": int(v["age"]), 
                "gender": v["gender"], 
                "risk_score": float(v["risk"]),
                "added_date": v["added_date"] if v["added_date"] else "2024-03-15 00:00:00"
            } for v in v_voters }
        },
        "edges": {
            "Voter": { 
                v["id"]: {
                    "REGISTERED_AT": { "Address": { v["address_id"]: {"added_date": v["added_date"]} } },
                    "ASSIGNED_TO": { "Booth": { v["booth_id"]: {"since_date": v["added_date"]} } }
                } for v in v_voters 
            },
            "Booth": { 
                b["id"]: {
                    "IN_CONSTITUENCY": { "Constituency": { b["constituency"]: {} } }
                } for b in v_booths 
            }
        }
    }

    url = f"{HOST}/restpp/graph/{GRAPH}"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    print(f"Upserting {len(v_voters)} voters and relationships...")
    
    try:
        with httpx.Client(timeout=60) as client:
            r = client.post(url, json=payload, headers=headers)
            r.raise_for_status()
            res = r.json()
            if res.get("results"):
                accepted_v = res['results'][0].get('accepted_vertices', 0)
                accepted_e = res['results'][0].get('accepted_edges', 0)
                print(f"Success! Updated {accepted_v} vertices and {accepted_e} edges.")
            else:
                print(f"Server response: {res}")
    except Exception as e:
        print(f"Injection Failed: {e}")

if __name__ == "__main__":
    run_load()
