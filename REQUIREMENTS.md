# Requirements Specification: A/D CTF Command Center (Web UI)

## 1. Project Overview
This project is a lightweight, web-based Command and Control (C2) dashboard designed for an Attack/Defense Capture The Flag (CTF) competition. The tool provides a centralized UI to manage defending infrastructure, track enemy targets, gather intelligence, and maintain a repository of external tool URLs. 

**Target Tech Stack:** * **Backend:** Python (FastAPI) + Async HTTP/SSH libraries (e.g., `asyncssh`, `httpx`).
* **Frontend:** React (with a lightweight UI library like Tailwind CSS or Material UI).
* **Database:** SQLite (via SQLAlchemy or SQLModel) for portability.

## 2. Core Modules & Features

### 2.1 Configuration & Database Management
The backend must maintain an SQLite database to store dynamic game state, preventing data loss if the container or script restarts.
* **Core Config Table:** Stores `TEAM_ID`, `TEAM_TOKEN` (for APIs), `SSH_PASSWORD`, and `GAME_TICK_SECONDS` (120s).
* **Tools Table:** A database table to store custom URLs for external tools (e.g., the external flag submitter, traffic analyzers). 
    * *UI Requirement:* The frontend must have a "Tools" page to dynamically Create, Read, Update, and Delete (CRUD) these links during the game.

### 2.2 Network & Target Matrix (Passive Viewing)
Calculate and display the network matrix strictly based on the game's mathematical routing rules.
* **Target Formula:** `10.6x.y.1` where `x` is the `vulnbox_id` (0-9) and `y` is the `team_id`.
* **Enemy Targets:** Generate and display the theoretical IPs for all opposing teams in a grid or list.
    * *Constraint:* This is **strictly passive**. The backend MUST NOT ping, scan, or connect to enemy IPs. Just generate the IP string (e.g., `10.60.2.1`) so the human user can copy-paste it.
    * *Consederations:* As the services will be the same for all teams, then the panel may assume and display the same services names on each IP by knowing the own team's services names and their ports.
* **NPC Targets:** Generate IPs for NPC teams at `10.6x.0.1` and `10.6x.1.1` (display only).

### 2.3 SSH & Defender Infrastructure Management
A dedicated view for the team's own vulnerable machines (`10.6x.<TEAM_ID>.1`). The UI should greedily assume the existence of up to 10 vulnboxes (IDs 0-9) and display them. If a box isn't online yet, connection attempts will just fail safely.
* **One-Click SSH Strings:** For every vulnbox, display a pre-formatted SSH command (e.g., `ssh root@10.60.<TEAM_ID>.1`) with a "Copy to Clipboard" button for instant terminal access.
* **Smart Challenge Discovery:** When triggered via the UI, the backend should connect to a specific vulnbox via SSH and run `docker ps --format "{{.Names}} - {{.Ports}}"`. Parse this output to display the running challenge names and their exposed ports on the dashboard.
* **Manual Overrides:** In case a challenge is not containerized (e.g., `systemd`), provide a UI form to manually map a challenge name and port to a specific vulnbox ID.
* **Artifact Downloader:** A UI button that triggers the backend to recursively download challenge files, `docker-compose.yml`, and `deploy.sh` from a specific vulnbox to the backend's local disk via SFTP/SCP, making them available as a `.zip` download in the browser.

### 2.4 Intelligence Gatherer (Flag IDs)
Fetch and display target metadata to assist with manual exploitation.
* **API Endpoint:** `GET http://10.10.0.1:8081/flagIds`
* **Logic:** A background task should periodically fetch the Flag IDs and store them in the database.
* **UI View:** A searchable, filterable data table in the frontend to query Flag IDs by `service`, `team`, or `round` always ordered from newest to oldest.

## 3. Strict Safety & Competition Constraints
**CRITICAL FOR AI AGENTS:** The generated code MUST adhere to the following guardrails:
1.  **Passive Enemy Interaction:** Do not write any code that initiates connections (SSH, HTTP, ICMP) to enemy teams or NPC teams.
2.  **No Automated Scanners:** Do not implement Nmap, masscan, or any automated port discovery against the broader network.
3.  **Scope Restrictions:** Backend operations (like the Docker auto-discovery and SSH artifact downloader) must hardcode restrictions to only allow connections to `10.6x.<TEAM_ID>.1`. 

## 4. Suggested Implementation Steps (For Vibecoding)
1.  **Step 1:** Scaffold the SQLite database models (Config, Tools, Services) and the FastAPI CRUD endpoints.
2.  **Step 2:** Build the React frontend with the "Tools" dashboard to test full-stack connectivity.
3.  **Step 3:** Implement the Target Matrix generation logic (pure math/string generation) and display it on the frontend.
4.  **Step 4:** Implement the SSH module. Start with generating the copy-paste strings, then add the `asyncssh` execution for the `docker ps` auto-discovery command.
5.  **Step 5:** Integrate the Flag ID API consumer and display the parsed data in the UI.