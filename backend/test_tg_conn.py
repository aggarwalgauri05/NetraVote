import os
import pyTigerGraph as tg
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
TOKEN = os.getenv("TG_TOKEN")

print(f"Testing connection to {HOST} / {GRAPH}")
try:
    conn = tg.TigerGraphConnection(host=HOST, graphname=GRAPH)
    conn.apiToken = TOKEN
    conn.useToken = True
    count = conn.getVertexCount("Voter")
    print(f"Successfully connected! Voter count: {count}")
except Exception as e:
    print(f"Failed to connect: {e}")
