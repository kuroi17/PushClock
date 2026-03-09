# Phase 1: GitHub OAuth Implementation

## Goal

Add GitHub authentication to PushPilot so users can log in with their GitHub account and we can access their repositories.

## What We're Building

- Login with GitHub button
- OAuth callback handling
- Store user data in database
- Protected routes (backend)
- Auth state management (frontend)

## Steps

### 1. Set Up GitHub OAuth App

✅ Create OAuth App in GitHub

- Go to: https://github.com/settings/developers
- Click "New OAuth App"
- Settings:
  - Application name: PushPilot
  - Homepage URL: http://localhost:5173
  - Authorization callback URL: http://localhost:5000/auth/github/callback
- Copy Client ID and Client Secret

### 2. Backend Setup

- [ ] Install dependencies: `passport`, `passport-github2`, `express-session`
- [ ] Create auth routes
- [ ] Implement GitHub OAuth strategy
- [ ] Store user in database after login

### 3. Database Schema Update

- [ ] Create `users` table in Supabase
- [ ] Update existing tables to reference users

### 4. Frontend Setup

- [ ] Create Login page
- [ ] Add "Login with GitHub" button
- [ ] Handle OAuth redirect
- [ ] Store auth token/session
- [ ] Create protected route wrapper

### 5. Integration

- [ ] Connect frontend to backend auth
- [ ] Add logout functionality
- [ ] Show user info in navbar

## Database Schema Changes

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to schedules table
ALTER TABLE schedules ADD COLUMN user_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
```

## Environment Variables Needed

Backend (.env):

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=random_secret_string
FRONTEND_URL=http://localhost:5173
```

Frontend (.env):

```
VITE_API_URL=http://localhost:5000
```

## Testing Checklist

- [ ] User can click "Login with GitHub"
- [ ] Redirected to GitHub OAuth page
- [ ] After approval, redirected back to dashboard
- [ ] User info stored in database
- [ ] User can logout
- [ ] Protected routes work (redirect to login if not authenticated)
