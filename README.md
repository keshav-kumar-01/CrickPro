# 🏏 CricPro: AI-Powered Cricket Analytics & Telemetry Terminal

**CricPro** is an enterprise-grade, full-stack cricket analytics platform designed to bring broadcast-quality match prediction, historical data analysis, and live ball-by-ball ML telemetry straight to your browser. 

Built on a massive local database of **over 5 million historical deliveries**, CricPro leverages deep statistical modeling and machine learning to evaluate pitch degradation, simulate matches via Monte Carlo, and generate real-time win probabilities.

---

## ✨ Core Features

*   **🚀 Match Predictor AI**: Feed the engine a scenario (venue, teams, toss) and watch the ML model compute the projected win percentage.
*   **👤 Player Analysis**: Search through a comprehensive database of over 4,000+ global players. View their real-world aggregated runs, strike rates, wickets, economies, and custom generated capability radial-radars perfectly modeling their exact skill sets. 
*   **⚔️ Versus Mode (Head-to-Head)**: Drop two players into the ring. Overlay their radars and view absolute historical matchups (e.g., exactly how many times Mitchell Starc has bowled to Rohit Sharma, balls faced, and strike rate).
*   **🏟️ Stadiums & Pitch Intelligence**: Select any venue globally. Our Engine dynamically generates an **"AI Pitch Analysis"** evaluating the native 1st Innings Par Score, Toss Victory Dependency, and exact Pace vs. Spin Wicket splits.
*   **🎲 Monte Carlo Simulator**: Run any matchup 500, 1000, or 10,000 times natively in the browser to model stochastic volatility and variance in a T20 clash.
*   **🔴 Live Stream Telemetry**: Watch an asynchronous WebSocket feed generate live ball-by-ball commentary while plotting a massive tug-of-war visualization tracking real-time ML win probability drift based on the mathematically required run rate.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn UI, Recharts (Responsive D3 Charts), Lucide Icons.
*   **Backend**: Python, FastAPI, Asyncio, WebSockets.
*   **Database**: SQLite3 (Parsed from raw JSON ball-by-ball telemetry files).
*   **Machine Learning**: Scikit-Learn (Random Forest classification & Label Encoding), Pandas.

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)

### 1. Database Generation (Backend)
Navigate to the backend and install Python requirements. Run the ingestion scripts to build the SQLite datastore from the raw JSON match files:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Parse raw JSON deliveries into the Database
cd scripts
python parse_deliveries.py
```

### 2. Start the Backend API (FastAPI)
```bash
cd backend
uvicorn api.main:app --reload --port 8000
```

### 3. Start the Frontend Application (Next.js)
Open a new terminal session.
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser. 💥

---

## 🎯 Who Is This For?

*   **Cricket Analysts & Data Scientists**: For deep-diving into granular match statistics bypassing traditional slow APIs.
*   **Sports Bettors & Fantasy Enthusiasts**: Use Monte Carlo simulations and Head-to-Head matrices to formulate optimal DraftKings/Dream11 teams. 
*   **Developers**: A perfect blueprint on how to handle massive structured JSON extraction, integrate REST APIs alongside live WebSockets, and build a visually aggressive dark-mode SaaS UI. 

---

_Designed and engineered entirely completely from raw JSON telemetry to full-stack ML application._
