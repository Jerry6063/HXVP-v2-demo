# Photography Studio Web Portal

A full-stack photography studio management platform with four role-based portals.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Axios
- **Backend:** Django 5, Django REST Framework, SimpleJWT
- **Database:** SQLite (dev) / PostgreSQL (production)

## Quick Start

### 1. Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cd backend
python3 manage.py migrate
python3 seed.py          # Load sample data
python3 manage.py runserver 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Demo Credentials

All passwords: `password123`

| Portal     | Email               |
|------------|---------------------|
| Production | admin@studio.com    |
| Client     | client@brandco.com  |
| Talent     | talent1@studio.com  |
| Crew       | crew1@studio.com    |

## Portals

### Production Portal (`/production/`)
- **Dashboard** — Active projects, revenue, upcoming shoots, model roster
- **Active Projects** — Tabbed project detail (workflow, team, assets, budget, contracts, activity log)
- **Models & Talent** — Grid view with type/availability filters
- **Production Crew** — Stats, roster table, upcoming assignments
- **Archived** — Past projects

### Client Portal (`/client/`)
- Project status, shoot schedule, talent selection
- Deliverable review and approval
- Project timeline

### Talent Portal (`/talent/`)
- Accept/decline bookings
- Call sheet details (location, time, wardrobe, hair/makeup)
- Contracts and earnings sidebar

### Crew Portal (`/crew/`)
- Accept/decline assignments
- Call sheet details
- Contracts and earnings sidebar

## API Endpoints

| Prefix              | Description            |
|---------------------|------------------------|
| `/api/auth/`        | Login, register, JWT   |
| `/api/projects/`    | Projects and shoots    |
| `/api/talent/`      | Talent profiles/bookings |
| `/api/crew/`        | Crew profiles/assignments/equipment |
| `/api/deliverables/`| Deliverables/contracts |
| `/api/finance/`     | Expenses and earnings  |

## Switching to PostgreSQL

1. Start PostgreSQL: `docker compose up -d db`
2. Set env: `export DB_ENGINE=postgresql`
3. Run migrations: `cd backend && python manage.py migrate`
4. Seed: `python seed.py`
