# PushClock - GitHub Scheduled Merge & Push Automation 🚀

**PushClock** is a full-stack automation tool that lets you schedule real GitHub branch merges and pushes at specific dates and times. It is designed for teams and individuals who want to automate contribution graphs, coordinate releases, or enforce time-based code delivery. Built with Node.js, Express, Supabase, GitHub OAuth, and a modern React (Vite) frontend.

## 🎯 Features

- **GitHub OAuth Integration**: Securely connect your GitHub account
- **Add Repositories**: Register any accessible GitHub repo for scheduling
- **Branch-to-Branch Merge Scheduling**: Schedule merges from a source branch (e.g., feature/temp) to a target branch (e.g., main)
- **Date & Time Scheduling**: Pick exact UTC date and time for automatic merges
- **Dashboard View**: Monitor all scheduled merges and their statuses
- **Automatic Execution**: Merges execute automatically at scheduled times using the GitHub API
- **Edit & Cancel**: Modify or remove scheduled merges as needed
- **Error Handling & Logging**: See detailed error messages and merge results
- **Expandable Repo Cards**: Click to view merge details, errors, and history
- **Multi-Repo Support**: Manage multiple repositories from one dashboard
- **Secure Backend**: All sensitive operations require authentication

## 🏗️ Project Structure

```
PushClock/
 ├─ frontend-vite/           # React + Vite + Tailwind CSS frontend
 │   ├─ src/
 │   │   ├─ components/      # AddRepoForm.jsx, RepoCard.jsx, etc.
 │   │   ├─ pages/           # Dashboard.jsx, AddSchedule.jsx, Login.jsx
 │   │   ├─ services/        # API, GitHub, Auth helpers
 │   │   └─ ...
 │   └─ package.json
 ├─ backend/                 # Node.js + Express + Supabase backend
 │   ├─ config/              # supabase.js, passport.js
 │   ├─ controllers/         # scheduleController.js
 │   ├─ routes/              # scheduleRoutes.js, githubRoutes.js, authRoutes.js
 │   ├─ services/            # mergeService.js, schedulerService.js, githubService.js
 │   ├─ database/            # schema-phaseX.sql (Supabase/PostgreSQL)
 │   └─ ...
 ├─ package.json             # Root dependencies (axios, etc.)
 └─ README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+) or yarn
- GitHub account (for OAuth)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/PushClock.git
cd PushClock
```

### 2. Setup the backend

```bash
cd backend
npm install
```

1. Create a Supabase project (https://supabase.com)
2. Copy your Supabase URL and anon key to backend/.env
3. Run the SQL in backend/database/schema-phaseX.sql (latest phase) in Supabase SQL Editor
4. Set up GitHub OAuth app and add credentials to .env

Start the backend server:

```bash
npm start
# or for development:

```

Backend runs at http://localhost:5000

### 3. Setup the frontend

```bash
cd ../frontend-vite
npm install
npm run dev
```

## Frontend runs at http://localhost:5173

## 🛠️ Technology Stack

### Frontend

- **React** (Vite) - UI library
- **Tailwind CSS** - Styling
- **React Router** - Routing

### Backend

- **Node.js** + **Express** - API server
- **Supabase (PostgreSQL)** - Database
- **node-schedule** - Task scheduling
- **GitHub OAuth** - Secure authentication
- **Axios** - GitHub API requests

## 📋 Current Status

### ✅ Completed

- Full backend API (Express.js, Supabase, GitHub OAuth)
- Real scheduled merges via GitHub API
- Dashboard with live status, error/success details
- Edit, cancel, and reschedule merges
- Error handling and detailed logging
- Modern, responsive frontend (React + Vite + Tailwind)
- Multi-repo and multi-branch support

### 🚧 In Progress / Next

- Rollback/undo merge feature
- Merge preview/diff before scheduling
- Email/in-app notifications
- Approval workflow for merges
- Push/merge history log

## 🎨 UI Preview & Features

- **Modern Gradient Design** - Blue to indigo color scheme
- **Responsive Layout** - Desktop and mobile friendly
- **Interactive Repo Cards** - Expand for merge details, errors, and logs
- **Real-time Notifications** - Success, error, warning, info
- **Statistics Dashboard** - Scheduled, completed, failed merges

## 🔧 Development Workflow

- Frontend: Add components in frontend-vite/src/components/
- Backend: Add routes/controllers/services in backend/
- Use Tailwind CSS for styling
- Use .env files for secrets (never commit them)
- Use Supabase SQL Editor for DB migrations

## 📝 API Overview

### Auth

- `GET /api/auth/github` - Start GitHub OAuth
- `GET /api/auth/callback` - OAuth callback

### Schedules

- `GET /api/schedule` - Get all schedules for user
- `GET /api/schedule/:id` - Get single schedule
- `POST /api/schedule` - Create new schedule
- `PUT /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule

#### Example POST body

```json
{
  "repo_owner": "your-username",
  "repo_name": "your-repo",
  "source_branch": "feature-branch",
  "target_branch": "main",
  "commit_message": "Scheduled merge via PushClock",
  "push_time": "2026-03-11T14:30:00Z"
}
```

### Response fields

- `status`: pending | completed | error
- `error_message`: error details if merge fails

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ by **kuroi17** and contributors

## 🎯 Next Steps

1. Rollback/undo merge feature
2. Merge preview/diff before scheduling
3. Email/in-app notifications
4. Approval workflow for merges
5. Push/merge history log
6. More robust error handling and analytics

---

**Happy Scheduling & Merging! 🚀**
