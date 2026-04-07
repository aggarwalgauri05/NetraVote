import requests
import json
import os
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

# Seed basic structure
v_const = {
    "Constituency": {
        "New Delhi": {"const_name": {"value": "New Delhi"}, "state": {"value": "Delhi"}},
        "South Delhi": {"const_name": {"value": "South Delhi"}, "state": {"value": "Delhi"}},
        "Varanasi": {"const_name": {"value": "Varanasi"}, "state": {"value": "Uttar Pradesh"}}
    }
}

e_belongs = {
    "Booth": {
        "BOOTH_ND_1": {"BELONGS_TO": {"Constituency": {"New Delhi": {}}}},
        "BOOTH_SD_1": {"BELONGS_TO": {"Constituency": {"South Delhi": {}}}},
        "BOOTH_VAR_99": {"BELONGS_TO": {"Constituency": {"Varanasi": {}}}}
    }
}

print("Upserting basic structure...")
print(upsert_data({"vertices": v_const}))
print(upsert_data({"edges": e_belongs}))

# Now Scenario A: 35 voters
v_voters = {}
e_voters = {}

v_voters["Address"] = {
    "ADDR_ND_GHOST": {
        "full_address": {"value": "Flat 101, Block C, Green Park, New Delhi"},
        "pin_code": {"value": "110016"},
        "state": {"value": "Delhi"},
        "voter_density": {"value": 35},
        "density_flag": {"value": True}
    }
}

v_voters["Voter"] = {}
e_voters["Voter"] = {}

from datetime import datetime
reg_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

for i in range(35):
    vid = f"V_ND_{1000+i}"
    v_voters["Voter"][vid] = {
        "name": {"value": f"Voter {i}"},
        "age": {"value": 20 + (i % 50)},
        "gender": {"value": "M" if i % 2 == 0 else "F"},
        "added_date": {"value": reg_date},
        "constituency": {"value": "New Delhi"}
    }
    e_voters["Voter"][vid] = {
        "REGISTERED_AT": {"Address": {"ADDR_ND_GHOST": {}}},
        "ASSIGNED_TO": {"Booth": {"BOOTH_ND_1": {}}}
    }

import random # already imported? No, let's check. 
# ... (already imported requests, json, os, datetime)

# Add Scenario B: 5 pairs of duplicates
v_duplicates = {"Voter": {}, "Address": {}}
e_duplicates = {"Voter": {}}

duplicate_names = ["Arjun Sharma", "Priya Singh", "Amit Kumar", "Sonia Gandhi", "Rahul Verma"]
for i, name in enumerate(duplicate_names):
    addr_id = f"ADDR_SD_DUP_{i}"
    v_duplicates["Address"][addr_id] = {
        "full_address": {"value": f"H.No {i*10}, Saket, New Delhi"},
        "pin_code": {"value": "110017"},
        "state": {"value": "Delhi"}
    }
    for j in range(2):
        vid = f"V_SD_DUP_{i}_{j}"
        v_duplicates["Voter"][vid] = {
            "name": {"value": name},
            "age": {"value": 30 + i},
            "gender": {"value": "M" if j==0 else "F"},
            "added_date": {"value": reg_date},
            "constituency": {"value": "South Delhi"}
        }
        e_duplicates["Voter"][vid] = {
            "REGISTERED_AT": {"Address": {addr_id: {}}},
            "ASSIGNED_TO": {"Booth": {"BOOTH_SD_1": {}}}
        }

print("Upserting Scenario B...")
print(upsert_data({"vertices": v_duplicates, "edges": e_duplicates}))

# Add Scenario C: 50 voters spike in Varanasi
v_spike = {"Voter": {}}
e_spike = {"Voter": {}}
spike_date = "2024-03-15 10:00:00"

for i in range(50):
    vid = f"V_VAR_SPIKE_{i}"
    v_spike["Voter"][vid] = {
        "name": {"value": f"Varanasi_Voter_{i}"},
        "age": {"value": random.randint(18, 90)},
        "gender": {"value": random.choice(["M", "F"])},
        "added_date": {"value": spike_date},
        "constituency": {"value": "Varanasi"}
    }
    e_spike["Voter"][vid] = {
        "ASSIGNED_TO": {"Booth": {"BOOTH_VAR_99": {}}}
    }

print("Upserting Scenario C...")
print(upsert_data({"vertices": v_spike, "edges": e_spike}))
