# PushClock Backend API

Backend service for PushClock - GitHub Push Scheduler

## Tech Stack

- Node.js + Express
- Supabase (PostgreSQL)
- node-schedule (cron jobs)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Go to https://supabase.com and create a project
2. Go to Project Settings → API
3. Copy your Project URL and anon key
4. Update `.env` file with your credentials

### 3. Create Database Table

1. Go to Supabase SQL Editor
2. Run the SQL from `database/schema.sql`

### 4. Start Server

```bash
npm start
```

Or use nodemon for development:

```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Schedules

- `GET /api/schedule` - Get all schedules
- `GET /api/schedule/:id` - Get single schedule
- `POST /api/schedule` - Create new schedule
- `PUT /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule

### Example Request

```bash
curl -X POST http://localhost:5000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "repo_path": "C:/Users/Dev/Projects/my-app",
    "branch": "main",
    "push_time": "2026-03-10T14:30:00"
  }'
```

## Project Structure

```
backend/
├── config/
│   └── supabase.js       # Supabase client setup
├── controllers/
│   └── scheduleController.js  # API logic
├── routes/
│   └── scheduleRoutes.js      # API routes
├── services/
│   └── schedulerService.js    # Cron job logic
├── database/
│   └── schema.sql             # Database schema
├── index.js                   # Main server file
├── package.json
└── .env
```

## How It Works

1. Server starts and loads all scheduled pushes from Supabase
2. Each schedule is registered as a cron job
3. At the scheduled time, the server executes `git push` via child_process
4. Status is updated in the database (completed/error)
5. Frontend fetches and displays the data in real-time
