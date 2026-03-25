# Photography Studio Web Portal

A full-stack photography studio management platform with four role-based portals.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Axios
- **Backend:** Django 5, Django REST Framework, SimpleJWT
- **Database:** PostgreSQL (managed by Render)

> **Note:** This project is configured for deployment on [Render](https://render.com) and is not intended for local hosting. The backend requires Render-managed environment variables (`DATABASE_URL`, `DJANGO_SECRET_KEY`, etc.) and the frontend requires `VITE_API_BASE_URL` to be set to the deployed backend URL.

## Deployment (Render Blueprint)

The entire stack — backend API, frontend static site, and PostgreSQL database — is defined in `render.yaml` and deployed as a Render Blueprint.

1. Fork or push this repository to GitHub.
2. In the Render dashboard, go to **New → Blueprint** and connect the repository.
3. Render will automatically create:
   - `hxvp-backend` — Django/Gunicorn web service
   - `hxvp-frontend` — Vite static site
   - `hxvp-db` — Managed PostgreSQL database
4. After the initial deploy, set the following environment variables in the Render dashboard:
   - On **hxvp-backend**: `CORS_ALLOWED_ORIGINS` → the deployed frontend URL (e.g. `https://hxvp-frontend.onrender.com`)
   - On **hxvp-frontend**: `VITE_API_BASE_URL` → the deployed backend URL + `/api` (e.g. `https://hxvp-backend.onrender.com/api`)
5. Optionally configure email (Gmail SMTP) on the backend service: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`.
6. Trigger a redeploy of both services after setting the env vars.

The `backend/build.sh` script runs automatically on each deploy: it installs dependencies, collects static files, and applies database migrations.

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


