import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

let mcpConfig = {};
try {
  const configPath = 'C:/Users/Anushree Jain/.gemini/antigravity/mcp_config.json';
  if (fs.existsSync(configPath)) {
    mcpConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))?.mcpServers?.tigergraph?.env || {};
  }
} catch (e) { console.error("Could not load mcp_config.json", e.message); }

const TG_HOST = 'https://tg-ff37ebfe-4099-4784-9c48-0f3df5b4c804.tg-2635877100.i.tgcloud.io';
const GRAPH = 'vote';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWluYW51c2hyZWUyMDA1QGdtYWlsLmNvbSIsImlhdCI6MTc3NDk3NTMxOCwiZXhwIjoxNzgyNzUxMzIzLCJpc3MiOiJUaWdlckdyYXBoIn0.EsP1xIC0asrGwcCMxb_d80jieP1fTWbTUkDnGKNjLL0';

// Function to format TigerGraph REST UPSERT payloads
async function upsertGraphData(vertices, edges) {
  const url = `${TG_HOST}/restpp/graph/${GRAPH}`;
  const payload = {};
  
  if (vertices && Object.keys(vertices).length > 0) payload.vertices = vertices;
  if (edges && Object.keys(edges).length > 0) payload.edges = edges;

  console.log(`Sending Payload: ${Object.keys(payload.vertices || {}).length} vertex types`);

  try {
    const res = await axios.post(url, payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
    console.log('Upsert Success:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Upsert Failed:', err.response?.data || err.message);
  }
}

async function seedData() {
  console.log('Generating Ghost Voter Data for "New Delhi"...');

  // The power of the demo relies on specific fraudulent patterns
  // Pattern 1: A massive cluster of voters on one address within a few days
  
  const vertices = {
    "Address": {},
    "Voter": {},
    "Booth": {},
    "PinCode": {}
  };
  const edges = {
    "Address": {},
    "Voter": {},
    "Booth": {}
  };

  // 1. Setup Static Booths and Pins for New Delhi
  vertices["Booth"]["B-ND-101"] = { 
    "id": { value: "B-ND-101" }, 
    "booth_name": { value: "Connaught Place Primary School" }, 
    "constituency": { value: "New Delhi" } 
  };
  vertices["Booth"]["B-ND-102"] = { 
    "id": { value: "B-ND-102" }, 
    "booth_name": { value: "Parliament Street Station Block" }, 
    "constituency": { value: "New Delhi" } 
  };

  vertices["PinCode"]["110001"] = { "id": { value: "110001" }, "code": { value: "110001" } };
  vertices["PinCode"]["110002"] = { "id": { value: "110002" }, "code": { value: "110002" } };

  // Associate Booth with Pincode
  edges["Booth"]["B-ND-101"] = { "BOOTH_LOCATED_IN": { "PinCode": { "110001": {} } } };
  edges["Booth"]["B-ND-102"] = { "BOOTH_LOCATED_IN": { "PinCode": { "110002": {} } } };

  // 2. The Fraud Pattern: 80 fake voters registered to a single small address (e.g. A tiny apartment)
  const FRAUD_ADDRESS = "ADDR-FRAUD-999";
  vertices["Address"][FRAUD_ADDRESS] = {
    "id": { value: FRAUD_ADDRESS },
    "full_address": { value: "Flat 4B, Shivalik Apartments, Connaught Place" },
    "building_name": { value: "Shivalik Apartments" },
    "street": { value: "Connaught Place" }
  };
  edges["Address"][FRAUD_ADDRESS] = { "LOCATED_IN": { "PinCode": { "110001": {} } } };
  
  for(let i = 1; i <= 80; i++) {
    const vId = `VOTER-FRAUD-${i}`;
    vertices["Voter"][vId] = {
      "id": { value: vId },
      "name": { value: `Rahul Kumar ${i}` }, // Extremely generic synthetic name
      "age": { value: 20 + (i%30) }, // Ages vary from 20 to 50
      "gender": { value: "M" },
      "epic_number": { value: `EPIC-FAKE-${10000+i}` },
      "registration_date": { value: "2023-11-01 10:00:00" } // Spike in registrations
    };

    // Link Voter to Address and Booth
    edges["Voter"][vId] = {
      "LIVES_AT": {
        "Address": {
          [FRAUD_ADDRESS]: { since: { value: "2023-11-01 10:00:00" } }
        }
      },
      "REGISTERED_IN": {
        "Booth": {
          "B-ND-101": {} // All register locally to rig that specific booth
        }
      }
    };
  }

  // 3. Normal Data for background noise (so the fraud cluster stands out visually)
  for(let b=1; b<=5; b++) {
    const normalAddr = `ADDR-NORM-${b}`;
    vertices["Address"][normalAddr] = {
        "id": { value: normalAddr },
        "full_address": { value: `House ${b}, Regular Street, ND` },
        "building_name": { value: "Independent House" },
        "street": { value: "Regular Street" }
    };
    edges["Address"][normalAddr] = { "LOCATED_IN": { "PinCode": { "110002": {} } } };

    // Standard 3-5 person families
    const familySize = Math.floor(Math.random() * 3) + 2;
    for(let f=1; f<=familySize; f++){
        const vId = `VOTER-NORM-${b}-${f}`;
        vertices["Voter"][vId] = {
            "id": { value: vId },
            "name": { value: `Citizen ${b}-${f}` },
            "age": { value: 25 + f*5 },
            "gender": { value: f%2===0?"F":"M" },
            "epic_number": { value: `EPIC-REAL-${b}${f}` },
            "registration_date": { value: "2018-05-12 00:00:00" } 
        };
        edges["Voter"][vId] = {
            "LIVES_AT": {
                "Address": {
                    [normalAddr]: { since: { value: "2018-05-12 00:00:00" } }
                }
            },
            "REGISTERED_IN": {
                "Booth": {
                    "B-ND-102": {}
                }
            }
        };
    }
  }

  // Send to Tigergraph
  await upsertGraphData(vertices, edges);
  console.log("Mock data pushed to TigerGraph successfully.");
}

seedData();
