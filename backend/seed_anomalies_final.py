
import requests
import json
import os
import random
from datetime import datetime
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

def upsert_data(data):
    url = f"{HOST}/restpp/graph/{GRAPH}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()

reg_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def main():
    print("\n--- Seeding ADVANCED ANOMALY COMBO ---")
    
    # 1. Impossible Family Tree (Parent younger than child)
    v_family = {"Voter": {}}
    e_family = {"Voter": {}}
    
    # Parent (20) Child (25)
    v_family["Voter"]["V_ANOM_F1"] = {
        "name": {"value": "Young Parent"}, "age": {"value": 20}, "gender": {"value": "M"},
        "added_date": {"value": reg_date}, "constituency": {"value": "New Delhi"}, "epic_number": {"value": "EPIC_ANOM_F1"}
    }
    v_family["Voter"]["V_ANOM_C1"] = {
        "name": {"value": "Old Child"}, "age": {"value": 25}, "gender": {"value": "F"},
        "added_date": {"value": reg_date}, "constituency": {"value": "New Delhi"}, "epic_number": {"value": "EPIC_ANOM_C1"}
    }
    
    # Relation edge
    e_family["Voter"]["V_ANOM_F1"] = {
        "FAMILY_OF": {"Voter": {"V_ANOM_C1": {"relation_type": {"value": "PARENT_CHILD"}}}}
    }
    # Link to Booth
    e_family["Voter"]["V_ANOM_F1"]["ASSIGNED_TO"] = {"Booth": {"BOOTH_ND_1": {}}}
    e_family["Voter"]["V_ANOM_C1"] = {"ASSIGNED_TO": {"Booth": {"BOOTH_ND_1": {}}}}

    print("Upserting Impossible Family...")
    print(upsert_data({"vertices": v_family, "edges": e_family}))

    # 2. Multi-Booth Voter (Assigned to two different booths)
    v_mb = {"Voter": {}}
    e_mb = {"Voter": {}}
    
    v_mb["Voter"]["V_ANOM_MB1"] = {
        "name": {"value": "Tony Two-Booths"}, "age": {"value": 45}, "gender": {"value": "M"},
        "added_date": {"value": reg_date}, "constituency": {"value": "New Delhi"}, "epic_number": {"value": "EPIC_ANOM_MB1"}
    }
    e_mb["Voter"]["V_ANOM_MB1"] = {
        "ASSIGNED_TO": {
            "Booth": {
                "BOOTH_ND_1": {},
                "BOOTH_SD_1": {} # South Delhi booth
            }
        }
    }
    
    print("Upserting Multi-Booth Voter...")
    print(upsert_data({"vertices": v_mb, "edges": e_mb}))

    # 3. Cross-Constituency Address Sharing
    v_cross = {"Address": {}, "Voter": {}}
    e_cross = {"Voter": {}}
    
    v_cross["Address"]["ADDR_ANOM_CROSS"] = {
        "full_address": {"value": "Border House 99, Delhi-UP Border"},
        "pin_code": {"value": "110094"},
        "state": {"value": "Delhi"}
    }
    
    # Voter 1 in New Delhi
    v_cross["Voter"]["V_ANOM_X1"] = {
        "name": {"value": "Delhi Resident"}, "age": {"value": 30}, "gender": {"value": "F"},
        "added_date": {"value": reg_date}, "constituency": {"value": "New Delhi"}, "epic_number": {"value": "EPIC_ANOM_X1"}
    }
    # Voter 2 in Varanasi
    v_cross["Voter"]["V_ANOM_X2"] = {
        "name": {"value": "Varanasi Resident"}, "age": {"value": 32}, "gender": {"value": "M"},
        "added_date": {"value": reg_date}, "constituency": {"value": "Varanasi"}, "epic_number": {"value": "EPIC_ANOM_X2"}
    }
    
    e_cross["Voter"]["V_ANOM_X1"] = {
        "REGISTERED_AT": {"Address": {"ADDR_ANOM_CROSS": {}}},
        "ASSIGNED_TO": {"Booth": {"BOOTH_ND_1": {}}}
    }
    e_cross["Voter"]["V_ANOM_X2"] = {
        "REGISTERED_AT": {"Address": {"ADDR_ANOM_CROSS": {}}},
        "ASSIGNED_TO": {"Booth": {"BOOTH_VAR_99": {}}} # This was the ID in seed_rest.py
    }
    
    print("Upserting Cross-Constituency Address...")
    print(upsert_data({"vertices": v_cross, "edges": e_cross}))

    # 4. Low-Linkage Anomaly (No Aadhaar)
    v_link = {"Voter": {}}
    e_link = {"Voter": {}}
    
    for i in range(5):
        vid = f"V_ANOM_NA_{i}"
        v_link["Voter"][vid] = {
            "name": {"value": f"Shadow User {i}"}, "age": {"value": 25+i}, "gender": {"value": "M"},
            "added_date": {"value": reg_date}, "constituency": {"value": "South Delhi"}, 
            "epic_number": {"value": f"EPIC_SHADOW_{i}"},
            "aadhaar_linked": {"value": False}
        }
        e_link["Voter"][vid] = {
            "ASSIGNED_TO": {"Booth": {"BOOTH_SD_1": {}}}
        }
    
    print("Upserting No-Aadhaar Anomaly...")
    print(upsert_data({"vertices": v_link, "edges": e_link}))

    print("\n--- ALL ANOMALIES SEEDED SUCCESSFULLY ---")

if __name__ == "__main__":
    main()
