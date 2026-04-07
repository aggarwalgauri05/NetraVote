import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')
HOST = os.getenv("TG_HOST")
TOKEN = os.getenv("TG_TOKEN")

with open('tigergraph/queries.gsql', 'r') as f:
    queries = f.read()

# using the /gsqlserver/gsql/file endpoint
url = f"{HOST}/gsqlserver/gsql/file"
headers = {"Authorization": f"Bearer {TOKEN}"}

print("Installing queries (this may take a minute)...")
r = requests.post(url, headers=headers, data=queries)
print(r.status_code)
print(r.text[:500])
