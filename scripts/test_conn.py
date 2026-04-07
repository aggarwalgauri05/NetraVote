import os
import pyTigerGraph as tg
from dotenv import load_dotenv

# Try to connect using pyTigerGraph and print details
HOST = "https://tg-ff37ebfe-4099-4784-9c48-0f3df5b4c804.tg-2635877100.i.tgcloud.io"
GRAPH = "vote"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWluYW51c2hyZWUyMDA1QGdtYWlsLmNvbSIsImlhdCI6MTc3NDk3NTMxOCwiZXhwIjoxNzgyNzUxMzIzLCJpc3MiOiJUaWdlckdyYXBoIn0.EsP1xIC0asrGwcCMxb_d80jieP1fTWbTUkDnGKNjLL0"

try:
    print(f"Connecting to {HOST}...")
    conn = tg.TigerGraphConnection(
        host=HOST,
        graphname=GRAPH,
        apiToken=TOKEN
    )
    # Test if token is valid
    print("Token test...")
    # conn.getToken(TOKEN) # This might be what's failing in their script internally
    print("Graph status check...")
    print(conn.getVertexTypes())
    print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {str(e)}")
