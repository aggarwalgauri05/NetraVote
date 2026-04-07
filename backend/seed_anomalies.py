
import os
import json
import requests
from dotenv import load_dotenv

# Load credentials
load_dotenv(dotenv_path="backend/.env")

TG_HOST = os.getenv("TG_HOST")
TG_GRAPHNAME = os.getenv("TG_GRAPHNAME", "vote")
TG_TOKEN = os.getenv("TG_TOKEN")

# Headers for REST API
HEADERS = {
    "Authorization": f"Bearer {TG_TOKEN}",
    "Content-Type": "application/json"
}

def upsert_vertex(vertex_type, vertex_id, attributes):
    url = f"{TG_HOST}/graph/{TG_GRAPHNAME}/vertices/{vertex_type}/{vertex_id}"
    payload = {"attributes": attributes}
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code == 200:
        print(f"Upserted {vertex_type} {vertex_id}")
    else:
        print(f"Failed {vertex_type} {vertex_id}: {response.text}")

def upsert_edge(source_type, source_id, edge_type, target_type, target_id, attributes=None):
    url = f"{TG_HOST}/graph/{TG_GRAPHNAME}/edges/{source_type}/{source_id}/{edge_type}/{target_type}/{target_id}"
    payload = {"attributes": attributes if attributes else {}}
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code == 200:
        print(f"Upserted Edge {edge_type} ({source_id} -> {target_id})")
    else:
        print(f"Failed Edge {edge_type}: {response.text}")

def seed_anomalies():
    print("\n--- Seeding Anomaly Combo ---")

    # 1. Impossible Family Tree (Son older than father)
    # New Delhi Constituency
    upsert_vertex("Voter", "VOTER_ANOM_F1", {
        "voter_name": "Father Fig", "age": 20, "gender": "M", "epic_id": "EPIC_F1",
        "constituency": "New Delhi", "added_date": "2024-01-01", "aadhaar_linked": True
    })
    upsert_vertex("Voter", "VOTER_ANOM_C1", {
        "voter_name": "Son Older", "age": 25, "gender": "M", "epic_id": "EPIC_C1",
        "constituency": "New Delhi", "added_date": "2024-01-01", "aadhaar_linked": True
    })
    upsert_edge("Voter", "VOTER_ANOM_F1", "FAMILY_OF", "Voter", "VOTER_ANOM_C1", {"relation_type": "PARENT_CHILD"})

    # 2. Multi-Booth Voter (Voter in both Booth 1 and Booth 2)
    # Using existing Booth IDs: BOOTH_ND_1 and BOOTH_SD_1
    upsert_vertex("Voter", "VOTER_ANOM_MB1", {
        "voter_name": "Two Booth Tony", "age": 45, "gender": "M", "epic_id": "EPIC_MB1",
        "constituency": "New Delhi", "added_date": "2024-01-15", "aadhaar_linked": True
    })
    upsert_edge("Voter", "VOTER_ANOM_MB1", "ASSIGNED_TO", "Booth", "BOOTH_ND_1")
    upsert_edge("Voter", "VOTER_ANOM_MB1", "ASSIGNED_TO", "Booth", "BOOTH_SD_1")

    # 3. Cross-Constituency Address Sharing
    # Address shared between New Delhi and Varanasi (extreme anomaly)
    upsert_vertex("Address", "ADDR_ANOM_CROSS", {
        "full_address": "Shared Portal House 101", "ward_no": 99, "booth_no": 1,
        "voter_density": 2, "density_flag": True
    })
    
    # Voter in New Delhi at this address
    upsert_vertex("Voter", "VOTER_ANOM_X1", {
        "voter_name": "Cross Delhi", "age": 30, "gender": "F", "epic_id": "EPIC_X1",
        "constituency": "New Delhi", "added_date": "2024-02-01", "aadhaar_linked": True
    })
    upsert_edge("Voter", "VOTER_ANOM_X1", "REGISTERED_AT", "Address", "ADDR_ANOM_CROSS")
    upsert_edge("Voter", "VOTER_ANOM_X1", "ASSIGNED_TO", "Booth", "BOOTH_ND_1")

    # Voter in Varanasi at this same address
    upsert_vertex("Voter", "VOTER_ANOM_X2", {
        "voter_name": "Cross Varanasi", "age": 32, "gender": "M", "epic_id": "EPIC_X2",
        "constituency": "Varanasi", "added_date": "2024-02-01", "aadhaar_linked": True
    })
    upsert_edge("Voter", "VOTER_ANOM_X2", "REGISTERED_AT", "Address", "ADDR_ANOM_CROSS")
    upsert_edge("Voter", "VOTER_ANOM_X2", "ASSIGNED_TO", "Booth", "BOOTH_VAR_1")

    # 4. No Aadhaar Flag (for high risk scores)
    upsert_vertex("Voter", "VOTER_ANOM_NA1", {
        "voter_name": "Shadow Voter", "age": 50, "gender": "F", "epic_id": "EPIC_NA1",
        "constituency": "South Delhi", "added_date": "2024-03-01", "aadhaar_linked": False
    })
    upsert_edge("Voter", "VOTER_ANOM_NA1", "ASSIGNED_TO", "Booth", "BOOTH_SD_1")

    print("\n--- Anomaly Seeding Finished ---")

if __name__ == "__main__":
    seed_anomalies()
