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
- `POST /api/schedule/:id/rollback` - Rollback (undo) a completed merge

### Activity Logs (Audit Log)

- `GET /api/activity-logs` - Get user activity logs (create, update, delete, rollback actions)

### Example Request

```bash
curl -X GET http://localhost:5000/api/activity-logs \
  -H "Cookie: ..." # Must be authenticated
```

## Project Structure

```
backend/
├── config/
│   └── supabase.js       # Supabase client setup
├── controllers/
│   ├── scheduleController.js  # Schedule API logic
│   └── activityLogController.js # Activity log API logic
├── routes/
│   ├── scheduleRoutes.js      # Schedule API routes
│   └── activityLogRoutes.js   # Activity log API routes
├── services/
│   ├── schedulerService.js    # Cron job logic
│   └── activityLogService.js  # Audit log writing logic
├── database/
│   ├── schema.sql             # Main DB schema
│   └── schema-activity-logs.sql # Activity log schema
├── index.js                   # Main server file
├── package.json
└── .env
```

## How Backend Folders Work Together

- **controllers/**: Handle API logic. Each controller defines the business logic for an endpoint (e.g., scheduleController handles scheduling, activityLogController handles audit log queries).
- **services/**: Contain reusable business logic and helpers. For example, schedulerService manages cron jobs, activityLogService writes audit log entries.
- **routes/**: Define API endpoints and map them to controllers. E.g., scheduleRoutes.js maps `/api/schedule` endpoints to scheduleController methods.
- **config/**: Setup for external services (Supabase, Passport, etc).
- **database/**: SQL files for schema and migrations.
- **index.js**: Main server entry point. Registers routes, middleware, and starts the server.

## How It Works

1. Server starts and loads all scheduled pushes from Supabase.
2. Each schedule is registered as a cron job (via schedulerService).
3. At the scheduled time, the server executes the merge/rollback logic and updates status in the database.
4. All key actions (create, update, delete, rollback) are logged in the activity_logs table.
5. Frontend fetches schedules and activity logs via API and displays them in real-time.
