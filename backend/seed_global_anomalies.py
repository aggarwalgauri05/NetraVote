
import requests
import json
import os
import random
from datetime import datetime
from dotenv import load_dotenv

# Load env from backend/.env
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
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def main():
    print("\n--- 👁️  SEEDING GLOBAL ANOMALIES FOR ALL CONSTITUENCIES ---")
    
    # Get all constituencies
    const_url = f"{HOST}/restpp/graph/{GRAPH}/vertices/Constituency"
    headers = {"Authorization": f"Bearer {TOKEN}"}
    r = requests.get(const_url, headers=headers)
    constituencies = [v["v_id"] for v in r.json().get("results", [])]
    
    # Get all booths to map them
    booth_url = f"{HOST}/restpp/graph/{GRAPH}/vertices/Booth"
    r = requests.get(booth_url, headers=headers)
    booths_raw = r.json().get("results", [])
    
    const_booth_map = {}
    for b in booths_raw:
        c = b["attributes"]["constituency"]
        if c not in const_booth_map:
            const_booth_map[c] = []
        const_booth_map[c].append(b["v_id"])

    # We use a mix of years for the timeline to look good
    years = ["2020", "2021", "2022", "2023", "2024"]

    for constituency in constituencies:
        print(f"\n📍 Processing Constituency: {constituency}")
        
        target_booths = const_booth_map.get(constituency, [])
        if not target_booths:
            print(f"⚠️  No booths found for {constituency}, skipping...")
            continue
            
        primary_booth = target_booths[0]
        
        v_data = {"Voter": {}, "Address": {}, "Booth": {}}
        e_data = {"Voter": {}}
        
        prefix = constituency[:3].upper().replace(" ","")
        
        # 1. Impossible Family (Parent younger than Child)
        fid = f"V_{prefix}_PAR_ANOM"
        cid = f"V_{prefix}_CHD_ANOM"
        y_fam = random.choice(years)
        v_data["Voter"][fid] = {
            "name": {"value": f"Young Parent {constituency}"}, "age": {"value": 21}, "gender": {"value": "M"},
            "added_date": {"value": f"{y_fam}-05-12 10:00:00"}, "constituency": {"value": constituency}, 
            "epic_number": {"value": f"EPIC_{prefix}_P1"}, "risk_score": {"value": 0.95}
        }
        v_data["Voter"][cid] = {
            "name": {"value": f"Old Child {constituency}"}, "age": {"value": 26}, "gender": {"value": "F"},
            "added_date": {"value": f"{y_fam}-05-12 10:00:00"}, "constituency": {"value": constituency}, 
            "epic_number": {"value": f"EPIC_{prefix}_C1"}, "risk_score": {"value": 0.95}
        }
        e_data["Voter"][fid] = {
            "FAMILY_OF": {"Voter": {cid: {"relation_type": {"value": "PARENT_CHILD"}}}},
            "ASSIGNED_TO": {"Booth": {primary_booth: {}}},
            "REGISTERED_AT": {"Address": {f"ADDR_{prefix}_FAM": {}}}
        }
        e_data["Voter"][cid] = {
            "ASSIGNED_TO": {"Booth": {primary_booth: {}}},
            "REGISTERED_AT": {"Address": {f"ADDR_{prefix}_FAM": {}}}
        }
        v_data["Address"][f"ADDR_{prefix}_FAM"] = {
            "full_address": {"value": f"Anomalous House 1, {constituency}"}, "pin_code": {"value": "110001"}
        }

        # 2. Address Overloading Hub (60 voters at same address - triggers CRITICAL)
        hub_addr_id = f"ADDR_{prefix}_HUB"
        v_data["Address"][hub_addr_id] = {
            "full_address": {"value": f"Ghost Hub Apartments, {constituency}"},
            "pin_code": {"value": "110001"},
            "voter_density": {"value": 60}
        }
        for i in range(60):
            vid = f"V_{prefix}_HUB_{i}"
            y_hub = random.choice(years)
            v_data["Voter"][vid] = {
                "name": {"value": f"Synthetic Voter {i}"}, "age": {"value": 20+i%40}, "gender": {"value": random.choice(["M","F"])},
                "added_date": {"value": f"{y_hub}-01-01 12:00:00"}, "constituency": {"value": constituency}, 
                "epic_number": {"value": f"EPIC_{prefix}_H{i}"}, "risk_score": {"value": 0.88}
            }
            if vid not in e_data["Voter"]: e_data["Voter"][vid] = {}
            e_data["Voter"][vid]["REGISTERED_AT"] = {"Address": {hub_addr_id: {}}}
            e_data["Voter"][vid]["ASSIGNED_TO"] = {"Booth": {primary_booth: {}}}

        # 3. Duplicate EPIC / Duplicate Voter (DUPLICATE_OF edge) + HUB Address
        hub_addr_id = f"ADDR_{prefix}_HUB"
        d1 = f"V_{prefix}_DUP_1"
        d2 = f"V_{prefix}_DUP_2"
        y_dup = random.choice(years)
        v_data["Voter"][d1] = {
            "name": {"value": f"Ghost Duplicate One {constituency}"}, "age": {"value": 40}, "gender": {"value": "M"},
            "added_date": {"value": f"{y_dup}-03-15 09:00:00"},
            "epic_number": {"value": f"EPIC_{prefix}_SAME"}, "risk_score": {"value": 0.99},
            "aadhaar_linked": {"value": False}, "constituency": {"value": constituency}
        }
        v_data["Voter"][d2] = {
            "name": {"value": f"Ghost Duplicate Two {constituency}"}, "age": {"value": 41}, "gender": {"value": "M"},
            "added_date": {"value": f"{y_dup}-03-15 09:00:00"},
            "epic_number": {"value": f"EPIC_{prefix}_SAME"}, "risk_score": {"value": 0.99},
            "aadhaar_linked": {"value": False}, "constituency": {"value": constituency}
        }
        e_data["Voter"][d1] = {
            "DUPLICATE_OF": {"Voter": {d2: {}}},
            "ASSIGNED_TO": {"Booth": {primary_booth: {}}},
            "REGISTERED_AT": {"Address": {hub_addr_id: {}}}
        }
        e_data["Voter"][d2] = {
            "ASSIGNED_TO": {"Booth": {primary_booth: {}}},
            "REGISTERED_AT": {"Address": {hub_addr_id: {}}}
        }
        v_data["Address"][f"ADDR_{prefix}_DUP"] = {
            "full_address": {"value": f"Shared Identity Lane, {constituency}"}, "pin_code": {"value": "110009"}
        }

        # 4. Multi-Booth Fraud
        if len(target_booths) > 1 or len(constituencies) > 1:
            mb_vid = f"V_{prefix}_MB_ANOM"
            y_mb = random.choice(years)
            v_data["Voter"][mb_vid] = {
                "name": {"value": f"Multi Booth Expert {constituency}"}, "age": {"value": 35}, "gender": {"value": "M"},
                "added_date": {"value": f"{y_mb}-11-20 14:00:00"}, "constituency": {"value": constituency}, 
                "epic_number": {"value": f"EPIC_{prefix}_MB"}, "risk_score": {"value": 0.92}
            }
            if mb_vid not in e_data["Voter"]: e_data["Voter"][mb_vid] = {}
            
            # Link to two different booths
            second_booth = target_booths[1] if len(target_booths) > 1 else "BOOTH_SD_1" if primary_booth != "BOOTH_SD_1" else "BOOTH_ND_1"
            e_data["Voter"][mb_vid]["ASSIGNED_TO"] = {
                "Booth": {
                    primary_booth: {},
                    second_booth: {}
                }
            }
            e_data["Voter"][mb_vid]["REGISTERED_AT"] = {"Address": {f"ADDR_{prefix}_MB": {}}}
            v_data["Address"][f"ADDR_{prefix}_MB"] = {
                "full_address": {"value": f"Split Residence 55, {constituency}"}, "pin_code": {"value": "110005"}
            }

        # 4. Booth Level Anomaly Flag
        v_data["Booth"][primary_booth] = {
            "anomaly_score": {"value": 0.82},
            "overnight_flag": {"value": True}
        }

        print(f"📤 Upserting anomalies for {constituency}...")
        res = upsert_data({"vertices": v_data, "edges": e_data})
        print(f"✅ Result: {res.get('message', 'Success')}")

    print("\n--- ALL GLOBAL ANOMALIES SEEDED ---")

if __name__ == "__main__":
    main()
