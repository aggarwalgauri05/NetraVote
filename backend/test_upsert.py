import requests, os, json
from dotenv import load_dotenv

load_dotenv()
HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

payload = {
    "vertices": {
        "Voter": {
            "V_TEST_1": {
                "name": {"value": "Test Voter"},
                "age": {"value": 25},
                "gender": {"value": "M"},
                "added_date": {"value": "2024-03-15 10:00:00"},
                "constituency": {"value": "New Delhi"}
            }
        }
    },
    "edges": {
        "Voter": {
            "V_TEST_1": {
                "REGISTERED_AT": {"Address": {"ADDR_ND_GHOST": {}}},
                "ASSIGNED_TO": {"Booth": {"BOOTH_ND_1": {}}}
            }
        }
    }
}

url = f"{HOST}/restpp/graph/{GRAPH}"
headers = {"Authorization": f"Bearer {TOKEN}"}
resp = requests.post(url, json=payload, headers=headers)
print("Response:", resp.json())
