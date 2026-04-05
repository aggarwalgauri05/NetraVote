# 🛡️ Anti-Gravity: Ghost Voter Network Detection System

> **NetraVote** — A production-grade, graph-powered electoral fraud detection platform built with TigerGraph, FastAPI, and React.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TigerGraph](https://img.shields.io/badge/TigerGraph-Savanna-blue)](https://tgcloud.io)
[![Python](https://img.shields.io/badge/Python-3.10+-green)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://react.dev)

---

## 🧠 Core Concept

Electoral roll data appears normal individually — but **graph intelligence reveals hidden fraud networks**.

NetraVote converts voter registration data into a connected graph, then applies multi-hop pattern analysis, community detection, and temporal analytics to expose:

- **Ghost Voter Clusters** — Fake identities registered en masse at single addresses
- **Cross-Constituency Networks** — Coordinated fraud rings spanning multiple regions  
- **Impossible Family Trees** — Sons older than fathers, and other biological impossibilities
- **Temporal Spikes** — Overnight bulk registration anomalies
- **Multi-Booth Enrollment** — Same voter registered at multiple polling stations
- **EPIC Number Duplication** — Identical or phonetically similar voter IDs

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐│
│  │ Network │ │Analytics │ │Forensics│ │ Timeline │ │Cross-Net││
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘│
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐            │
│  │Geo-Intel│ │  Ingest  │ │  Audit  │ │  Report  │            │
│  └─────────┘ └──────────┘ └─────────┘ └──────────┘            │
└──────────────────────┬───────────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼───────────────────────────────────────────┐
│                    BACKEND (FastAPI)                              │
│  ┌─────────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐ │
│  │Scoring Eng. │ │ ML Engine │ │Data Pipeline│ │PDF Generator │ │
│  │(7-signal)   │ │(IsolForest)│ │(OCR+Parse) │ │(ReportLab)   │ │
│  └─────────────┘ └───────────┘ └────────────┘ └──────────────┘ │
└──────────────────────┬───────────────────────────────────────────┘
                       │ GSQL Queries
┌──────────────────────▼───────────────────────────────────────────┐
│                  TIGERGRAPH SAVANNA                               │
│  Vertices: Voter, Address, Booth, Constituency, PinCode, Device  │
│  Edges: REGISTERED_AT, FAMILY_OF, DUPLICATE_OF, SHARES_ADDRESS   │
│  Algorithms: PageRank, Louvain, WCC, Betweenness Centrality     │
└──────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
GHOST-VOTER-NETWORK/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── NetworkGraph.jsx     # D3.js force-directed graph
│   │   │   ├── AnalyticsPanel.jsx   # Risk distribution charts
│   │   │   ├── ForensicsPanel.jsx   # Voter investigation registry
│   │   │   ├── TimelinePanel.jsx    # Temporal fraud intelligence
│   │   │   ├── CrossConstituencyPanel.jsx  # Multi-region detector
│   │   │   ├── GeoMapPanel.jsx      # Geo-spatial threat map
│   │   │   ├── BatchUploadPanel.jsx # Data ingestion pipeline UI
│   │   │   ├── AuditTrailPanel.jsx  # Immutable activity log
│   │   │   ├── WhistleblowerPanel.jsx  # Anonymous report portal
│   │   │   └── Sidebar.jsx          # Threat feed & cluster view
│   │   ├── App.jsx                  # Main application (9-tab nav)
│   │   └── index.css                # Design system + dark theme
│   └── package.json
│
├── backend/                         # FastAPI Backend
│   ├── main.py                      # API routes (20+ endpoints)
│   ├── mock_engine.py               # Synthetic demo data generator
│   ├── scoring_engine.py            # 7-signal risk scoring (0-100)
│   ├── ml_engine.py                 # Isolation Forest + GraphSAGE
│   ├── data_pipeline.py             # PDF parsing + OCR + dedup
│   ├── pdf_generator.py             # ECI evidence PDF reports
│   └── requirements.txt
│
├── tigergraph/                      # TigerGraph GSQL Layer
│   ├── schema.gsql                  # Graph schema (7 vertex, 10 edge types)
│   └── queries_detection.gsql       # 8 detection algorithms
│
├── server/                          # Express.js middleware proxy
│   └── index.js
│
└── scripts/                         # Data generation & utilities
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **TigerGraph Savanna** account (free tier works)

### 1. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The dashboard opens at `http://localhost:5173`. It works in **demo mode** by default — no backend required.

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure TigerGraph (optional — mock mode works without)
cp .env.example .env
# Edit .env with your TG_HOST, TG_TOKEN, TG_GRAPHNAME

python -m uvicorn main:app --reload --port 8000
```

### 3. TigerGraph Schema

```bash
# Run via TigerGraph GraphStudio or gsql CLI
cat tigergraph/schema.gsql | gsql
cat tigergraph/queries_detection.gsql | gsql
```

### 4. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TG_HOST` | TigerGraph hostname | _(empty)_ |
| `TG_TOKEN` | API auth token | _(empty)_ |
| `TG_GRAPHNAME` | Graph name | `vote` |
| `MOCK_FALLBACK` | Enable mock data | `true` |
| `PORT` | Backend port | `8000` |

---

## 🔍 Dashboard Modules (9 Tabs)

| Tab | Description |
|-----|-------------|
| **Network** | Interactive D3.js force-directed graph showing voter-address-booth topology |
| **Analytics** | Risk distribution charts, scoring breakdown, constituency comparison |
| **Forensics** | Voter investigation registry with search, filtering, and detailed profiles |
| **Timeline** | Temporal registration analysis with spike detection and year-by-year trends |
| **Cross-Net** | Cross-constituency fraud network detection with Louvain clustering |
| **Geo-Intel** | National threat heatmap with interactive India map and hotspot intelligence |
| **Ingest** | Drag-and-drop PDF upload with animated 6-step processing pipeline |
| **Audit** | Immutable, tamper-proof activity log with SHA-256 hashing |
| **Report** | Secure anonymous whistleblower portal with 3-step submission flow |

---

## 🧮 Risk Scoring Model (v3.2)

| Signal | Weight | Trigger |
|--------|--------|---------|
| Address Overcrowding | 30% | >10 voters at same address |
| EPIC Duplication | 25% | Identical or phonetically similar EPIC numbers |
| Impossible Family | 20% | Son older than father, extreme age gaps |
| No Aadhaar Link | 15% | Voter not linked to Aadhaar identity |
| Multi-Booth | 15% | Same voter in multiple polling stations |
| Temporal Anomaly | 10% | Bulk registration spike (>5× average) |
| Cross-Pincode | 10% | Same address mapped to multiple pincodes |

**Classification:** 0-30 (Clean) · 31-59 (Watch) · 60-79 (Suspicious) · 80-100 (Ghost Voter)

---

## 📊 GSQL Detection Queries

1. `detect_overcrowded_addresses` — Address density analysis with PageRank
2. `detect_duplicate_voters` — Soundex + Levenshtein phonetic matching
3. `detect_impossible_families` — Age-gap verification in family graphs
4. `detect_temporal_fraud` — Time-window spike detection
5. `detect_multi_booth` — Cross-booth enrollment detection
6. `detect_cross_constituency_network` — Louvain + WCC community detection
7. `full_constituency_scan` — Complete multi-signal analysis
8. `get_ui_network` — Frontend-optimized graph data API

---

## 🛡️ Security Features

- **Anonymous Whistleblower Portal** — Zero-knowledge reporting with SHA-256 hashed references
- **Audit Trail** — Tamper-proof activity log with cryptographic hashing
- **Classification Headers** — "TOP SECRET — FOR OFFICIAL USE ONLY" on all exports
- **Token-based Auth** — TigerGraph API token authentication
- **Mock Data Isolation** — Demo mode completely isolated from production data

---

## 🤖 ML Pipeline

- **Isolation Forest** — Unsupervised anomaly detection on voter feature vectors
- **GraphSAGE Embeddings** — Node embedding generation for similarity detection
- **Heuristic Fallback** — Rule-based scoring when ML models unavailable
- **Feature Engineering** — 12-dimensional feature vector per voter

---

## 📄 Export Formats

- **JSON Evidence Package** — Complete forensic data with metadata and classification
- **PDF ECI Report** — Formal Election Commission evidence document via ReportLab
- **CSV** — Tabular voter data export

---

## 🏢 Built By

**Anti-Gravity Systems** — ECI Certified Electoral Intelligence Technology

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

> ⚠️ **Disclaimer:** All data in demo mode is synthetic. This system is designed for authorized election monitoring use only.
