import os
import pyTigerGraph as tg
from dotenv import load_dotenv

load_dotenv('backend/.env')
HOST = os.getenv("TG_HOST")
GRAPH = os.getenv("TG_GRAPHNAME")
SECRET = os.getenv("TG_SECRET")

conn = tg.TigerGraphConnection(host=HOST, graphname=GRAPH, gsqlSecret=SECRET)
conn.getToken(SECRET)

with open('tigergraph/queries.gsql', 'r') as f:
    queries = f.read()

print("Installing via PyTigerGraph...")
res = conn.gsql(queries)
print(res)
