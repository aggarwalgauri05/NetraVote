import asyncio
from httpx import AsyncClient

async def run():
    async with AsyncClient() as client:
        r = await client.get("http://localhost:8000/graph/network/New Delhi")
        data = r.json()
        print("Nodes:", len(data.get("nodes", [])))
        print("Edges:", len(data.get("edges", [])))
        
asyncio.run(run())
