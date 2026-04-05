import axios from 'axios';
import fs from 'fs';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYWluYW51c2hyZWUyMDA1QGdtYWlsLmNvbSIsImlhdCI6MTc3NDk3NTMxOCwiZXhwIjoxNzgyNzUxMzIzLCJpc3MiOiJUaWdlckdyYXBoIn0.EsP1xIC0asrGwcCMxb_d80jieP1fTWbTUkDnGKNjLL0';
const HOST = 'https://tg-ff37ebfe-4099-4784-9c48-0f3df5b4c804.tg-2635877100.i.tgcloud.io';
const GRAPH = 'vote';

const API = axios.create({
  baseURL: `${HOST}/restpp`,
  headers: { 'Authorization': `Bearer ${TOKEN}` }
});

async function loadBatch(type, data) {
  try {
    const payload = { vertices: { [type]: data } };
    const res = await API.post(`/graph/${GRAPH}`, payload);
    console.log(`Loaded ${data.length} ${type} nodes:`, res.data.accepted_vertices);
  } catch (err) {
    console.error(`Error loading ${type}:`, err.response?.data || err.message);
  }
}

async function loadEdges(data) {
  try {
    const payload = { edges: {} };
    data.forEach(e => {
      if (!payload.edges[e.from_type]) payload.edges[e.from_type] = {};
      if (!payload.edges[e.from_type][e.from_id]) payload.edges[e.from_type][e.from_id] = {};
      if (!payload.edges[e.from_type][e.from_id][e.type]) payload.edges[e.from_type][e.from_id][e.type] = {};
      payload.edges[e.from_type][e.from_id][e.type][e.to_type] = { [e.to_id]: e.attributes || {} };
    });
    const res = await API.post(`/graph/${GRAPH}`, payload);
    console.log(`Loaded ${data.length} edges:`, res.data.accepted_edges);
  } catch (err) {
    console.error(`Error loading edges:`, err.response?.data || err.message);
  }
}

async function generateAndLoad() {
  console.log('🚀 Generating Winning Dataset for NetraVote...');

  const booths = [];
  const pins = [];
  const addresses = [];
  const voters = [];
  const families = [];
  const edges = [];

  // 1. PINs
  pins.push({ id: '110001', code: '110001' });
  pins.push({ id: '110002', code: '110002' });

  // 2. Booths
  for (let i = 1; i <= 5; i++) {
    const bId = `BOOTH-${i}`;
    booths.push({ id: bId, booth_name: `Booth #${i} - Central Delhi`, constituency: 'New Delhi' });
    edges.push({ from_type: 'Booth', from_id: bId, to_type: 'PinCode', to_id: '110001', type: 'BOOTH_LOCATED_IN' });
  }

  // 3. Fraud Hub 1: The "Ghost Apartment"
  const hub1 = 'ADDR-HUB-101';
  addresses.push({ id: hub1, full_address: 'Flat 404, Ghost Enclave, CP', building_name: 'Ghost Enclave', street: 'Connaught Place' });
  edges.push({ from_type: 'Address', from_id: hub1, to_type: 'PinCode', to_id: '110001', type: 'LOCATED_IN' });

  for (let i = 1; i <= 200; i++) {
    const vId = `V-GHOST-1-${i}`;
    voters.push({
      id: vId,
      name: `Ghost User ${i}`,
      age: 20 + (i % 30),
      gender: i % 2 === 0 ? 'M' : 'F',
      epic_number: `EPIC-FAKE-A${1000 + i}`,
      registration_date: '2023-11-20 10:00:00'
    });
    edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Address', to_id: hub1, type: 'LIVES_AT' });
    edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Booth', to_id: 'BOOTH-1', type: 'REGISTERED_IN' });
  }

  // 4. Fraud Hub 2: The "Godown"
  const hub2 = 'ADDR-HUB-202';
  addresses.push({ id: hub2, full_address: 'Godown 7, Near Palika', building_name: 'Godown', street: 'Palika Bazaar' });
  edges.push({ from_type: 'Address', from_id: hub2, to_type: 'PinCode', to_id: '110001', type: 'LOCATED_IN' });

  for (let i = 1; i <= 120; i++) {
    const vId = `V-GHOST-2-${i}`;
    voters.push({
      id: vId,
      name: `Phantom ${i}`,
      age: 18 + (i % 40),
      gender: 'M',
      epic_number: `EPIC-FAKE-B${2000 + i}`,
      registration_date: '2023-11-21 14:30:00'
    });
    edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Address', to_id: hub2, type: 'LIVES_AT' });
    edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Booth', to_id: 'BOOTH-2', type: 'REGISTERED_IN' });
  }

  // 5. Normal Voters (to provide background noise)
  for (let i = 1; i <= 30; i++) {
    const aId = `ADDR-NORM-${i}`;
    addresses.push({ id: aId, full_address: `House ${i}, Janpath`, street: 'Janpath' });
    edges.push({ from_type: 'Address', from_id: aId, to_type: 'PinCode', to_id: '110002', type: 'LOCATED_IN' });

    for (let j = 1; j <= 4; j++) {
      const vId = `V-NORM-${i}-${j}`;
      voters.push({
        id: vId,
        name: `Citizen ${i}-${j}`,
        age: 18 + j * 10,
        gender: j % 2 === 0 ? 'F' : 'M',
        epic_number: `EPIC-REAL-${3000 + i * 10 + j}`,
        registration_date: '2015-06-15 00:00:00'
      });
      edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Address', to_id: aId, type: 'LIVES_AT' });
      edges.push({ from_type: 'Voter', from_id: vId, to_type: 'Booth', to_id: `BOOTH-${(i % 5) + 1}`, type: 'REGISTERED_IN' });
    }
  }

  console.log('📦 Loading into TigerGraph...');
  await loadBatch('PinCode', pins);
  await loadBatch('Booth', booths);
  await loadBatch('Address', addresses);

  // Load voters in chunks of 100
  for (let i = 0; i < voters.length; i += 100) {
    await loadBatch('Voter', voters.slice(i, i + 100));
  }

  // Load edges in chunks of 200
  for (let i = 0; i < edges.length; i += 200) {
    await loadEdges(edges.slice(i, i + 200));
  }

  console.log('✅ Dataset loaded successfully.');
}

generateAndLoad();
