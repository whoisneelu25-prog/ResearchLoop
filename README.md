# ResearchLoop 🧬

> **AI-Powered Biomedical Research Intelligence Platform**  
> Turn past research into the next research direction.

ResearchLoop analyzes published biomedical evidence, extracts contradictory findings and negative outcomes, exposes evidence gaps, and formulates high-opportunity next-step research directions.

---

## 🌟 Key Capabilities

- **Literature Intelligence & Evidence Extraction**: Ingests and standardizes clinical studies from PubMed and Europe PMC with real PMIDs, DOIs, study designs, sample sizes, and biomarker stratifications.
- **Negative Findings & Failure Detection**: Surfaces null primary endpoints, failed replications, and early trial terminations with objective scientific terminology.
- **Contradiction Resolution Engine**: Dissects conflicting clinical trials across contributing factors (subgroups, biomarkers, dosing protocols, endpoints).
- **Evidence Gap Identification**: Quantifies literature depth into *What is Known*, *What is Uncertain*, and *What is Missing*.
- **Research Directions & Opportunity Scoring**: Ranks hypotheses using a transparent, multi-factor scoring formula:
  $$\text{Opportunity Score} = (\text{Novelty} \times 0.3) + (\text{Gap Severity} \times 0.3) + (\text{Feasibility} \times 0.2) + (\text{Impact} \times 0.2)$$
- **Interactive Knowledge Graph**: Visualizes disease-drug-biomarker-trial networks with interactive filtering and node inspection.
- **ResearchLoop Copilot**: Grounded AI assistant answering clinical questions with verbatim, clickable source citations.
- **What-If Condition Simulator**: Models outcome distributions and potential gaps when varying biomarker statuses or patient cohorts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React, Recharts, @xyflow/react
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite / PostgreSQL, Pydantic v2
- **AI & RAG Engine**: Multi-tier Semantic Recognition, Context-Aware Grounding, Structured Prompting
- **Deployment**: Vercel (Frontend), Railway / Render / Fly.io (Backend)

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI development server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

```bash
# Run backend pytest suite
export PYTHONPATH=backend
pytest backend/tests/ -v

# Run frontend build check
cd frontend && npm run build
```

---

## 📄 License

MIT License. Developed for biomedical researchers, clinicians, and data scientists.
