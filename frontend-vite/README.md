# PushClock Frontend (React + Vite)

Frontend for PushClock - GitHub Push Scheduler

## Features

- Schedule GitHub branch merges
- Rollback (undo) completed merges
- View and manage scheduled pushes
- User Activity & Audit Log: See all your actions (create, update, delete, rollback) in the dashboard

## Project Structure

```
frontend-vite/
├── src/
│   ├── components/
│   │   ├── RepoCard.jsx         # Card for each scheduled push
│   │   ├── ActivityLog.jsx      # User activity log display
│   │   └── ...                  # Other UI components
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard page
│   │   └── ...                  # Other pages
│   ├── services/
│   │   └── api.js               # API calls to backend
│   └── ...
├── public/
├── package.json
└── README.md
```

## How Folders Work Together

- **components/**: Reusable UI elements (RepoCard, ActivityLog, etc). Used in pages to build the UI.
- **pages/**: Main screens/routes (Dashboard, etc). Compose components and handle page logic.
- **services/**: API calls to backend. `api.js` contains functions for schedule and activity log endpoints.
- **public/**: Static assets.
- **package.json**: Project dependencies and scripts.

## How Activity Log Works

1. Backend logs all user actions (create, update, delete, rollback) in the activity_logs table.
2. Frontend calls `/api/activity-logs` via `activityLogAPI.getAll()`.
3. ActivityLog component displays the log in the Dashboard.

## Usage

1. Start backend server (see backend/README.md)
2. Start frontend:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 and log in
4. View scheduled pushes and activity log in Dashboard
