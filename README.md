# A/D CTF Command Center

A centralized, full-stack Command & Control (C2) dashboard designed for Attack/Defense Capture The Flag (A/D CTF) competitions. Built with a focus on speed, security, and strict adherence to typical CTF competition rules (e.g., zero active scanning, restricted SSH interactions).

## Features

- **Dashboard**: High-level overview with key metrics, active fetcher status, and quick access to external tools (like the competition Scoreboard).
- **Target Matrix**: Passive IP grid generation for all teams. Calculates enemy and NPC IPs mathematically without performing any active network scanning.
- **Vulnboxes Management**: Manage your team's infrastructure. Includes SSH command generation, Docker service auto-discovery, manual service overrides, and artifact downloading. Enforces strict IP validation to prevent accidental interaction with non-team infrastructure.
- **Flag IDs Intelligence**: Background async fetcher that periodically gathers Flag ID intelligence from the game API, with built-in rate limiting. Includes a filterable and paginated data table.
- **Tools**: CRUD interface for managing external tool links and bookmarks.
- **Settings**: Persistent game configuration (Team ID, Token, SSH password, tick rate) with masked secrets.

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLModel (SQLite via `aiosqlite`), `asyncssh`, `httpx`. Layered architecture.
- **Frontend**: React (Vite), Tailwind CSS v4. Cyberpunk/glassmorphism aesthetic.
- **Infrastructure**: Docker & Docker Compose (multi-stage builds, Nginx reverse proxy).

## Getting Started

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js 22+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Deployment (Production / Docker)

The easiest way to run the Command Center is via Docker Compose.

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd ad_panel
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your specific Team ID, tokens, and game URLs
   ```

3. Start the services:
   ```bash
   docker compose up -d --build
   ```

4. Access the dashboard:
   Navigate to `http://localhost` in your browser.

### Local Development

**Backend (API)**
```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Web)**
```bash
cd web
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Security & Game Rules Compliance

This Command Center is built to respect standard A/D CTF rules:
- **Zero Active Scanning**: Features like the Target Matrix rely entirely on passive mathematical generation (`10.6x.y.z`). No `nmap` or `ping` sweeps are performed.
- **SSH Restrictions**: SSH automations (like service discovery or artifact downloading) are strictly bound to the defending team's IP subnet (`10.6x.<TEAM_ID>.1`).
- **Rate Limiting**: Background intelligence gathering respects the configured game tick (`GAME_TICK_SECONDS`) to avoid overwhelming competition APIs.
